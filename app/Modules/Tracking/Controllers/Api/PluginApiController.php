<?php

namespace App\Modules\Tracking\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tracking\TrackingContainer;
use App\Models\Tracking\TrackingEventLog;
use App\Modules\Tracking\Services\Channels\GA4MeasurementProtocolService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * PluginApiController — External API for WP/Shopify plugins.
 *
 * Stateless, API-key authenticated endpoints that plugins call:
 *  - POST /verify    → Connection test + return container config
 *  - POST /events    → Server-side event forwarding (GA4 MP + Meta CAPI + TikTok EA)
 *  - GET  /health    → Container health + latency + destination status
 *  - GET  /logs      → Last N events for admin monitor widget
 *  - POST /settings/sync → Cloud config backup
 */
class PluginApiController extends Controller
{
    // ── Connection Verify ─────────────────────────────────────

    /**
     * POST /api/tracking/plugin/verify
     * Verify API key and return container config.
     */
    public function verify(Request $request)
    {
        $container = $this->resolveContainer($request);
        if (!$container) {
            return response()->json(['success' => false, 'message' => 'Invalid API key'], 401);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'container_id'   => $container->container_id,
                'domain'         => $container->domain,
                'is_active'      => $container->is_active,
                'power_ups'      => $container->power_ups ?? [],
                'plugin_version' => '1.0.0',
                'server_time'    => now()->toISOString(),
            ],
        ]);
    }

    // ── Server-Side Events ────────────────────────────────────

    /**
     * POST /api/tracking/plugin/events
     * Receive server-side events from WP plugin and forward to destinations.
     */
    public function events(Request $request)
    {
        $container = $this->resolveContainer($request);
        if (!$container) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'client_id' => 'required|string|max:255',
            'user_id'   => 'nullable|string|max:255',
            'events'    => 'required|array|min:1|max:20',
            'events.*.name'   => 'required|string|max:100',
            'events.*.params' => 'required|array',
        ]);

        $source    = $request->header('X-PM-Source', 'wordpress');

        // ---- NEW HIGH-THROUGHPUT KAFKA INGESTION ROADWAY (PHASE 2) ----
        if (env('KAFKA_ENABLED', false) === true || env('KAFKA_ENABLED') === 'true') {
            try {
                // Resolve the tenant mathematically from the container's bound domain
                $tenantId = null;
                if (!empty($container->domain)) {
                    $tenant = \App\Models\Tenant::where('domain', $container->domain)->first();
                    $tenantId = $tenant ? $tenant->id : null;
                }

                $payload = [
                    'tenant_id'    => $tenantId, // Essential for Multi-DB separation by Consumers
                    'container_id' => $container->id,
                    'client_id'    => $validated['client_id'],
                    'user_id'      => $validated['user_id'] ?? null,
                    'source'       => $source,
                    'ip_address'   => $request->ip(),
                    'user_agent'   => $request->userAgent(),
                    'events'       => $validated['events'],
                ];
                
                app(\App\Modules\Tracking\Services\KafkaProducerService::class)->publishEvent($payload, $validated['client_id']);
                
                return response()->json([
                    'success'   => true,
                    'processed' => count($validated['events']),
                    'errors'    => [],
                    'pipeline'  => 'kafka-broker'
                ]);
            } catch (\Exception $e) {
                Log::error("Kafka offload failed, falling back to MySQL: " . $e->getMessage());
                // Fallthrough to MySQL native logic on Kafka failure
            }
        }
        // ---------------------------------------------------------------

        $processed = 0;
        $errors    = [];

        foreach ($validated['events'] as $event) {
            try {
                // Log the event
                $log = TrackingEventLog::create([
                    'container_id' => $container->id,
                    'event_type'   => $event['name'],
                    'event_data'   => $event['params'],
                    'client_id'    => $validated['client_id'],
                    'user_id'      => $validated['user_id'] ?? null,
                    'source'       => $source,
                    'ip_address'   => $request->ip(),
                    'user_agent'   => $request->userAgent(),
                    'status_code'  => 200,
                ]);

                // Forward to registered destinations
                $this->forwardToDestinations($container, $event, $validated, $request);

                $processed++;
            } catch (\Exception $e) {
                Log::warning('Plugin event processing failed', [
                    'container' => $container->id,
                    'event'     => $event['name'],
                    'error'     => $e->getMessage(),
                ]);
                $errors[] = $event['name'] . ': ' . $e->getMessage();
            }
        }

        return response()->json([
            'success'   => true,
            'processed' => $processed,
            'errors'    => $errors,
        ]);
    }

    // ── Health Check ──────────────────────────────────────────

    /**
     * GET /api/tracking/plugin/health
     * Container health with destination status.
     */
    public function health(Request $request)
    {
        $container = $this->resolveContainer($request);
        if (!$container) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $cacheKey = "pm_health_{$container->id}";
        $health = Cache::remember($cacheKey, 120, function () use ($container) {
            $destinations = $container->destinations()
                ->select('id', 'type', 'name', 'is_active')
                ->get()
                ->map(fn($d) => [
                    'name'      => $d->name,
                    'type'      => $d->type,
                    'is_active' => $d->is_active,
                    'status'    => $d->is_active ? 'ok' : 'paused',
                ]);

            $eventsToday = $container->eventLogs()
                ->whereDate('created_at', today())
                ->count();

            $recentErrors = $container->eventLogs()
                ->where('status_code', '>=', 400)
                ->where('created_at', '>=', now()->subHours(24))
                ->count();

            return [
                'container' => [
                    'id'           => $container->container_id,
                    'name'         => $container->name,
                    'is_active'    => $container->is_active,
                    'docker_status' => $container->docker_status,
                ],
                'destinations'  => $destinations,
                'events_today'  => $eventsToday,
                'errors_24h'    => $recentErrors,
                'checked_at'    => now()->toISOString(),
            ];
        });

        return response()->json(['success' => true, 'data' => $health]);
    }

    // ── Event Logs ────────────────────────────────────────────

    /**
     * GET /api/tracking/plugin/logs
     * Recent event logs for admin monitor widget.
     */
    public function logs(Request $request)
    {
        $container = $this->resolveContainer($request);
        if (!$container) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $limit = min((int) $request->query('limit', 50), 100);
        $type  = $request->query('type'); // Optional filter

        $query = $container->eventLogs()->latest();

        if ($type) {
            $query->where('event_type', $type);
        }

        $logs = $query->limit($limit)->get()->map(fn($log) => [
            'id'         => $log->id,
            'event_type' => $log->event_type,
            'source'     => $log->source,
            'status'     => $log->status_code < 400 ? 'ok' : 'error',
            'status_code' => $log->status_code,
            'client_id'  => $log->client_id,
            'created_at' => $log->created_at->toISOString(),
        ]);

        return response()->json(['success' => true, 'data' => $logs]);
    }

    // ── Settings Sync ─────────────────────────────────────────

    /**
     * POST /api/tracking/plugin/settings/sync
     * Cloud backup of plugin settings.
     */
    public function syncSettings(Request $request)
    {
        $container = $this->resolveContainer($request);
        if (!$container) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'settings'       => 'required|array',
            'plugin_version' => 'required|string|max:20',
            'site_url'       => 'required|url|max:500',
            'platform'       => 'required|string|in:wordpress,shopify,generic',
        ]);

        // Store in container settings
        $container->update([
            'settings' => array_merge($container->settings ?? [], [
                'plugin_sync' => [
                    'settings'       => $validated['settings'],
                    'plugin_version' => $validated['plugin_version'],
                    'site_url'       => $validated['site_url'],
                    'platform'       => $validated['platform'],
                    'synced_at'      => now()->toISOString(),
                ],
            ]),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Settings synced',
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────

    /**
     * Resolve container from API key in Authorization header.
     * Supports both Container-specific Secret and Global Account Secret.
     */
    private function resolveContainer(Request $request): ?TrackingContainer
    {
        $token = $request->bearerToken()
            ?? $request->header('X-PM-Api-Key')
            ?? $request->query('api_key');

        if (empty($token)) {
            return null;
        }

        // 1. Try Direct Container Secret (Original logic)
        $container = TrackingContainer::where('api_secret', $token)
            ->where('is_active', true)
            ->first();

        if ($container) {
            return $container;
        }

        // 2. Try Global Account Secret (Master Key)
        $tenant = \App\Models\Tenant::where('api_key', $token)->first();
        if ($tenant) {
            $containerId = $request->header('X-PM-Container-Id');
            
            $query = TrackingContainer::where('tenant_id', $tenant->id)
                ->where('is_active', true);

            if ($containerId) {
                $query->where('container_id', $containerId);
            }

            return $query->first();
        }

        return null;
    }

    /**
     * Forward event to all active destinations.
     */
    private function forwardToDestinations(
        TrackingContainer $container,
        array $event,
        array $validated,
        Request $request
    ): void {
        $destinations = $container->destinations()->where('is_active', true)->get();

        foreach ($destinations as $destination) {
            try {
                // Dispatch async job for each destination
                $enrichedEvent = array_merge($event, [
                    'client_id'  => $validated['client_id'] ?? null,
                    'user_id'    => $validated['user_id'] ?? null,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);

                dispatch(new \App\Modules\Tracking\Jobs\ForwardToDestinationJob(
                    $destination->id,
                    $enrichedEvent,
                    $container->settings['mappings'] ?? null,
                    $container->settings['power_ups'] ?? null
                ))->onQueue('tracking');
            } catch (\Exception $e) {
                Log::warning("Failed to dispatch to {$destination->type}", [
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
