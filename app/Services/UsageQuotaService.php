<?php

namespace App\Services;

use App\Models\TenantUsageQuota;
use App\Models\Tenant;
use App\Events\QuotaThresholdReached;
use App\Exceptions\QuotaExceededException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class UsageQuotaService
{
    /**
     * Overage rate per 10K events beyond quota.
     */
    protected const OVERAGE_RATE = 5.00;

    /**
     * Get or create the current billing period quota for a tenant + module.
     */
    public function getCurrentQuota(string $tenantId, string $moduleSlug = 'tracking'): TenantUsageQuota
    {
        $now = now();
        $periodStart = $now->copy()->startOfMonth()->toDateString();
        $periodEnd   = $now->copy()->endOfMonth()->toDateString();

        $quota = TenantUsageQuota::where('tenant_id', $tenantId)
            ->where('module_slug', $moduleSlug)
            ->where('billing_period_start', $periodStart)
            ->first();

        if ($quota) {
            return $quota;
        }

        // Determine quota limit based on tenant plan from centralized config
        $tenant = Tenant::find($tenantId);
        $plan = $tenant?->plan ?? 'free';
        
        $quotas = config('tenant_quotas.tiers', []);
        $planQuotas = $quotas[$plan] ?? $quotas['starter'] ?? [];
        
        // Map module to its specific quota key in config
        $limitKey = match($moduleSlug) {
            'tracking' => 'tracking_monthly_limit',
            'whatsapp' => 'whatsapp_monthly_limit',
            'scraping' => 'scraping_daily_limit', // Added for IOR
            default    => 'default_limit'
        };

        $limit = $planQuotas[$limitKey] ?? 1000; // Default fallback

        return TenantUsageQuota::create([
            'tenant_id'            => $tenantId,
            'module_slug'          => $moduleSlug,
            'quota_limit'          => $limit,
            'used_count'           => 0,
            'overage_rate'         => self::OVERAGE_RATE,
            'billing_period_start' => $periodStart,
            'billing_period_end'   => $periodEnd,
        ]);
    }

    /**
     * Check if tenant has remaining quota.
     */
    public function hasQuota(string $tenantId, string $moduleSlug = 'tracking'): bool
    {
        $quota = $this->getCurrentQuota($tenantId, $moduleSlug);
        return !$quota->isOverQuota();
    }

    /**
     * Increment usage count (call this when events are tracked).
     * Returns usage info including whether overage kicked in.
     * 
     * @throws QuotaExceededException if hardLock is true and limit reached.
     */
    public function incrementUsage(string $tenantId, int $count = 1, string $moduleSlug = 'tracking', bool $hardLock = false): array
    {
        $quota = $this->getCurrentQuota($tenantId, $moduleSlug);
        
        // 1. Enforce Hard Lock before incrementing
        if ($hardLock && $quota->isOverQuota()) {
            throw new QuotaExceededException($moduleSlug, $quota->used_count, $quota->quota_limit);
        }

        $wasOverBefore = $quota->isOverQuota();

        $quota->increment('used_count', $count);
        $quota->refresh();

        $isOverNow = $quota->isOverQuota();
        $percent   = $quota->usagePercent();

        // 2. Trigger Automated Notifications (80% and 100% thresholds)
        $this->checkThresholds($quota, $percent);

        // Log when a tenant first exceeds their quota
        if ($isOverNow && !$wasOverBefore) {
            Log::warning("Tenant {$tenantId} exceeded {$moduleSlug} quota: {$quota->used_count}/{$quota->quota_limit}");
        }

        return [
            'used'      => $quota->used_count,
            'limit'     => $quota->quota_limit,
            'remaining' => $quota->remainingQuota(),
            'percent'   => $percent,
            'is_over'   => $isOverNow,
            'overage'   => max(0, $quota->used_count - $quota->quota_limit),
        ];
    }

    /**
     * Check usage thresholds and dispatch events.
     * Uses Cache to ensure each threshold is only triggered once per billing period.
     */
    protected function checkThresholds(TenantUsageQuota $quota, float $percent): void
    {
        $thresholds = [80, 100];
        
        foreach ($thresholds as $threshold) {
            if ($percent >= $threshold) {
                $cacheKey = "quota_alert:{$quota->id}:{$threshold}:{$quota->billing_period_start->format('Y-m')}";
                
                if (!Cache::has($cacheKey)) {
                    Cache::put($cacheKey, true, now()->addMonth());
                    event(new QuotaThresholdReached($quota, $threshold));
                    Log::info("Quota threshold {$threshold}% reached for tenant {$quota->tenant_id} [{$quota->module_slug}]");
                }
            }
        }
    }

    /**
     * Get full usage summary for a tenant.
     */
    public function getUsageSummary(string $tenantId, string $moduleSlug = 'tracking'): array
    {
        $quota = $this->getCurrentQuota($tenantId, $moduleSlug);

        return [
            'module'        => $moduleSlug,
            'plan_limit'    => $quota->quota_limit,
            'used'          => $quota->used_count,
            'remaining'     => $quota->remainingQuota(),
            'percent_used'  => $quota->usagePercent(),
            'is_over_quota' => $quota->isOverQuota(),
            'overage_count' => max(0, $quota->used_count - $quota->quota_limit),
            'overage_rate'  => $quota->overage_rate,
            'period_start'  => $quota->billing_period_start->toDateString(),
            'period_end'    => $quota->billing_period_end->toDateString(),
        ];
    }

    /**
     * Upgrade quota when tenant upgrades plan (mid-period).
     */
    public function upgradeQuota(string $tenantId, string $newPlan, string $moduleSlug = 'tracking'): void
    {
        $quota = $this->getCurrentQuota($tenantId, $moduleSlug);
        
        $quotas = config('tenant_quotas.tiers', []);
        $planQuotas = $quotas[$newPlan] ?? $quotas['starter'] ?? [];
        
        $limitKey = match($moduleSlug) {
            'tracking' => 'tracking_monthly_limit',
            'whatsapp' => 'whatsapp_monthly_limit',
            'scraping' => 'scraping_daily_limit',
            default    => 'default_limit'
        };

        $newLimit = $planQuotas[$limitKey] ?? 1000;

        if ($newLimit > $quota->quota_limit || $newLimit === -1) {
            $quota->update(['quota_limit' => $newLimit]);
            Log::info("Upgraded {$moduleSlug} quota for {$tenantId}: {$quota->quota_limit} â†’ {$newLimit}");
        }
    }

    /**
     * Get percentage of quota used for a specific module.
     */
    public function getPercentageUsed(string $tenantId, string $moduleSlug = 'tracking'): float
    {
        return $this->getCurrentQuota($tenantId, $moduleSlug)->usagePercent();
    }

    /**
     * Get summary of all overages across the platform.
     */
    public function getGlobalOverageSummary(): array
    {
        return TenantUsageQuota::whereColumn('used_count', '>', 'quota_limit')
            ->with('tenant')
            ->get()
            ->map(fn($q) => [
                'tenant_name' => $q->tenant->tenant_name ?? $q->tenant_id,
                'module' => $q->module_slug,
                'used' => $q->used_count,
                'limit' => $q->quota_limit,
                'overage' => $q->used_count - $q->quota_limit,
                'percent' => $q->usagePercent(),
            ])
            ->toArray();
    }

    /**
     * Get quota limits config (useful for frontend plan comparison).
     */
    public static function getQuotaLimits(): array
    {
        return config('tenant_quotas.tiers', []);
    }
}

