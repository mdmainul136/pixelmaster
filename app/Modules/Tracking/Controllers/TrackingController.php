<?php

namespace App\Modules\Tracking\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Tracking\TrackingContainer;
use App\Modules\Tracking\Actions\ContainerLifecycleAction;
use App\Modules\Tracking\Services\PowerUpService;
use App\Modules\Tracking\Services\TrackingUsageService;
use App\Modules\Tracking\Services\CloudflareCdnService;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    // ── Container CRUD ──────────────────────────────────────

    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => TrackingContainer::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string',
            'container_config' => 'nullable|string',   // Base64 GTM config string
            'container_id'     => 'nullable|string',    // Auto-extracted from config if not provided
            'domain'           => 'nullable|string',
            'power_ups'        => 'nullable|array',
            'tracking_type'    => 'nullable|string|in:saas,custom,existing',
            'server_location'  => 'nullable|string',    // AWS region or global
            'deployment_type'  => 'nullable|string|in:docker,kubernetes,docker_vps',
        ]);

        // If container_config provided, extract container_id from it
        if (!empty($validated['container_config']) && empty($validated['container_id'])) {
            $decoded = base64_decode($validated['container_config']);
            parse_str($decoded, $params);
            $validated['container_id'] = $params['id'] ?? 'GTM-PENDING';
        }

        // Ensure container_id exists (either from config or manual input)
        if (empty($validated['container_id'])) {
            $validated['container_id'] = 'PENDING';
        }

        // Map 'docker' to 'docker_vps' if needed, or stick to 'docker'
        if (($validated['deployment_type'] ?? null) === 'docker') {
            $validated['deployment_type'] = 'docker_vps';
        }

        // Generate a 6-character unique random subdomain (PixelMaster-style)
        if (empty($validated['domain'])) {
            $centralDomain = env('TENANT_CENTRAL_DOMAIN', 'pixelmasters.io');
            $retryCount = 0;
            $uniqueSlug = "";

            do {
                $uniqueSlug = strtolower(\Illuminate\Support\Str::random(6));
                $exists = TrackingContainer::where('domain', "{$uniqueSlug}.{$centralDomain}")->exists();
                $retryCount++;
            } while ($exists && $retryCount < 5);

            $validated['domain'] = "{$uniqueSlug}.{$centralDomain}";
            \Log::info("Generated unique tracking subdomain: {$validated['domain']}");
        }

        // Validate any provided power-ups at creation time against registry
        if (!empty($validated['power_ups'])) {
            $validKeys = array_column(app(PowerUpService::class)->registry(), 'id');
            $invalidKeys = array_diff($validated['power_ups'], $validKeys);
            if (!empty($invalidKeys)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Power-Ups provided at creation.',
                    'errors'  => $invalidKeys
                ], 422);
            }
        }

        // Auto-provisioning flag: instant SaaS UX (mimics PixelMaster behavior)
        $validated['is_active'] = true;
        $validated['settings'] = ['auto_provisioned' => true, 'setup_method' => 'one_click_dashboard'];
        if (empty($validated['server_location'])) {
            $validated['server_location'] = 'global'; // Ensure default location
        }

        // Add tenant_id to validated data
        $validated['tenant_id'] = $request->attributes->get('tenant_id') ?? tenant('id');

        $container = TrackingContainer::create($validated);

        // 3. Instant Deployment (Hybrid Logic)
        // Automatically route to shared sidecar (free) or provision dedicated instance (paid)
        $orchestrator = $this->getOrchestrator($container);
        $deployResult = $orchestrator->deploy($container);

        // Auto-provision Metabase dashboard in the background (tenant-aware)
        $tenantId = $request->attributes->get('tenant_id') ?? tenant('id');
        \App\Modules\Tracking\Jobs\ProvisionMetabaseDashboardJob::dispatch($container->id, (string)$tenantId);

        return response()->json([
            'success'   => true, 
            'data'      => $container,
            'deployment'=> $deployResult
        ], 201);
    }

    // ── Stats & Logs ────────────────────────────────────────

    public function stats($id)
    {
        $container = TrackingContainer::findOrFail($id);
        
        $stats = [
            'total_events' => $container->eventLogs()->count(),
            'events_by_type' => $container->eventLogs()
                ->selectRaw('event_type, count(*) as count')
                ->groupBy('event_type')
                ->get(),
            'recent_errors' => $container->eventLogs()
                ->where('status_code', '>=', 400)
                ->latest()
                ->limit(5)
                ->get(),
        ];

        return response()->json(['success' => true, 'data' => $stats]);
    }

    public function logs($id)
    {
        $container = TrackingContainer::findOrFail($id);
        $logs = $container->eventLogs()->latest()->paginate(50);

        return response()->json(['success' => true, 'data' => $logs]);
    }

    // ── Destinations ────────────────────────────────────────

    public function getDestinations($id)
    {
        $container = TrackingContainer::findOrFail($id);
        return response()->json(['success' => true, 'data' => $container->destinations]);
    }

    public function addDestination(Request $request, $id)
    {
        $container = TrackingContainer::findOrFail($id);
        
        $validated = $request->validate([
            'type'        => 'required|string|in:facebook_capi,ga4,tiktok,snapchat,twitter,webhook',
            'name'        => 'required|string',
            'credentials' => 'required|array',
            'mappings'    => 'nullable|array',
        ]);

        $destination = \App\Models\Tracking\TrackingDestination::create(array_merge($validated, [
            'container_id' => $container->id
        ]));

        return response()->json(['success' => true, 'data' => $destination], 201);
    }

    // ── Usage Metering (Billing) ────────────────────────────

    public function usage(int $id, Request $request, TrackingUsageService $usageService)
    {
        $container = TrackingContainer::findOrFail($id);

        $usage = $usageService->getUsageForBilling(
            $container->id,
            $request->input('from'),
            $request->input('to')
        );

        return response()->json(['success' => true, 'data' => $usage]);
    }

    public function usageDaily(int $id, TrackingUsageService $usageService)
    {
        $container = TrackingContainer::findOrFail($id);
        $daily = $usageService->getDailyBreakdown($container->id);

        return response()->json(['success' => true, 'data' => $daily]);
    }

    // ── Power-Ups ───────────────────────────────────────────

    public function powerUps()
    {
        return response()->json([
            'success' => true,
            'data' => app(PowerUpService::class)->registry()
        ]);
    }

    public function updatePowerUps(Request $request, int $id, CloudflareCdnService $cdnService)
    {
        $container = TrackingContainer::findOrFail($id);
        
        $request->validate(['power_ups' => 'required|array']);
        $requestedPowerUps = $request->input('power_ups');

        // Validation: Ensure all requested power-ups actually exist in the registry
        $validKeys = array_column(app(PowerUpService::class)->registry(), 'id'); 
        $invalidKeys = array_diff($requestedPowerUps, $validKeys);
        
        if (!empty($invalidKeys)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid Power-Ups detected.',
                'errors'  => $invalidKeys
            ], 422);
        }

        $oldPowerUps = $container->power_ups ?? [];
        $container->update(['power_ups' => $requestedPowerUps]);

        // Logic: Trigger Cloudflare Provisioning if Global CDN enabled for the first time
        if (in_array('global_cdn', $requestedPowerUps) && !in_array('global_cdn', $oldPowerUps)) {
            $cdnService->provisionCdn($container);
        }

        return response()->json(['success' => true, 'data' => $container->fresh()]);
    }

    // ── Docker Control Plane (Orchestrator) ────────────────

    public function deploy(Request $request, int $id)
    {
        $container = TrackingContainer::findOrFail($id);
        $customDomain = $request->input('domain');

        // Extract preferred region from dedicated column
        $preferredRegion = $container->server_location;

        $orchestrator = $this->getOrchestrator($container);
        $result = $orchestrator->deploy($container, $customDomain, $preferredRegion);

        return response()->json(['success' => true, 'data' => $result]);
    }

    public function provision(Request $request, int $id, ContainerLifecycleAction $action)
    {
        $container = TrackingContainer::findOrFail($id);

        $request->validate([
            'docker_container_id' => 'required|string',
            'docker_port'         => 'required|integer',
        ]);

        $updated = $action->provision(
            $container,
            $request->input('docker_container_id'),
            $request->input('docker_port')
        );

        return response()->json(['success' => true, 'data' => $updated]);
    }

    /**
     * Manually trigger Metabase Analytics provisioning.
     */
    public function provisionAnalytics(int $id)
    {
        $container = TrackingContainer::findOrFail($id);
        
        // Dispatch job immediately
        \App\Modules\Tracking\Jobs\ProvisionMetabaseDashboardJob::dispatch($container->id, tenant('id'));

        return response()->json([
            'success' => true, 
            'message' => 'Analytics provisioning has been queued and will be ready shortly.'
        ]);
    }

    public function deprovision(int $id)
    {
        $container = TrackingContainer::findOrFail($id);
        $orchestrator = $this->getOrchestrator($container);
        $result = $orchestrator->stop($container);

        return response()->json(['success' => true, 'data' => $result]);
    }

    public function health(int $id)
    {
        $container = TrackingContainer::findOrFail($id);
        $orchestrator = $this->getOrchestrator($container);

        return response()->json([
            'success' => true,
            'data' => $orchestrator->healthCheck($container)
        ]);
    }

    public function updateDomain(Request $request, int $id)
    {
        $container = TrackingContainer::findOrFail($id);
        $request->validate(['domain' => 'required|string']);

        $orchestrator = $this->getOrchestrator($container);
        $result = $orchestrator->updateDomain($container, $request->input('domain'));

        return response()->json(['success' => true, 'data' => $result]);
    }

    /**
     * Resolve the correct Orchestrator implementation based on container deployment_type.
     */
    protected function getOrchestrator(TrackingContainer $container): \App\Modules\Tracking\Contracts\OrchestratorInterface
    {
        $type = $container->deployment_type ?? 'docker_vps';

        return match ($type) {
            'kubernetes'             => app(\App\Modules\Tracking\Services\KubernetesOrchestratorService::class),
            'docker', 'docker_vps'   => app(\App\Modules\Tracking\Services\DockerOrchestratorService::class),
            default                  => app(\App\Modules\Tracking\Services\DockerOrchestratorService::class),
        };
    }

    // ── Tracking Domain Management (3-Case) ─────────────────

    /**
     * Setup tracking domain for a container.
     * POST /tracking/{id}/setup-domain
     *
     * Cases:
     *   A: saas     → track.{tenant}.yoursaas.com (instant)
     *   B: custom   → track.baseus.com.bd (CNAME required)
     *   C: existing → shop.baseus.com.bd/track (not recommended)
     */
    public function setupDomain(
        Request $request,
        int $id,
        \App\Modules\Tracking\Services\TrackingDomainService $domainService
    ) {
        $request->validate([
            'tracking_type' => 'required|string|in:saas,custom,existing',
            'domain'        => 'required_if:tracking_type,custom,existing|string',
        ]);

        $tenantId     = $request->attributes->get('tenant_id');
        $trackingType = $request->input('tracking_type');
        $domain       = $request->input('domain');

        try {
            $result = match ($trackingType) {
                'saas'     => [
                    'domain' => $domainService->provisionSaasTracking($tenantId),
                    'type'   => 'saas',
                    'ready'  => true,
                ],
                'custom'   => array_merge(
                    $domainService->registerCustomTracking($tenantId, $domain),
                    ['type' => 'custom', 'ready' => false]
                ),
                'existing' => [
                    'domain'  => $domainService->useExistingSubdomain($tenantId, $domain),
                    'type'    => 'existing',
                    'ready'   => true,
                    'warning' => 'Separate tracking subdomain recommended for best performance',
                ],
            };

            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Suggest tracking domain from tenant's custom domains.
     * GET /tracking/suggest-domain
     */
    public function suggestDomain(
        Request $request,
        \App\Modules\Tracking\Services\TrackingDomainService $domainService
    ) {
        $tenantId = $request->attributes->get('tenant_id');

        $suggestions = $domainService->suggestTrackingDomain($tenantId);
        $current     = $domainService->getTrackingDomain($tenantId);

        return response()->json([
            'success' => true,
            'data' => [
                'current_tracking_domain' => $current,
                'transport_url'           => $current ? "https://{$current}" : null,
                'suggestions'             => $suggestions,
            ]
        ]);
    }

    /**
     * Get DNS instructions for custom tracking domain.
     * GET /tracking/{id}/dns-instructions
     */
    public function getDnsInstructions(
        int $id,
        \App\Modules\Tracking\Services\TrackingDomainService $domainService
    ) {
        $container = TrackingContainer::findOrFail($id);
        $extras = $container->extra_domains ?? [];

        $instructions = [];
        foreach ($extras as $domain) {
            $instructions[$domain] = $domainService->getDnsInstructions($domain);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'primary_domain' => $container->domain,
                'extra_domains'  => $extras,
                'dns_records'    => $instructions,
            ]
        ]);
    }

    /**
     * Add custom tracking domain to running container.
     * POST /tracking/{id}/add-domain
     */
    public function addTrackingDomain(
        Request $request,
        int $id,
        \App\Modules\Tracking\Services\DockerOrchestratorService $orchestrator
    ) {
        $container = TrackingContainer::findOrFail($id);
        $request->validate(['domain' => 'required|string']);

        $result = $orchestrator->addTrackingDomain($container, $request->input('domain'));

        return response()->json(['success' => true, 'data' => $result]);
    }

    // ── Analytics (PixelMaster Analytics Equivalent) ─────────────

    public function analytics(int $id, Request $request, \App\Modules\Tracking\Services\TrackingAnalyticsService $analyticsService)
    {
        $container = TrackingContainer::findOrFail($id);

        $analytics = $analyticsService->getAnalytics(
            $container->id,
            $request->input('from'),
            $request->input('to')
        );

        return response()->json(['success' => true, 'data' => $analytics]);
    }

    // ── Container Update (Settings, Mappings, etc.) ────────

    public function update(Request $request, int $id)
    {
        $container = TrackingContainer::findOrFail($id);

        $validated = $request->validate([
            'name'           => 'sometimes|string',
            'event_mappings' => 'sometimes|array',
            'settings'       => 'sometimes|array',
            'power_ups'      => 'sometimes|array',
        ]);

        // Merge settings instead of overwriting
        if (isset($validated['settings'])) {
            $validated['settings'] = array_merge($container->settings ?? [], $validated['settings']);
        }

        $container->update($validated);

        return response()->json(['success' => true, 'data' => $container->fresh()]);
    }

    // ── sGTM Proxy Endpoints ────────────────────────────────

    /**
     * Proxy gtm.js script (served from tenant's own domain = first-party).
     * GET /tracking/gtm.js?id=GTM-XXXX
     */
    public function proxyGtmJs(Request $request, \App\Modules\Tracking\Services\SgtmProxyService $sgtm)
    {
        $params = $request->query();
        $containerId = $params['id'] ?? null;
        unset($params['id']);

        if (!$containerId) {
            return response('// Missing container ID', 400)->header('Content-Type', 'application/javascript');
        }

        $script = $sgtm->proxyGtmJs($containerId, $params);
        if (!$script) {
            return response('// Failed to load gtm.js', 502)->header('Content-Type', 'application/javascript');
        }

        return response($script)
            ->header('Content-Type', 'application/javascript')
            ->header('Cache-Control', 'public, max-age=3600');
    }

    /**
     * Proxy gtag.js script (GA4 tag).
     * GET /tracking/gtag/js?id=G-XXXX
     */
    public function proxyGtagJs(Request $request, \App\Modules\Tracking\Services\SgtmProxyService $sgtm)
    {
        $params = $request->query();
        $measurementId = $params['id'] ?? null;
        unset($params['id']);

        if (!$measurementId) {
            return response('// Missing measurement ID', 400)->header('Content-Type', 'application/javascript');
        }

        $script = $sgtm->proxyGtagJs($measurementId, $params);
        if (!$script) {
            return response('// Failed to load gtag.js', 502)->header('Content-Type', 'application/javascript');
        }

        return response($script)
            ->header('Content-Type', 'application/javascript')
            ->header('Cache-Control', 'public, max-age=3600');
    }

    /**
     * Serve the PixelMaster JS-SDK.
     * GET /sdk/v1/pixelmaster.min.js
     */
    public function proxySdk()
    {
        $path = public_path('sdk/v1/pixelmaster.min.js');
        if (!file_exists($path)) {
            return response('// SDK Not Found', 404)->header('Content-Type', 'application/javascript');
        }

        return response()->file($path, [
            'Content-Type'  => 'application/javascript',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    /**
     * Collect events via Measurement Protocol (server-to-server).
     * POST /tracking/mp/collect
     */
    public function collectMeasurementProtocol(
        Request $request,
        \App\Modules\Tracking\Services\SgtmProxyService $sgtm,
        \App\Modules\Tracking\Services\SgtmContainerService $containerService
    ) {
        $tenantId = tenant('id') ?? $request->attributes->get('tenant_id');
        $secret = $request->header('X-Container-Secret') ?? $request->get('api_secret');

        if (!$secret) {
            return response()->json(['error' => 'Missing X-Container-Secret header'], 401);
        }

        $container = TrackingContainer::where('tenant_id', $tenantId)
            ->where('secret_key', $secret)
            ->first();

        if (!$container) {
            return response()->json(['error' => 'Invalid Secret Key or Container not found'], 401);
        }

        $measurementId = $containerService->getMeasurementId($container);
        if (!$measurementId) {
            return response()->json(['error' => 'No measurement ID configured for this container'], 404);
        }

        $apiSecret = $containerService->getApiSecret($container);
        if (!$apiSecret) {
            return response()->json(['error' => 'API secret not configured'], 500);
        }

        $clientId = $request->input('client_id', $sgtm->generateClientId());
        $userId   = $request->input('user_id');
        $events   = $request->input('events', []);

        if (empty($events)) {
            return response()->json(['error' => 'No events provided'], 400);
        }

        $requestId = (string) \Illuminate\Support\Str::uuid();
        $tenantId  = tenant('id') ?? $request->attributes->get('tenant_id');

        // High-Scale: Dispatch background jobs for each event instead of sync processing
        foreach ($events as $event) {
            \App\Modules\Tracking\Jobs\ProcessTrackingEventJob::dispatch([
                'container_id'    => $container->id,
                'tenant_id'       => $tenantId,
                'event_type'      => $event['name'] ?? 'unknown',
                'payload'         => array_merge($event, [
                    'client_id' => $clientId,
                    'user_id'   => $userId,
                ]),
                'source_ip'       => $request->ip(),
                'user_agent'      => $request->userAgent(),
                '_request_id'     => $requestId,
                '_dispatched_at'  => microtime(true),
            ])->onQueue('tracking-logs');
        }

        return response()->json([
            'success'    => true,
            'request_id' => $requestId,
            'message'    => 'Events accepted for background processing'
        ], 202);
    }

    /**
     * Get the sGTM embed snippet for the tenant's frontend.
     * GET /tracking/snippet
     */
    public function getSnippet(
        Request $request,
        \App\Modules\Tracking\Services\SgtmProxyService $sgtm,
        \App\Modules\Tracking\Services\SgtmContainerService $containerService
    ) {
        $container = $containerService->getPrimaryContainer();
        if (!$container) {
            return response()->json(['error' => 'No container configured'], 404);
        }

        $transportUrl = $sgtm->getTransportUrl(
            $request->getHost()
        );

        $measurementId = $containerService->getMeasurementId($container);

        $snippet = $sgtm->generateGtagSnippet(
            $measurementId ?? '',
            $transportUrl,
            $request->input('consent', [])
        );

        return response()->json([
            'success'        => true,
            'measurement_id' => $measurementId,
            'transport_url'  => $transportUrl,
            'snippet'        => $snippet,
            'gtm_snippet'    => $sgtm->generateGtmSnippet($container->container_id ?? 'GTM-XXXXXX', $container->domain ?? $request->getHost()),
            'gtm_noscript'   => $sgtm->generateGtmNoscriptSnippet($container->container_id ?? 'GTM-XXXXXX', $container->domain ?? $request->getHost()),
            'container_id'   => $container->container_id,
        ]);
    }

}

