<?php

namespace App\Modules\Tracking\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Tracking\TrackingContainer;
use App\Modules\Tracking\Services\MetabaseDashboardService;
use App\Modules\Tracking\Services\ClickHouseEventLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    private MetabaseDashboardService $metabase;
    private ClickHouseEventLogService $clickHouse;

    public function __construct(MetabaseDashboardService $metabase, ClickHouseEventLogService $clickHouse)
    {
        $this->metabase = $metabase;
        $this->clickHouse = $clickHouse;
    }

    /**
     * Display the tenant analytics hub.
     * GET /ior/tracking/analytics
     */
    public function index(Request $request): Response
    {
        // For the current IOR/Tenant context, find the active container
        $container = TrackingContainer::where('tenant_id', tenant('id'))
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$container) {
            return Inertia::render('Platform/Sgtm/Analytics', [
                'error' => 'No tracking containers found for this tenant.',
            ]);
        }

        $settings = $container->settings ?? [];
        $dashboardId = $settings['dashboard_id'] ?? null;
        $realtimeId  = $settings['realtime_dashboard_id'] ?? null;

        $embedUrl = '';
        $realtimeUrl = '';

        if ($dashboardId) {
            $this->metabase->configureFor($container->metabase_type ?? 'self_hosted');
            $token = $this->metabase->generateEmbedToken((int)$dashboardId, (int)$container->id);
            $baseUrl = $this->metabase->getBaseUrl();
            $embedUrl = rtrim($baseUrl, '/') . "/embed/dashboard/{$token}#bordered=false&titled=false";
        }

        if ($realtimeId) {
            $this->metabase->configureFor($container->metabase_type ?? 'self_hosted');
            $rToken = $this->metabase->generateEmbedToken((int)$realtimeId, (int)$container->id);
            $baseUrl = $this->metabase->getBaseUrl();
            $realtimeUrl = rtrim($baseUrl, '/') . "/embed/dashboard/{$rToken}#bordered=false&titled=false";
        }

        return Inertia::render('Platform/Sgtm/Analytics', [
            'container' => $container,
            'analytics' => [
                'embed_url'    => $embedUrl,
                'realtime_url' => $realtimeUrl,
                'configured'   => !empty($embedUrl),
            ],
            'stats' => [
                'today_events' => (int) $this->clickHouse->getEventCount(
                    (int) tenant('id'), 
                    (int) $container->id, 
                    now()->startOfDay()->toDateTimeString(), 
                    now()->endOfDay()->toDateTimeString()
                ),
                'status'       => $container->status,
            ]
        ]);
    }
}
