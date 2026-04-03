<?php

namespace App\Modules\Tracking\Services;

use App\Models\Tenant;
use App\Models\TenantSubscription;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class QuotaEnforcementService
{
    /**
     * Check if a tenant's event quota has been exceeded.
     * This should be called at the high-frequency ingestion entry point.
     */
    public function isOverQuota(Tenant $tenant): bool
    {
        // 1. Get current usage (usually from a fast cache like Redis, synced periodicially from ClickHouse)
        $usage = $this->getCurrentUsage($tenant);
        
        // 2. Get the tenant's plan limit
        $limit = $this->getPlanLimit($tenant);
        
        // 3. Check if over limit
        if ($usage >= $limit) {
            Log::warning("Tenant #{$tenant->id} has reached their quota limit ({$usage}/{$limit}). Blocking ingestion.");
            return true;
        }

        return false;
    }

    /**
     * Get the current month's event count for the tenant.
     * In production, this pulls from a Redis counter that is incremented on every event.
     */
    private function getCurrentUsage(Tenant $tenant): int
    {
        $cacheKey = "tenant_{$tenant->id}_usage_" . date('Y_m');
        
        return (int) Cache::get($cacheKey, 0);
    }

    /**
     * Get the event limit based on the tenant's current subscription.
     */
    private function getPlanLimit(Tenant $tenant): int
    {
        $subscription = TenantSubscription::where('tenant_id', $tenant->id)
            ->with('plan')
            ->first();

        if (!$subscription || !$subscription->plan) {
            return 10000; // Default Free Limit
        }

        return (int) ($subscription->plan->quotas['events'] ?? 10000);
    }

    /**
     * Increment the event counter for a tenant.
     * Called after successful ingestion.
     */
    public function incrementUsage(Tenant $tenant): void
    {
        $cacheKey = "tenant_{$tenant->id}_usage_" . date('Y_m');
        Cache::increment($cacheKey);
    }
}
