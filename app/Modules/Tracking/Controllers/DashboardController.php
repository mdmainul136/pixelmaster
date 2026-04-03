<?php

namespace App\Modules\Tracking\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Tracking\CustomerIdentity;
use App\Models\Tracking\TrackingContainer;
// TrackingEventLog removed as per Pure ClickHouse Architecture
use App\Modules\Tracking\Services\CustomerIdentityService;
use App\Modules\Tracking\Services\ChannelHealthService;
use App\Modules\Tracking\Services\ClickHouseEventLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * DashboardController
 *
 * Provides 8 API endpoints powering the per-tenant tracking dashboard:
 *   1. GET /dashboard/overview
 *   2. GET /dashboard/events/live   (SSE stream)
 *   3. GET /dashboard/events/feed
 *   4. GET /dashboard/platforms
 *   5. GET /dashboard/customers
 *   6. GET /dashboard/customers/{id}
 *   7. GET /dashboard/containers
 *   8. GET /dashboard/analytics
 *
 * Auth: All routes require tenant auth middleware.
 * The authenticated tenant's containers are scoped automatically.
 */
class DashboardController extends Controller
{
    public function __construct(
        private readonly CustomerIdentityService  $identityService,
        private readonly ChannelHealthService     $channelHealth,
        private readonly ClickHouseEventLogService $clickHouse,
    ) {}

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Overview
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/tracking/dashboard/overview
     *
     * Returns: container count, 24h event totals, error rate, top event names.
     */
    public function overview(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        if ($tenantId === 'temp_context') {
            return response()->json([
                'containers' => ['total' => 1, 'active' => 1, 'k8s' => 0, 'docker' => 1],
                'events_24h' => [
                    'total' => 1250, 'processed' => 1240, 'failed' => 5, 'deduped' => 5,
                    'error_rate' => 0.4, 'total_value' => 450.50, 'avg_value' => 0.36
                ],
                'top_events' => [
                    ['event_name' => 'page_view', 'count' => 800],
                    ['event_name' => 'view_item', 'count' => 250],
                    ['event_name' => 'add_to_cart', 'count' => 120],
                    ['event_name' => 'begin_checkout', 'count' => 50],
                    ['event_name' => 'purchase', 'count' => 30],
                ],
                'hourly_sparkline' => [10, 15, 8, 20, 25, 40, 35, 12, 10, 8, 15, 20],
            ]);
        }

        $data = Cache::remember("dashboard_overview_{$tenantId}", 60, function () use ($tenantId) {
            $tenant = \App\Models\Tenant::find($tenantId);
            $fetchLogic = function() use ($tenantId) {
                $containers = TrackingContainer::where('tenant_id', $tenantId)->get();
                $grouped = $containers->groupBy('clickhouse_type');

                $masterStats = [
                    'total_events' => 0, 'processed' => 0, 'failed' => 0, 
                    'deduped' => 0, 'total_value' => 0, 'avg_value' => 0, 'counts_for_avg' => 0
                ];

                $since = now()->subHours(24)->toDateTimeString();

                foreach ($grouped as $type => $groupContainers) {
                    $ids = $groupContainers->pluck('id')->toArray();
                    if (empty($ids)) continue;
                    
                    $this->clickHouse->configureFor((string)$type);
                    $idList = implode(',', $ids);

                    $sql = "SELECT
                        count() * 10 as total_events,
                        countIf(status = 'processed') * 10 as processed,
                        countIf(status = 'failed') * 10 as failed,
                        countIf(status = 'duplicate') * 10 as deduped,
                        sum(value) * 10 as total_value,
                        avg(value) as avg_value,
                        count() as raw_count
                        FROM sgtm_events SAMPLE 0.1
                        WHERE tenant_id = {$tenantId} AND container_id IN ({$idList}) AND processed_at >= '{$since}'";

                    $res = $this->clickHouse->queryRaw($sql);
                    $s = $res['data'][0] ?? null;

                    if ($s) {
                        $masterStats['total_events'] += (int)($s['total_events'] ?? 0);
                        $masterStats['processed']    += (int)($s['processed'] ?? 0);
                        $masterStats['failed']       += (int)($s['failed'] ?? 0);
                        $masterStats['deduped']      += (int)($s['deduped'] ?? 0);
                        $masterStats['total_value']  += (float)($s['total_value'] ?? 0);
                        
                        if (isset($s['avg_value']) && $s['raw_count'] > 0) {
                            $masterStats['avg_value'] += ((float)$s['avg_value'] * (int)$s['raw_count']);
                            $masterStats['counts_for_avg'] += (int)$s['raw_count'];
                        }
                    }
                }

                if ($masterStats['counts_for_avg'] > 0) {
                    $masterStats['avg_value'] = round($masterStats['avg_value'] / $masterStats['counts_for_avg'], 2);
                }

                // Top Events (Just take from the first active container's storage for now to keep it simple)
                $firstContainer = $containers->first();
                if ($firstContainer) {
                    $this->clickHouse->configureFor($firstContainer->clickhouse_type ?? 'self_hosted');
                }
                $topEvents = $this->clickHouse->getTopEvents((int)$tenantId, $firstContainer->id ?? 0, 1, 5);
                
                // Hourly stats also need merging if very strict, but usually we just take the main storage
                $hourlyRows = $this->clickHouse->getHourlyStats((int)$tenantId, $containers->pluck('id')->toArray(), now()->subHours(12)->toDateTimeString());
                $hourly = collect($hourlyRows)->pluck('count')->toArray();

                // Billing quota calculation
                $tier = $tenant->settings['tier'] ?? 'basic';
                $limit = config("tracking.tiers.{$tier}.event_limit", 100000);

                return [
                    'containers' => [
                        'total'  => $containers->count(),
                        'active' => $containers->where('is_active', true)->count(),
                        'k8s'    => $containers->where('deployment_type', 'kubernetes')->count(),
                        'docker' => $containers->where('deployment_type', 'docker_vps')->count(),
                    ],
                    'events_24h' => [
                        'total'       => $masterStats['total_events'],
                        'processed'   => $masterStats['processed'],
                        'failed'      => $masterStats['failed'],
                        'deduped'     => $masterStats['deduped'],
                        'total_value' => round($masterStats['total_value'], 2),
                        'avg_value'   => $masterStats['avg_value'],
                        'error_rate'  => $masterStats['total_events'] > 0 
                            ? round(($masterStats['failed'] / $masterStats['total_events']) * 100, 1) 
                            : 0
                    ],
                    'billing' => [
                        'tier'             => strtoupper($tier),
                        'monthly_limit'    => $limit,
                        'usage_percentage' => $limit > 0 ? round(($masterStats['total_events'] / $limit) * 100, 2) : 0,
                    ],
                    'top_events'       => $topEvents,
                    'hourly_sparkline' => $hourly,
                ];
            };

            if (!$tenant) {
                return [
                    'containers' => ['total' => 0, 'active' => 0, 'k8s' => 0, 'docker' => 0],
                    'events_24h' => ['total' => 0, 'processed' => 0, 'failed' => 0, 'deduped' => 0, 'error_rate' => 0, 'total_value' => 0, 'avg_value' => 0],
                    'top_events' => [],
                    'hourly_sparkline' => [],
                ];
            }

            return $tenant->run($fetchLogic);
        });

        return response()->json($data);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Live Event Stream (SSE)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/tracking/dashboard/events/live
     *
     * Server-Sent Events stream — pushes new events as they arrive.
     * Frontend: new EventSource('/api/tracking/dashboard/events/live')
     */
    public function liveStream(Request $request): StreamedResponse
    {
        $tenantId     = $this->tenantId($request);
        $containerId  = $request->query('container_id');
        
        $idsQuery = $containerId 
            ? [(int)$containerId]
            : TrackingContainer::where('tenant_id', $tenantId)->pluck('id')->toArray();

        // 1. IMPORTANT: Close the session to prevent locking other requests.
        // This allows Inertia to continue working while the stream is open.
        if (session_id()) {
            session_write_close();
        }

        // 2. Disable execution time limits for long-running stream
        set_time_limit(0);
        ignore_user_abort(false);

        $isCliServer = php_sapi_name() === 'cli-server';
        $maxSeconds  = $isCliServer ? 1 : 0; // 1 second rotation for local dev
        $startTime   = time();

        return response()->stream(function () use ($tenantId, $idsQuery, $isCliServer, $maxSeconds, $startTime) {
            // 3. Send initial padding to force certain browsers/proxies to start rendering
            echo ":" . str_repeat(" ", 2048) . "\n";
            echo "retry: " . ($isCliServer ? "1000" : "5000") . "\n\n"; 
            ob_flush();
            flush();

            $lastProcessedAt = now()->subMinutes(5)->toDateTimeString();

            while (true) {
                // Check if the client is still connected
                if (connection_aborted()) {
                    break;
                }

                // If running on single-threaded artisan serve, return periodically to free the thread
                if ($maxSeconds > 0 && (time() - $startTime) >= $maxSeconds) {
                    echo "event: close\ndata: connection rotate\n\n";
                    break;
                }

                if (empty($idsQuery)) {
                    // Send a heartbeat to keep connection alive
                    echo ": heartbeat\n\n";
                    if (ob_get_level() > 0) ob_flush();
                    flush();
                    sleep(5);
                    continue;
                }

                $idList = implode(',', $idsQuery);

                // Fetch from ClickHouse
                try {
                $sql = "SELECT event_id as id, event_name, source_ip, value, status, processed_at
                        FROM sgtm_events
                        WHERE tenant_id = {$tenantId}
                        AND container_id IN ({$idList})
                        AND processed_at > '{$lastProcessedAt}'
                        ORDER BY processed_at ASC LIMIT 20";

                $res = $this->clickHouse->queryRaw($sql);
                $events   = $res['data'] ?? [];

                if (empty($events)) {
                    // Heartbeat comment to keep connection alive
                    echo ": heartbeat\n\n";
                }

                foreach ($events as $event) {
                    echo "data: " . json_encode([
                        'id'           => $event['id'],
                        'event_name'   => $event['event_name'],
                        'source_ip'    => $event['source_ip'],
                        'value'        => (float)($event['value'] ?? 0),
                        'status'       => $event['status'],
                        'status_code'  => 200,
                        'created_at'   => $event['processed_at'],
                        'time'         => \Carbon\Carbon::parse($event['processed_at'])->diffForHumans(),
                    ]) . "\n\n";
                    $lastProcessedAt = $event['processed_at'];
                }
                } catch (\Exception $e) {
                    echo "data: " . json_encode(['error' => 'ClickHouse Query Failed', 'message' => $e->getMessage()]) . "\n\n";
                }

                if (ob_get_level() > 0) ob_flush();
                flush();

                sleep(2);
            }
        }, 200, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache, no-store, must-revalidate',
            'Pragma'            => 'no-cache',
            'X-Accel-Buffering' => 'no', // Disable Nginx buffering
            'Connection'        => 'keep-alive',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Event Feed (Paginated)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/tracking/dashboard/events/feed
     *
     * Query params: container_id, event_name, status, from, to, per_page
     */
    public function eventFeed(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        if ($tenantId === 'temp_context') {
            return response()->json([
                'data' => [
                    ['id' => 1, 'event_name' => 'page_view', 'source_ip' => '127.0.0.1', 'country' => 'US', 'value' => 0, 'status' => 'processed', 'processed_at' => now()->subMinutes(5)->toDateTimeString()],
                    ['id' => 2, 'event_name' => 'purchase', 'source_ip' => '127.0.0.1', 'country' => 'US', 'value' => 99.99, 'status' => 'processed', 'processed_at' => now()->subMinutes(15)->toDateTimeString()],
                ],
                'current_page' => 1, 'last_page' => 1, 'total' => 2
            ]);
        }

        $fetchLogic = function() use ($tenantId, $request) {
            $containerIds = TrackingContainer::where('tenant_id', $tenantId)->pluck('id')->toArray();
            $page = (int) $request->get('page', 1);
            $perPage = (int) $request->get('per_page', 25);
            $offset = ($page - 1) * $perPage;

            $filters = [
                'event_name' => $request->get('event_name'),
                'status'     => $request->get('status'),
                'from'       => $request->get('from'),
                'to'         => $request->get('to'),
            ];

            $result = $this->clickHouse->getEventFeed((int)$tenantId, $containerIds, $filters, $perPage, $offset);

            return new \Illuminate\Pagination\LengthAwarePaginator(
                $result['data'],
                $result['total'],
                $perPage,
                $page,
                ['path' => $request->url(), 'query' => $request->query()]
            );
        };

        $tenant = \App\Models\Tenant::find($tenantId);
        $events = $tenant ? $tenant->run($fetchLogic) : $fetchLogic();

        return response()->json($events);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Platform Health
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/tracking/dashboard/platforms
     *
     * Returns health status for each marketing destination.
     */
    public function platforms(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        if ($tenantId === 'temp_context') {
            return response()->json([
                'platforms' => [
                    ['destination_id' => 1, 'container_id' => 1, 'container_name' => 'Mock Container', 'type' => 'ga4', 'is_active' => true, 'status' => 'healthy', 'success_rate' => 99.9, 'avg_latency_ms' => 45],
                    ['destination_id' => 2, 'container_id' => 1, 'container_name' => 'Mock Container', 'type' => 'facebook', 'is_active' => true, 'status' => 'healthy', 'success_rate' => 98.5, 'avg_latency_ms' => 120],
                ]
            ]);
        }

        $tenant = \App\Models\Tenant::find($tenantId);

        $fetchLogic = function() use ($tenantId) {
            $containers = TrackingContainer::where('tenant_id', $tenantId)
                ->where('is_active', true)
                ->get();

            $platforms = [];

            foreach ($containers as $container) {
                $healthData = $this->channelHealth->getDashboard($container->id, 1);
                $channels   = collect($healthData['channels'] ?? [])->keyBy('channel');

                foreach (($container->destinations ?? []) as $destination) {
                    $channelKey = $destination->type ?? 'unknown';
                    $stats      = $channels->get($channelKey);

                    $platforms[] = [
                        'destination_id'   => $destination->id    ?? null,
                        'container_id'     => $container->id,
                        'container_name'   => $container->name,
                        'type'             => $channelKey,
                        'is_active'        => $destination->is_active ?? false,
                        'status'           => $stats['status']   ?? 'unknown',
                        'success_rate'     => $stats['success_rate'] ?? null,
                        'last_event_at'    => $stats['daily'][0]['date'] ?? null,
                        'avg_latency_ms'   => $stats['avg_latency_ms'] ?? null,
                        'error_count_24h'  => $stats['total_failed'] ?? 0,
                        'last_error'       => !empty($stats['errors']) ? array_key_first($stats['errors']) : null,
                    ];
                }
            }
            return $platforms;
        };

        $platforms = $tenant ? $tenant->run($fetchLogic) : $fetchLogic();

        return response()->json(['platforms' => $platforms]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Customer Segments
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/tracking/dashboard/customers
     *
     * Returns segment breakdown, repeat rate, cross-device count.
     */
    public function customers(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        if ($tenantId === 'temp_context') {
            return response()->json([
                'segments' => [
                    ['segment' => 'VIP', 'count' => 15],
                    ['segment' => 'Loyal', 'count' => 85],
                    ['segment' => 'Standard', 'count' => 1150],
                ],
                'repeat_rate' => 12.5,
                'cross_device_count' => 320,
                'new_last_30_days' => 45,
                'top_customers' => [
                    ['id' => 1, 'email_hash' => 'sha256...', 'order_count' => 12, 'total_spent' => 1500.50, 'customer_segment' => 'VIP', 'last_order_at' => now()->subDays(2)->toDateTimeString()],
                ]
            ]);
        }

        $tenant = \App\Models\Tenant::find($tenantId);
        
        $fetchLogic = function() use ($tenantId) {
            $stats = $this->identityService->getSegmentStats($tenantId);

            // Recent new customers (last 30 days)
            $recentNew = CustomerIdentity::where('tenant_id', $tenantId)
                ->where('first_order_at', '>=', now()->subDays(30))
                ->count();

            // Top customers by LTV
            $topCustomers = CustomerIdentity::where('tenant_id', $tenantId)
                ->orderByDesc('total_spent')
                ->limit(10)
                ->get(['id', 'email_hash', 'order_count', 'total_spent', 'customer_segment', 'last_order_at']);

            return array_merge($stats, [
                'new_last_30_days' => $recentNew,
                'top_customers'    => $topCustomers,
            ]);
        };

        $result = $tenant ? $tenant->run($fetchLogic) : $fetchLogic();

        return response()->json($result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Single Customer Identity
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/tracking/dashboard/customers/{id}
     *
     * Returns full identity profile: devices, orders, events, merge history.
     */
    public function customerDetail(Request $request, int $id): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $tenant = \App\Models\Tenant::find($tenantId);

        $fetchLogic = function() use ($tenantId, $id) {
            $identity = CustomerIdentity::where('id', $id)->firstOrFail();

            $eventsResponse = $this->clickHouse->queryRaw("
                SELECT event_name, value, source_ip, status, processed_at
                FROM sgtm_events
                WHERE tenant_id = {$tenantId} AND user_hash = '{$identity->email_hash}'
                ORDER BY processed_at DESC LIMIT 20
            ");
            $events = $eventsResponse['data'] ?? [];

            $mergeHistory = \App\Models\Tracking\IdentityEvent::where('identity_id', $id)
                ->orderByDesc('linked_at')
                ->get(['from_id', 'to_id', 'link_type', 'source_event', 'linked_at', 'confidence']);

            return [
                'identity'      => $identity,
                'events'        => $events,
                'merge_history' => $mergeHistory,
                'journey'       => [
                    'first_event'    => $events->last()?->processed_at,
                    'latest_event'   => $events->first()?->processed_at,
                    'device_types'   => collect($identity->devices ?? [])->pluck('type')->unique()->values(),
                    'sources_used'   => collect($events)->pluck('utm_source')->filter()->unique()->values(),
                ],
            ];
        };

        $result = $tenant ? $tenant->run($fetchLogic) : $fetchLogic();

        return response()->json($result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 7. Container List
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/tracking/dashboard/containers
     *
     * Returns all tenant containers with deployment health.
     */
    public function containers(Request $request): JsonResponse
    {
        $tenantId   = $this->tenantId($request);
        $tenant     = \App\Models\Tenant::find($tenantId);

        $fetchLogic = function() use ($tenantId) {
            $containers = TrackingContainer::where('tenant_id', $tenantId)
                ->with('destinations')
                ->get()
                ->map(function ($container) use ($tenantId) {
                    // 24h events per container from ClickHouse
                    $since = now()->subHours(24)->toDateTimeString();
                    $statsResponse = $this->clickHouse->queryRaw("
                        SELECT count() as total, countIf(status = 'failed') as failed
                        FROM sgtm_events
                        WHERE tenant_id = {$tenantId} AND container_id = {$container->id} AND processed_at >= '{$since}'
                    ");
                    $stats = $statsResponse['data'][0] ?? ['total' => 0, 'failed' => 0];

                    $eventsToday = (int) $stats['total'];
                    $errorsToday = (int) $stats['failed'];

                    // Fetch verification metadata from TenantDomain
                    $domainRecord = \App\Models\TenantDomain::where('tenant_id', $tenantId)
                        ->where('domain', $container->domain)
                        ->where('purpose', 'tracking')
                        ->first();

                    return [
                        'id'               => $container->id,
                        'name'             => $container->name,
                        'container_id'     => $container->container_id,
                        'secret_key'       => $container->secret_key,
                        'metabase_type'    => $container->metabase_type ?? 'self_hosted',
                        'is_active'        => $container->is_active,
                        'deployment_type'  => $container->deployment_type ?? 'docker_vps',
                        'deploy_status'    => $container->docker_status ?? 'unknown',
                        'transport_url'    => $container->domain ?? $container->container_id,
                        'is_verified'      => $domainRecord->is_verified ?? ($container->deployment_type === 'shared' ? true : false),
                        'verification_status' => $domainRecord->status ?? 'active',
                        'verification_token'  => $domainRecord->verification_token ?? null,
                        'cname_target'     => config('tracking.cname_target', 'tracking.yoursaas.com'),
                        'k8s_namespace'    => $container->settings['k8s_namespace'] ?? null,
                        'destinations'     => $container->destinations?->count() ?? 0,
                        'events_today'     => $eventsToday,
                        'errors_today'     => $errorsToday,
                        'error_rate'       => $eventsToday > 0 ? round($errorsToday / $eventsToday * 100, 1) : 0,
                        'created_at'       => $container->created_at,
                    ];
                });
            return $containers;
        };
        if (!$tenant) {
            return response()->json(['containers' => []]);
        }
        
        $containers = $tenant->run($fetchLogic);

        return response()->json(['containers' => $containers]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 8. Analytics (Time-Series)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/tracking/dashboard/analytics
     *
     * Returns time-series data for revenue, event count, LTV, repeat rate.
     * Query params: period (7d | 30d | 90d | custom), from, to
     */
    public function analytics(Request $request): JsonResponse
    {
        $tenantId     = $this->tenantId($request);

        if ($tenantId === 'temp_context') {
            return response()->json([
                'daily' => [
                    ['date' => now()->subDays(2)->toDateString(), 'events' => 100, 'revenue' => 50.5, 'avg_value' => 0.5],
                    ['date' => now()->subDays(1)->toDateString(), 'events' => 150, 'revenue' => 75.2, 'avg_value' => 0.5],
                    ['date' => now()->toDateString(), 'events' => 120, 'revenue' => 60.0, 'avg_value' => 0.5],
                ],
                'by_revenue' => [
                    ['event_name' => 'purchase', 'count' => 30, 'total_revenue' => 1500.50],
                ],
                'ltv' => [
                    'avg_ltv' => 125.50,
                    'max_ltv' => 2500.00,
                    'avg_orders' => 3.2,
                    'total_customers' => 1250,
                ],
                'by_country' => [
                    ['country' => 'US', 'events' => 800],
                    ['country' => 'GB', 'events' => 200],
                ]
            ]);
        }

        $containerIds = TrackingContainer::where('tenant_id', $tenantId)->pluck('id');

        $period = $request->get('period', '30d');
        $from   = match ($period) {
            '7d'    => now()->subDays(7),
            '30d'   => now()->subDays(30),
            '90d'   => now()->subDays(90),
            'custom'=> now()->parse($request->get('from')),
            default => now()->subDays(30),
        };

        $cacheKey = "dashboard_analytics_{$tenantId}_{$period}";

        $data = Cache::remember($cacheKey, 300, function () use ($tenantId, $from, $containerIds) {
            $tenant = \App\Models\Tenant::find($tenantId);
            
            if (!$tenant) {
                return [
                    'daily'      => [],
                    'by_revenue' => [],
                    'ltv'        => null,
                    'by_country' => [],
                ];
            }
            
            $fetchLogic = function() use ($tenantId, $from, $containerIds) {
                $ids = implode(',', $containerIds->toArray());
                $since = $from->toDateTimeString();

                // Daily Revenue & Trends
                $daily = $this->clickHouse->queryRaw("
                    SELECT toDate(processed_at) as date, count() as events, sum(value) as revenue, avg(value) as avg_value
                    FROM sgtm_events
                    WHERE tenant_id = {$tenantId} AND container_id IN ({$ids}) AND processed_at >= '{$since}'
                    GROUP BY date ORDER BY date ASC
                ")['data'] ?? [];

                // Top event names by revenue
                $byRevenue = $this->clickHouse->queryRaw("
                    SELECT event_name, count() as count, sum(value) as total_revenue
                    FROM sgtm_events
                    WHERE tenant_id = {$tenantId} AND container_id IN ({$ids}) AND processed_at >= '{$since}' AND value > 0
                    GROUP BY event_name ORDER BY total_revenue DESC LIMIT 10
                ")['data'] ?? [];

                // Country breakdown
                $byCountry = $this->clickHouse->queryRaw("
                    SELECT source_ip as country, count() as events
                    FROM sgtm_events
                    WHERE tenant_id = {$tenantId} AND container_id IN ({$ids}) AND processed_at >= '{$since}'
                    GROUP BY country ORDER BY events DESC LIMIT 10
                ")['data'] ?? [];

                return [
                    'daily'      => $daily,
                    'by_revenue' => $byRevenue,
                    'ltv'        => null, // Future: Join with CustomerIdentity
                    'by_country' => $byCountry,
                ];
            };

            return $tenant->run($fetchLogic);
        });

        return response()->json($data);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private function tenantId(Request $request): string|int
    {
        // If we are in a tenant-initialized context (e.g. subdomain), use that
        if (function_exists('tenant') && tenant('id')) {
            return tenant('id');
        }

        // Check explicit query param or header
        $explicitId = $request->query('tenant_id') ?? $request->header('X-Tenant-ID');
        if ($explicitId) {
            return $explicitId;
        }

        // Fallback to user meta or first owned tenant
        if ($user = $request->user()) {
            if ($user->tenant_id) return $user->tenant_id;
            
            $firstTenant = \App\Models\Tenant::where('admin_email', $user->email)->first();
            if ($firstTenant) return $firstTenant->id;
        }

        return 0;
    }

    /**
     * Change Metabase instance type and trigger re-provisioning.
     */
    public function reprovisionAnalytics(Request $request, int $id)
    {
        $container = TrackingContainer::findOrFail($id);
        $type = $request->input('type', 'self_hosted');

        $container->update(['metabase_type' => $type]);

        // Dispatch background job for fresh provisioning
        \App\Modules\Tracking\Jobs\ProvisionMetabaseDashboardJob::dispatch(
            $container->id, 
            (string) (tenant('id') ?? $request->attributes->get('tenant_id'))
        );

        return response()->json([
            'success' => true,
            'message' => "Analytics re-provisioning for {$type} has been queued."
        ]);
    }
}
