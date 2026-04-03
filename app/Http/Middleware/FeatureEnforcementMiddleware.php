<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\ModuleService;

class FeatureEnforcementMiddleware
{
    protected $moduleService;

    public function __construct(ModuleService $moduleService)
    {
        $this->moduleService = $moduleService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string|null $module
     * @param  string|null $feature
     */
    public function handle(Request $request, Closure $next, $module = null, $feature = null): Response
    {
        // Try to get tenant from request (merges/attributes), query, or global helper
        $tenant = $request->get('tenant') ?? $request->attributes->get('tenant') ?? tenant();

        // 🛸 FALLBACK: If on central domain (localhost/127.0.0.1) and no tenant is identified yet,
        // use the authenticated user's primary tenant as the context.
        if (!$tenant && (auth()->check() || auth('sanctum')->check())) {
            $user = auth()->user() ?: auth('sanctum')->user();
            
            if ($user) {
                // First try direct tenant_id if it exists on User model
                if (isset($user->tenant_id) && $user->tenant_id) {
                    $tenant = \App\Models\Tenant::on('central')->find($user->tenant_id);
                } 
                // Fallback: Find tenant where this user is the admin (Matched by email)
                else {
                    $tenant = \App\Models\Tenant::on('central')->where('admin_email', $user->email)->first();
                }
                
                // If still no tenant, create a MOCK tenant object so the logic downstream doesn't break
                if (!$tenant) {
                    $tenant = new \App\Models\Tenant([
                        'id' => 'temp_context',
                        'admin_email' => $user->email,
                        'status' => 'active',
                        'plan' => 'pro' // Default to highest for dev preview
                    ]);
                }

                // Inject back into request for downstream middleware
                if ($tenant) {
                    $request->merge(['tenant' => $tenant]);
                    $request->attributes->set('tenant', $tenant);
                }
            }
        }

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant context missing.'
            ], 403);
        }

        // 🌌 BYPASS: If we are in a mock/temp context for development/dev-preview, 
        // allow all tracking modules and features to pass.
        if ($tenant->id === 'temp_context') {
            return $next($request);
        }

        // --- USAGE BASED PRICING SHIFT ---
        // Feature and Module access checks are disabled because the platform 
        // now operates on a pure Event Limit (Quota) based model.

        // 1. Check Module Access (Disabled)
        // if ($module && $module !== 'NULL' && !$this->moduleService->isModuleActive($tenant, $module)) {
        //     return ...
        // }

        // 2. Check Feature Access (Disabled)
        // if ($feature && $feature !== 'NULL' && !$this->moduleService->hasFeature($tenant, $feature)) {
        //     return ...
        // }

        return $next($request);
    }
}
