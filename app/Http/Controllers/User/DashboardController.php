<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Tenant;

class DashboardController extends Controller
{
    /**
     * Render the User Dashboard (Tenant Core Index equivalent on the central domain).
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // 1. Fetch all containers (tenants) owned by this user
        $containers = Tenant::where('admin_email', $user->email)->get();

        // 2. Identify the currently active container from query params, or default to the first
        $activeContainerId = $request->query('tenant_id');
        
        $activeContainer = null;
        if ($activeContainerId) {
            $activeContainer = $containers->firstWhere('id', $activeContainerId);
        }

        // Fallback to the first available container if none specified or invalid
        if (!$activeContainer && $containers->isNotEmpty()) {
            $activeContainer = $containers->first();
        }

        // 3. Prepare common props
        $pageProps = [
            'containers' => $containers->map(function ($c) {
                return [
                    'id' => $c->id,
                    'name' => $c->tenant_name ?? $c->id,
                    'domain' => $c->domain,
                    'status' => $c->status,
                    'plan' => $c->plan,
                ];
            }),
            'active_container_id' => $activeContainer ? $activeContainer->id : null,
            'is_pixelmaster_model' => true, // Flag for the frontend to know we are in PixelMaster mode
        ];

        // 4. If a container exists, fetch its specific metrics & settings
        if ($activeContainer) {
            // We initialize tenancy to fetch data stored in the tenant-specific tables
            $activeContainer->run(function () use (&$pageProps) {
                // Fetch the primary or first tracking container for this tenant
                $trackingContainer = \App\Models\Tracking\TrackingContainer::where('is_active', true)->first();
                
                $metabaseSettings = null;
                if ($trackingContainer && isset($trackingContainer->settings)) {
                    $settings = $trackingContainer->settings;
                    if (isset($settings['dashboard_url'])) {
                        $metabaseSettings = [
                            'url'         => $settings['dashboard_url'],
                            'embed_token' => $settings['embed_token'] ?? null,
                            'full_embed'  => isset($settings['embed_token']) 
                                ? "{$settings['dashboard_url']}#token={$settings['embed_token']}"
                                : $settings['dashboard_url'],
                        ];
                    }
                }

                $pageProps = array_merge($pageProps, [
                    'tenant' => [
                        'id' => tenant('id'),
                        'tenant_name' => tenant('tenant_name'),
                        'domain' => tenant('domain'),
                        'status' => tenant('status'),
                    ],
                    'metabase' => $metabaseSettings,
                    'subscription_info' => [
                        'name' => ucfirst(tenant('plan') ?? 'free'),
                        'request_limit' => tenant('db_limit_gb') * 500000, // Calculated limit
                    ],
                    'subscription' => tenant()->subscription,
                    'usage' => [
                        'db_usage_gb' => tenant()->currentDbUsageGb(),
                        'db_limit_gb' => tenant()->dbLimitGb(),
                        'db_usage_percent' => tenant()->dbUsagePercent(),
                    ],
                ]);
            });
        }

        // Render the existing Tenant Dashboard view but populated with central data
        return Inertia::render('Tenant/Core/Index', $pageProps);
    }
}

