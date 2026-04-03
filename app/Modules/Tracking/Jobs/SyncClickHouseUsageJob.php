<?php

namespace App\Modules\Tracking\Jobs;

use App\Models\Tracking\TrackingContainer;
use App\Modules\Tracking\Services\ClickHouseEventLogService;
use App\Modules\Tracking\Services\TrackingUsageService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * SyncClickHouseUsageJob
 *
 * This job synchronizes the high-precision event counts from ClickHouse back
 * to the MySQL 'ec_tracking_usage' table for billing and dashboard persistence.
 *
 * Why: ClickHouse is the source of truth for events, but MySQL is the source 
 *      of truth for billing/tenancy.
 */
class SyncClickHouseUsageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct() {}

    public function handle(ClickHouseEventLogService $clickHouse, \App\Services\DatabaseManager $dbManager): void
    {
        Log::info('[SyncUsage] Starting ClickHouse -> MySQL usage sync');

        // 1. Get all active containers from the central database
        $containers = TrackingContainer::on('central')->where('is_active', true)->get();

        $startOfMonth = now()->startOfMonth()->toDateTimeString();
        $endOfMonth   = now()->endOfMonth()->toDateTimeString();
        $today        = now()->toDateString();

        foreach ($containers as $container) {
            /** @var \App\Models\Tracking\TrackingContainer $container */
            try {
                // SWITCH CONTEXT: Ensure we are writing to the correct tenant DB
                $dbManager->switchToTenantDatabase($container->tenant_id);
                // HYBRID SYNC: Configure for the container's preferred ClickHouse instance
                $clickHouse->configureFor($container->clickhouse_type ?? 'self_hosted');

                // 2. Fetch aggregate stats from ClickHouse for TODAY
                $statsSql = "SELECT 
                    count() as total,
                    countIf(status = 'processed') as processed,
                    countIf(status = 'failed') as failed
                    FROM sgtm_events 
                    WHERE tenant_id = {$container->tenant_id} 
                    AND container_id = {$container->id} 
                    AND processed_at >= '{$today} 00:00:00'";

                $clickData = $clickHouse->queryRaw($statsSql)['data'][0] ?? null;

                if ($clickData) {
                    // 3. Update MySQL Daily Usage table
                    DB::connection('tenant_dynamic')->table('ec_tracking_usage')
                        ->updateOrInsert(
                            ['container_id' => $container->id, 'date' => $today],
                            [
                                'events_received'  => (int) $clickData['total'],
                                'events_forwarded' => (int) $clickData['processed'],
                                'events_dropped'   => (int) $clickData['failed'],
                                'updated_at'       => now()
                            ]
                        );
                }

                // 4. Monthly Quota Enforcement (Advanced Security)
                // If usage > 110% of limit, we flag for auto-deactivation
                $tier = $container->settings['tier'] ?? 'basic';
                $limit = config("tracking.tiers.{$tier}.event_limit", 100000);
                
                $monthlyTotal = $clickHouse->getEventCount((int) $container->tenant_id, (int) $container->id, $startOfMonth, $endOfMonth);
                
                if ($monthlyTotal > ($limit * 1.1)) {
                    Log::warning("[SyncUsage] Container #{$container->id} exceeded quota (110%+). Auto-deactivating.", [
                        'usage' => $monthlyTotal,
                        'limit' => $limit
                    ]);
                    
                    $container->is_active = false;
                    $container->save();
                    // Notify User via Email/Notification (Future)
                }

            } catch (\Throwable $e) {
                Log::error("[SyncUsage] Failed for Container #{$container->id}", ['error' => $e->getMessage()]);
            }
        }

        Log::info('[SyncUsage] Completed usage sync');
    }
}
