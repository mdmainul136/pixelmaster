<?php

namespace App\Modules\Tracking\Services;

use App\Models\Tracking\TrackingContainer;
use App\Models\Tenant;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use App\Notifications\Tracking\BillingThresholdReached;

/**
 * BillingAlertService
 *
 * Monitors per-tenant event usage and fires alerts when:
 *   - 80% of monthly quota is reached  â†’ WARNING alert
 *   - 100% of monthly quota is reached â†’ CRITICAL alert
 *   - 120% of monthly quota is reached â†’ AUTOMATIC SUSPENSION (RESTRICTED)
 *
 * Uses Redis (Cache) to prevent duplicate alerts within the same billing cycle.
 */
class BillingAlertService
{
    public function __construct(
        protected ClickHouseEventLogService $clickHouse
    ) {}

    /**
     * Check usage for a container and fire alerts if thresholds are crossed.
     */
    public function checkAndAlert(TrackingContainer $container): void
    {
        $tenant = $container->tenant;
        if (!$tenant) return;

        $planKey = $tenant->plan ?: 'free';
        $limit   = Tenant::$plans[$planKey]['monthly_event_limit'] ?? 10000;

        if ($limit <= 0) return;

        $monthStart = now()->startOfMonth()->toDateTimeString();
        $now        = now()->toDateTimeString();

        // 1. Source of truth for usage is ClickHouse
        $usage = $this->clickHouse->getEventCount($tenant->id, $monthStart, $now);
        $pct   = ($usage / $limit) * 100;

        Log::info("[BillingAlert] Container #{$container->id} usage: {$usage}/{$limit} ({$pct}%)");

        // 2. Threshold: 120% (Hard Suspension)
        if ($pct >= 120) {
            if ($container->docker_status !== 'restricted') {
                $container->update(['docker_status' => 'restricted']);
                $this->fireAlert($container, 120, $usage, $limit, $planKey);
                Log::warning("[BillingAlert] Container suspended (120% limit) for Tenant: {$tenant->id}");
            }
            return;
        }

        // 3. Threshold: 100% (Critical)
        if ($pct >= 100 && !$this->alreadyAlerted($container->id, '100')) {
            $this->fireAlert($container, 100, $usage, $limit, $planKey);
            $this->markAlerted($container->id, '100');
        } 
        // 4. Threshold: 80% (Warning)
        elseif ($pct >= 80 && !$this->alreadyAlerted($container->id, '80')) {
            $this->fireAlert($container, 80, $usage, $limit, $planKey);
            $this->markAlerted($container->id, '80');
        }
    }

    public function checkAllContainers(): array
    {
        $containers = TrackingContainer::where('is_active', true)->with('tenant')->get();
        foreach ($containers as $container) {
            try {
                $this->checkAndAlert($container);
            } catch (\Throwable $e) {
                Log::error('[BillingAlert] Check failed', [
                    'container_id' => $container->id,
                    'error'        => $e->getMessage(),
                ]);
            }
        }
        return $containers->toArray();
    }

    public function resetMonthlyAlerts(int $containerId): void
    {
        cache()->forget("billing_alert_{$containerId}_80");
        cache()->forget("billing_alert_{$containerId}_100");
    }

    private function fireAlert(TrackingContainer $container, int $pct, int $usage, int $limit, string $tier): void
    {
        Log::warning("[BillingAlert] Container {$container->id} at {$pct}% quota", [
            'tenant_id' => $container->tenant_id,
            'usage'     => $usage,
            'limit'     => $limit,
        ]);

        try {
            $tenant = $container->tenant;
            if ($tenant && class_exists(BillingThresholdReached::class)) {
                Notification::send($tenant, new BillingThresholdReached(
                    container:  $container,
                    percentage: $pct,
                    usage:      $usage,
                    limit:      $limit,
                    tier:       $tier,
                ));
            }
        } catch (\Throwable $e) {
            Log::error('[BillingAlert] Notification failed: ' . $e->getMessage());
        }
    }

    private function alreadyAlerted(int $containerId, string $threshold): bool
    {
        return (bool) cache()->get("billing_alert_{$containerId}_{$threshold}");
    }

    private function markAlerted(int $containerId, string $threshold): void
    {
        $ttl = now()->endOfMonth()->diffInSeconds(now());
        cache()->put("billing_alert_{$containerId}_{$threshold}", true, $ttl);
    }
}

