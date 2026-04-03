<?php

namespace App\Modules\Tracking\Services;

use App\Models\Tracking\TrackingContainer;
use Illuminate\Support\Facades\DB;

class TrackingUsageService
{
    /**
     * Increment the daily usage counter for a container.
     */
    public function recordEvent(int $containerId, string $type = 'received'): void
    {
        $column = match ($type) {
            'forwarded'     => 'events_forwarded',
            'dropped'       => 'events_dropped',
            'power_up'      => 'power_ups_invoked',
            default         => 'events_received',
        };

        DB::connection('tenant_dynamic')->table('ec_tracking_usage')
            ->updateOrInsert(
                ['container_id' => $containerId, 'date' => now()->toDateString()],
                [$column => DB::raw("{$column} + 1"), 'updated_at' => now()]
            );
    }

    /**
     * Get usage stats for billing.
     */
    public function getUsageForBilling(int $containerId, ?string $from = null, ?string $to = null): array
    {
        $query = DB::connection('tenant_dynamic')->table('ec_tracking_usage')
            ->where('container_id', $containerId);

        if ($from) $query->where('date', '>=', $from);
        if ($to) $query->where('date', '<=', $to);

        $usage = $query->selectRaw('
            SUM(events_received) as total_received,
            SUM(events_forwarded) as total_forwarded,
            SUM(events_dropped) as total_dropped,
            SUM(power_ups_invoked) as total_power_ups
        ')->first();

        return [
            'events_received'  => (int) ($usage->total_received ?? 0),
            'events_forwarded' => (int) ($usage->total_forwarded ?? 0),
            'events_dropped'   => (int) ($usage->total_dropped ?? 0),
            'power_ups_used'   => (int) ($usage->total_power_ups ?? 0),
        ];
    }

    /**
     * Get daily breakdown for charts.
     */
    public function getDailyBreakdown(int $containerId, int $days = 30): array
    {
        return DB::connection('tenant_dynamic')->table('ec_tracking_usage')
            ->where('container_id', $containerId)
            ->where('date', '>=', now()->subDays($days)->toDateString())
            ->orderBy('date')
            ->get()
            ->toArray();
    }
    /**
     * Check the quota status for a container. Returns detailed status
     * indicating whether it's within limits, in overage, or blocked entirely.
     */
    public function getQuotaStatus(int $containerId, string $tier = 'free'): array
    {
        $limit = config("plans.{$tier}.request_limit", 10000);
        $suspensionThreshold = config('tracking.suspension_threshold', 1.5);
        $hardDropLimit = $limit * $suspensionThreshold;
        
        $usage = DB::connection('tenant_dynamic')->table('ec_tracking_usage')
            ->where('container_id', $containerId)
            ->where('date', '>=', now()->startOfMonth()->toDateString())
            ->sum('events_received');

        $status = 'ok';
        if ($limit > 0) {
            if ($usage >= $hardDropLimit) {
                $status = 'dropped'; // Exceeded hard limit (e.g. 150%) - Block events entirely
            } elseif ($usage >= $limit) {
                $status = 'overage'; // Exceeded soft limit (100%-150%) - Allow events but bill extra
            }
        }

        return [
            'status'     => $status,
            'usage'      => $usage,
            'limit'      => $limit,
            'drop_limit' => $hardDropLimit
        ];
    }

    /**
     * Increment the raw hit counter for a container (Step 6 of the proxy pipeline).
     *
     * A "hit" is any event that passed auth + consent + dedup and reached fan-out,
     * regardless of forwarding success. Used for billing and rate-limiting.
     */
    public function incrementHit(int $containerId): void
    {
        DB::connection('tenant_dynamic')->table('ec_tracking_usage')
            ->updateOrInsert(
                ['container_id' => $containerId, 'date' => now()->toDateString()],
                [
                    'hits_total' => DB::raw('hits_total + 1'),
                    'updated_at' => now(),
                ]
            );
    }
}
