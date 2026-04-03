<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Services\ModuleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Tenant-side module subscription management.
 * Tenants can view available modules, their own subscriptions,
 * and self-subscribe to modules (trial/billing flow).
 */
class ModuleSubscriptionController extends Controller
{
    public function __construct(protected ModuleService $moduleService) {}

    // ── Module Marketplace ─────────────────────────────────────────────────

    /**
     * GET /api/modules
     * All available modules + current tenant's subscription status.
     */
    public function index(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id')
                 ?? $request->header('X-Tenant-ID');

        $tenant = Tenant::find($tenantId);

        // All marketplace modules
        $modules = Module::active()->get();

        // Current tenant subscriptions
        $subscribed = $tenant
            ? TenantModule::where('tenant_id', $tenant->id)
                ->get()
                ->keyBy('module_id')
            : collect([]);

        // Config features/icons
        $config = config('modules');

        $data = $modules->map(function (Module $module) use ($subscribed, $config) {
            $sub  = $subscribed->get($module->id);
            $conf = $config[$module->slug] ?? [];

            return [
                'id'                => $module->id,
                'slug'              => $module->slug,
                'name'              => $module->name,
                'description'       => $module->description,
                'version'           => $module->version,
                'price'             => (float) $module->price,
                'icon'              => $conf['icon'] ?? 'box',
                'color'             => $conf['color'] ?? '#6366f1',
                'features'          => $conf['features'] ?? [],
                'subscription'      => $sub ? [
                    'status'            => $sub->status,
                    'subscription_type' => $sub->subscription_type,
                    'subscribed_at'     => $sub->subscribed_at,
                    'expires_at'        => $sub->expires_at,
                    'is_active'         => $sub->isActive(),
                ] : null,
                'is_subscribed'     => $sub && $sub->isActive(),
            ];
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * GET /api/modules/my
     * Only tenant's active subscriptions.
     */
    public function myModules(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id')
                 ?? $request->header('X-Tenant-ID');

        $modules = $this->moduleService->getTenantModules($tenantId);

        return response()->json(['success' => true, 'data' => $modules]);
    }

    /**
     * GET /api/modules/{key}
     * Module details + tenant subscription status.
     */
    public function show(Request $request, string $key)
    {
        $tenantId = $request->attributes->get('tenant_id')
                 ?? $request->header('X-Tenant-ID');

        $module = Module::where('slug', $key)->active()->firstOrFail();
        $conf   = config("modules.{$key}", []);

        $tenant = Tenant::find($tenantId);
        $sub    = $tenant
            ? TenantModule::where('tenant_id', $tenant->id)->where('module_id', $module->id)->first()
            : null;

        return response()->json([
            'success' => true,
            'data' => [
                'module'       => array_merge($module->toArray(), [
                    'icon'     => $conf['icon']     ?? 'box',
                    'color'    => $conf['color']    ?? '#6366f1',
                    'features' => $conf['features'] ?? [],
                ]),
                'subscription' => $sub,
                'is_active'    => $sub && $sub->isActive(),
            ],
        ]);
    }

    // ── Subscription Actions ───────────────────────────────────────────────

    /**
     * POST /api/modules/{key}/subscribe
     * Tenant subscribes to a module from the marketplace.
     * Blueprint modules are auto-activated during onboarding (free).
     * Marketplace modules may require payment if price > 0.
     */
    public function subscribe(Request $request, string $key)
    {
        $tenantId = $request->attributes->get('tenant_id')
                 ?? $request->header('X-Tenant-ID');

        if (!$tenantId) {
            return response()->json(['success' => false, 'message' => 'Tenant identification required'], 400);
        }

        $request->validate([
            'subscription_type' => 'nullable|in:trial,monthly,yearly,lifetime',
            'payment_id'        => 'nullable|string|max:255',
        ]);

        $type = $request->get('subscription_type', 'monthly');

        $expiresAt = match ($type) {
            'trial'    => now()->addDays(14),
            'monthly'  => now()->addMonth(),
            'yearly'   => now()->addYear(),
            'lifetime' => null,
            default    => now()->addMonth(),
        };

        $result = $this->moduleService->subscribeModule($tenantId, $key, [
            'subscription_type' => $type,
            'expires_at'        => $expiresAt,
            'payment_id'        => $request->payment_id,
            'auto_renew'        => $type !== 'lifetime',
            'source'            => 'marketplace',
        ]);

        // If module requires payment, return 402 Payment Required
        if (!$result['success'] && ($result['requires_payment'] ?? false)) {
            return response()->json($result, 402);
        }

        return response()->json($result, $result['success'] ? 201 : 422);
    }

    /**
     * DELETE /api/modules/{key}/subscribe
     * Tenant unsubscribes (cancels) a module.
     * Blueprint modules (bundled with plan) cannot be unsubscribed.
     */
    public function unsubscribe(Request $request, string $key)
    {
        $tenantId = $request->attributes->get('tenant_id')
                 ?? $request->header('X-Tenant-ID');

        if (!$tenantId) {
            return response()->json(['success' => false, 'message' => 'Tenant identification required'], 400);
        }

        // Check if module is blueprint-sourced (locked, cannot be removed)
        $module = Module::where('slug', $key)->first();
        if ($module) {
            $sub = TenantModule::where('tenant_id', $tenantId)
                ->where('module_id', $module->id)
                ->first();
            if ($sub && !$sub->isUnsubscribable()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This module is included with your plan and cannot be removed.',
                    'source'  => $sub->source,
                ], 403);
            }
        }

        $result = $this->moduleService->unsubscribeModule($tenantId, $key);

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    /**
     * POST /api/modules/{key}/trial
     * Quick-start 14-day free trial.
     */
    public function startTrial(Request $request, string $key)
    {
        $tenantId = $request->attributes->get('tenant_id')
                 ?? $request->header('X-Tenant-ID');

        $tenant = Tenant::find($tenantId);
        if (!$tenant) {
            return response()->json(['success' => false, 'message' => 'Tenant not found'], 404);
        }

        $module = Module::where('slug', $key)->active()->first();
        if (!$module) {
            return response()->json(['success' => false, 'message' => 'Module not found'], 404);
        }

        // Check if already had a trial
        $existing = TenantModule::where('tenant_id', $tenant->id)
            ->where('module_id', $module->id)
            ->where('subscription_type', 'trial')
            ->first();

        if ($existing) {
            return response()->json(['success' => false, 'message' => 'Trial already used for this module'], 422);
        }

        $result = $this->moduleService->subscribeModule($tenantId, $key, [
            'subscription_type' => 'trial',
            'expires_at'        => now()->addDays(14),
            'auto_renew'        => false,
        ]);

        return response()->json($result, $result['success'] ? 201 : 422);
    }

    /**
     * GET /api/modules/check/{key}
     * Quick access check — used by frontend to gate UI.
     */
    public function checkAccess(Request $request, string $key)
    {
        $tenantId = $request->attributes->get('tenant_id')
                 ?? $request->header('X-Tenant-ID');

        $isActive = $this->moduleService->isModuleActive($tenantId, $key);

        return response()->json([
            'success'   => true,
            'module'    => $key,
            'has_access'=> $isActive,
        ]);
    }

    /**
     * POST /api/modules/sync-blueprint
     * Upgrade tenant modules based on their industry blueprint and target plan.
     */
    public function syncBlueprint(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id')
                 ?? $request->header('X-Tenant-ID');

        if (!$tenantId) {
            return response()->json(['success' => false, 'message' => 'Tenant identification required'], 400);
        }

        $request->validate([
            'plan_level' => 'required|in:starter,growth,pro'
        ]);

        $result = $this->moduleService->upgradeBlueprintPlan($tenantId, $request->plan_level);

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    /**
     * GET /api/modules/regions
     * Get region-specific module bundling strategy.
     */
    public function regions()
    {
        return response()->json([
            'success' => true,
            'data' => config('tenant_regions')
        ]);
    }

    /**
     * GET /api/modules/recommended
     * Get recommended modules for the current tenant based on
     * business type, region, and currently active modules.
     */
    public function recommended(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id')
                 ?? $request->header('X-Tenant-ID');

        $data = $this->moduleService->getRecommendedModules($tenantId);

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * GET /api/modules/{key}/related
     * Get related / complementary modules for a given module.
     */
    public function related(Request $request, string $key)
    {
        $tenantId = $request->attributes->get('tenant_id')
                 ?? $request->header('X-Tenant-ID');

        $data = $this->moduleService->getRelatedModules($tenantId, $key);

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * POST /api/modules/unsubscribe
     * Unsubscribe by slug provided in request body.
     */
    public function unsubscribeBySlug(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id')
                 ?? $request->header('X-Tenant-ID');

        if (!$tenantId) {
            return response()->json(['success' => false, 'message' => 'Tenant identification required'], 400);
        }

        $request->validate([
            'slug' => 'required|string|exists:modules,slug'
        ]);

        $result = $this->moduleService->unsubscribeModule($tenantId, $request->slug);

        return response()->json($result, $result['success'] ? 200 : 422);
    }
}
