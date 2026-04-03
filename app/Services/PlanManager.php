<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\SubscriptionPlan;
use App\Models\TenantSubscription;
use Illuminate\Support\Facades\Cache;

class PlanManager
{
    /**
     * Cache duration for plan data (in seconds)
     */
    private const CACHE_TTL = 3600;

    /**
     * 5-tier upgrade path — order matters (cheapest → most expensive)
     */
    private const UPGRADE_PATH = ['free', 'pro', 'business', 'enterprise', 'custom'];

    // ──────────────────────────────────────────────────────────────────────────
    // Feature Checks
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Check if a feature is enabled for the current plan.
     * Reads from DB-backed plan (with config fallback).
     */
    public function isFeatureEnabled(string $featureKey, ?string $planKey = null): bool
    {
        $plan = $planKey ?? $this->getCurrentPlanKey();

        // Try DB first
        try {
            $planModel = SubscriptionPlan::where('plan_key', $plan)->first();
            if ($planModel) {
                return in_array($featureKey, $planModel->features ?? [], true);
            }
        } catch (\Throwable) {
            // Fall through to config
        }

        return in_array($featureKey, config("plans.{$plan}.features", []), true);
    }

    /**
     * Get the upgrade state of a feature for the current plan.
     *
     * Returns one of:
     *   'enabled'        — available on the current plan
     *   'pro_only'       — requires Pro
     *   'business_only'  — requires Business
     *   'enterprise_only'— requires Enterprise
     *   'custom_only'    — requires Custom plan
     *   'locked'         — not available on any plan
     */
    public function getFeatureState(string $featureKey): string
    {
        if ($this->isFeatureEnabled($featureKey)) {
            return 'enabled';
        }

        $lowestRequired = $this->lowestPlanWithFeature($featureKey);

        return match ($lowestRequired) {
            'pro'        => 'pro_only',
            'business'   => 'business_only',
            'enterprise' => 'enterprise_only',
            'custom'     => 'custom_only',
            default      => 'locked',
        };
    }

    /**
     * Get the lowest plan tier that unlocks a feature.
     * Returns null if the feature isn't in any plan.
     */
    public function lowestPlanWithFeature(string $featureKey): ?string
    {
        foreach (self::UPGRADE_PATH as $tier) {
            if (in_array($featureKey, config("plans.{$tier}.features", []), true)) {
                return $tier;
            }
        }
        return null;
    }

    /**
     * Get all features for a given plan (with their labels from DB features_json).
     * Returns: ['feature_key' => ['label' => '...', 'description' => '...']]
     */
    public function getFeaturesForPlan(string $planKey): array
    {
        try {
            $planModel = SubscriptionPlan::where('plan_key', $planKey)->first();
            if ($planModel) {
                return $planModel->features_json ?? [];
            }
        } catch (\Throwable) {
            // Fall through
        }

        // Bare key list as fallback
        $keys = config("plans.{$planKey}.features", []);
        return array_fill_keys($keys, ['label' => $keys, 'description' => '']);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Quota Helpers
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Get the request/event limit for the current plan.
     * -1 means unlimited.
     */
    public function getRequestLimit(): int
    {
        $plan = $this->getCurrentPlanKey();
        return (int) config("plans.{$plan}.request_limit", 10_000);
    }

    /**
     * Get the log retention period (in days) for the current plan.
     * 0 = no logs, -1 = custom/unlimited.
     */
    public function getLogRetention(): int
    {
        $plan = $this->getCurrentPlanKey();
        return (int) config("plans.{$plan}.log_retention", 0);
    }

    /**
     * Get the max domains allowed for the current plan.
     * -1 = by arrangement.
     */
    public function getMultiDomainLimit(): int
    {
        $plan = $this->getCurrentPlanKey();
        return (int) config("plans.{$plan}.multi_domains", 1);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Plan Resolution
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Resolve the current plan key for the active tenant.
     * Sources (in order): TenantSubscription → Tenant.plan → 'free'
     */
    public function getCurrentPlanKey(): string
    {
        $tenant = app('currentTenant');
        if (!$tenant) {
            return 'free';
        }

        return Cache::remember("tenant_plan_{$tenant->id}", self::CACHE_TTL, function () use ($tenant) {
            $subscription = TenantSubscription::where('tenant_id', $tenant->id)
                ->active()
                ->with('plan')
                ->first();

            if ($subscription && $subscription->plan) {
                return $subscription->plan->plan_key ?? 'free';
            }

            return $tenant->plan ?: 'free';
        });
    }

    /**
     * Returns plan metadata (name, price, features) for all 5 tiers.
     * Used by the pricing page to build the comparison table.
     */
    public function getAllPlans(): array
    {
        return Cache::remember('all_subscription_plans', self::CACHE_TTL, function () {
            return SubscriptionPlan::active()
                ->orderByRaw("FIELD(plan_key, 'free', 'pro', 'business', 'enterprise', 'custom')")
                ->get(['plan_key', 'name', 'price_monthly', 'price_yearly', 'features', 'features_json', 'quotas'])
                ->toArray();
        });
    }

    /**
     * Flush all plan-related caches for a tenant.
     * Call this on plan upgrade/downgrade.
     */
    public function flushCache(string $tenantId): void
    {
        Cache::forget("tenant_plan_{$tenantId}");
        Cache::forget("tenant_features:{$tenantId}");
        Cache::forget('all_subscription_plans');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Private Helpers
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @deprecated  Use isFeatureEnabled() instead.
     */
    private function isFeatureInPlan(string $feature, string $plan): bool
    {
        return in_array($feature, config("plans.{$plan}.features", []), true);
    }
}
