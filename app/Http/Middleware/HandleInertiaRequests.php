<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\SubscriptionPlan;
use App\Models\Tenant;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        // Returning null disables Inertia's asset-version hard-reload.
        // Re-enable with parent::version($request) when you want cache-busting in production.
        return null;
    }

    public function share(Request $request): array
    {
        $tenant = $request->attributes->get('tenant') ?? tenant();
        $user = $request->user();

        // PixelMaster Architecture Global Injection for User Dashboards
        $pixelmasterProps = [];
        
        // Use super_admin_web guard to check if it's a platform admin
        $isPlatformAdmin = auth('super_admin_web')->check();

        if ($user && !$isPlatformAdmin && $user->role !== 'admin' && !$request->expectsJson()) {
            $userTenants = \App\Models\Tenant::where('admin_email', $user->email)->get();
            $containers = $userTenants->map(function ($c) {
                return [
                    'id' => $c->id,
                    'name' => $c->tenant_name ?? $c->id,
                    'domain' => $c->domain,
                    'status' => $c->status,
                    'plan' => $c->plan,
                ];
            });
            
            // Fix: $containers is a collection of arrays, so we must use array access or get id from array
            $firstContainer = $containers->first();
            $activeContainerId = $request->query('tenant_id') ?? ($firstContainer['id'] ?? null);
            
            $pixelmasterProps = [
                'is_pixelmaster_model' => true,
                'containers' => $containers,
                'active_container_id' => $activeContainerId,
            ];

            // If we are on the central domain and haven't resolved a tenant yet,
            // resolve it now for the 'tenant' shared prop.
            if (!$tenant && $activeContainerId) {
                $tenant = $userTenants->firstWhere('id', $activeContainerId);
            }
        }

        return [
            ...parent::share($request),
            ...$pixelmasterProps,
            'auth' => [
                'user' => $this->transformedUser($request),
                'impersonating' => $request->session()->has('impersonated_by'),
            ],
            'tenant'        => $tenant ? array_merge($tenant->toArray(), [
                'usage' => $this->getUsageStats($tenant)
            ]) : null,
            'tenant_config' => fn () => $this->getTenantConfig($tenant),
            'plan'          => fn () => $this->getActivePlanKey($tenant),
            'features'      => fn () => $this->getTenantFeatures($tenant),
            'settings' => [
                'app_name' => \App\Models\GlobalSetting::get('app_name', config('app.name', 'Platform OS')),
            ],
            'flash' => [
                'message' => fn () => $request->session()->has('message') ? $request->session()->get('message') : null,
                'success' => fn () => $request->session()->has('success') ? $request->session()->get('success') : null,
                'error'   => fn () => $request->session()->has('error')   ? $request->session()->get('error')   : null,
            ],
        ];
    }

    /**
     * Fetch real-time usage stats from the tenant database.
     */
    protected function getUsageStats($tenant): array
    {
        if (!$tenant || !is_object($tenant)) {
            return ['used' => 0, 'limit' => 10000, 'percentage' => 0];
        }

        try {
            $limit = $tenant->getQuota('monthly_event_limit') ?? 10000;
            
            // Usage is stored in ec_tracking_usage in the tenant DB
            // tenancy()->initialize($tenant) should already be called by middleware
            $used = \Illuminate\Support\Facades\DB::connection('tenant_dynamic')
                ->table('ec_tracking_usage')
                ->where('billing_period', now()->format('Y-m'))
                ->sum('request_count') ?? 0;

            return [
                'used' => (int)$used,
                'limit' => (int)$limit,
                'percentage' => $limit > 0 ? min(100, round(($used / $limit) * 100, 1)) : 0
            ];
        } catch (\Throwable $e) {
            return ['used' => 0, 'limit' => 10000, 'percentage' => 0, 'error' => $e->getMessage()];
        }
    }

    /**
     * Build tenant config from tenant data (passed as Inertia shared props).
     */
    protected function getTenantConfig($tenant): ?array
    {
        if (!$tenant) return null;

        $data = is_object($tenant) ? ($tenant->data ?? []) : [];

        return [
            'country'      => $data['country'] ?? ($tenant->country ?? null),
            'onboarded_at' => $data['onboarding_completed_at'] ?? null,
            'subscription' => [
                'tier'            => $data['selected_plan'] ?? 'free',
                'active_modules'  => $data['active_modules'] ?? [],
                'active_features' => $data['active_features'] ?? [],
            ],
            'module_map'   => $data['module_map'] ?? [],
        ];
    }

    /**
     * Resolve the active plan key for a tenant.
     * Returns 'free' as default.
     */
    protected function getActivePlanKey($tenant): string
    {
        if (!$tenant || !is_object($tenant)) return 'free';
        
        $plan = $tenant->plan ?? 'free';
        
        // If plan is an object (common when accidentally Eager Loaded), extract the key
        if (is_object($plan)) {
            return $plan->plan_key ?? (string)$plan;
        }

        return (string)$plan ?: 'free';
    }

    /**
     * Get the flat list of feature keys enabled for a tenant's current plan.
     * This is shared globally with the React frontend so UI can show lock/unlock state
     * without extra API calls.
     *
     * Shape: string[]  e.g. ['custom_domain', 'stape_analytics', 'logs', ...]
     */
    protected function getTenantFeatures($tenant): array
    {
        if (!$tenant || !is_object($tenant)) return [];

        $planKey = $tenant->plan ?? 'free';

        try {
            $planModel = SubscriptionPlan::where('plan_key', $planKey)->first();
            return $planModel?->features ?? [];
        } catch (\Throwable) {
            return config("plans.{$planKey}.features", []);
        }
    }

    /**
     * Transform the user object to remove tenant-specific clutter for Super Admins.
     */
    protected function transformedUser(Request $request): ?array
    {
        $user = $request->user('super_admin_web') ?: $request->user();
        
        if (!$user) {
            return null;
        }

        $data = $user->toArray();

        // If it's a super admin, remove fields that only make sense for tenant-level business data
        if (($data['role'] ?? '') === 'super_admin') {
            $tenantFields = [
                'company_name', 'company_logo', 'favicon', 'company_address', 
                'company_city_zip', 'company_email', 'company_phone', 'team_id', 
                'department_id', 'tenant_id'
            ];
            
            foreach ($tenantFields as $field) {
                unset($data[$field]);
            }
        }

        return $data;
    }
}
