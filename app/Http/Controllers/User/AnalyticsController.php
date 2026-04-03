<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Tracking\TrackingContainer;
use App\Modules\Tracking\Services\MetabaseDashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    /**
     * Dashboard Overview (Main Analytics)
     */
    public function overview(Request $request, MetabaseDashboardService $metabase)
    {
        return $this->renderAnalytics($request, $metabase, 'overview');
    }

    /**
     * Real-time Data Stream
     */
    public function realtime(Request $request, MetabaseDashboardService $metabase)
    {
        return $this->renderAnalytics($request, $metabase, 'realtime');
    }

    /**
     * Helper to render analytics views
     */
    private function renderAnalytics(Request $request, MetabaseDashboardService $metabase, string $type)
    {
        $user = $request->user();
        $containers = Tenant::where('admin_email', $user->email)->get();
        $activeContainerId = $request->query('tenant_id');
        
        $activeTenant = $activeContainerId 
            ? $containers->firstWhere('id', $activeContainerId)
            : $containers->first();

        $analytics = null;
        $provisioning = false;

        if ($activeTenant) {
            $activeTenant->run(function () use ($metabase, $type, &$analytics, &$provisioning) {
                $container = TrackingContainer::where('is_active', true)->first();
                if ($container) {
                    $settings = $container->settings ?? [];
                    if (isset($settings['dashboard_id'])) {
                        // For 'realtime', we might use a specific dashboard or filter, 
                        // but for now, we point to the main one with a specific param if needed.
                        $analytics = $metabase->generateAdminEmbedToken((int)$settings['dashboard_id']);
                    } else if (isset($settings['auto_provisioned'])) {
                        $provisioning = true;
                    }
                }
            });
        }

        return Inertia::render('Tenant/Tracking/AnalyticsPage', [
            'analytics'    => $analytics,
            'provisioning' => $provisioning,
            'type'         => $type,
            'containers'   => $containers->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->tenant_name ?? $c->id,
                'domain' => $c->domain,
            ]),
            'active_container_id' => $activeTenant?->id,
        ]);
    }
}
