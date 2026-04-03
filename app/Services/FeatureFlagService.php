<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class FeatureFlagService
{
    private const CACHE_TTL = 300; // 5 minutes

    /**
     * Check if a feature is enabled for a specific tenant.
     *
     * Checks the tenant's subscription plan `features` array (DB-backed).
     * Falls back to config/plans.php if DB is unavailable.
     *
     * @param  string       $featureKey  e.g. 'logs', 'cookie_keeper', 'monitoring'
     * @param  string|null  $tenantId    If null, resolves from request context
     */
    public function isEnabled(string $featureKey, ?string $tenantId = null): bool
    {
        $tenantId = $tenantId ?: request()->attributes->get('tenant_id');

        if (!$tenantId) {
            return false;
        }

        $cacheKey = "feature_flag:{$tenantId}:{$featureKey}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($tenantId, $featureKey) {
            $tenant = Tenant::find($tenantId);
            if (!$tenant) {
                return false;
            }
            return $tenant->hasFeature($featureKey);
        });
    }

    /**
     * Check a feature directly against a Tenant model instance.
     * Avoids an extra DB query when you already have the tenant.
     */
    public function isEnabledForTenant(Tenant $tenant, string $featureKey): bool
    {
        $cacheKey = "feature_flag:{$tenant->id}:{$featureKey}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($tenant, $featureKey) {
            return $tenant->hasFeature($featureKey);
        });
    }

    /**
     * Get all features enabled for a tenant (full feature key list).
     */
    public function getEnabledFeatures(string $tenantId): array
    {
        return Cache::remember("tenant_features:{$tenantId}", self::CACHE_TTL, function () use ($tenantId) {
            $tenant = Tenant::find($tenantId);
            if (!$tenant) return [];

            try {
                $plan = SubscriptionPlan::where('plan_key', $tenant->plan ?? 'free')->first();
                return $plan?->features ?? [];
            } catch (\Throwable $e) {
                Log::warning("getEnabledFeatures failed for tenant {$tenantId}: " . $e->getMessage());
                return config("plans.{$tenant->plan}.features", []);
            }
        });
    }

    /**
     * Returns the lowest plan required to unlock a feature.
     * Returns null if the feature is unknown.
     *
     * @return string|null  e.g. 'pro', 'business', 'custom'
     */
    public function requiredPlanFor(string $featureKey): ?string
    {
        foreach (Tenant::PLAN_HIERARCHY as $tier) {
            if (in_array($featureKey, config("plans.{$tier}.features", []), true)) {
                return $tier;
            }
        }
        return null;
    }

    /**
     * Flush the feature cache for a tenant (call on plan upgrade/downgrade).
     */
    public function flushCache(string $tenantId): void
    {
        Cache::forget("tenant_features:{$tenantId}");
        Cache::forget("tenant_plan_{$tenantId}");
    }

    /**
     * @deprecated  Direct flag overrides are deprecated in favour of Plan-based capabilities.
     */
    public function setFlag(string $tenantId, string $feature, bool $enabled, string $source = 'admin'): void
    {
        Log::info("Feature override '{$feature}' requested for tenant: {$tenantId}. (Direct overrides deprecated — use plan upgrades.)");
        $this->flushCache($tenantId);
    }
}
