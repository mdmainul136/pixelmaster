<?php

namespace App\Modules\Tracking\Console;

use App\Models\Tracking\TrackingContainer;
use ClickHouseDB\Client;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ClearOldLogsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tracking:cleanup-logs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up ClickHouse tracking events based on Custom Logs Retention settings.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Starting Custom Logs Retention cleanup...");

        // Fetch tenants with 'custom_logs_retention' Power Up enabled
        $containers = TrackingContainer::whereJsonContains('power_ups', 'custom_logs_retention')->get();

        if ($containers->isEmpty()) {
            $this->info("No containers have custom logs retention active.");
            return 0;
        }

        $clickhouseHost = env('CLICKHOUSE_HOST', 'localhost');
        $client = new Client([
            'host' => env('CLICKHOUSE_HOST', 'localhost'),
            'port' => env('CLICKHOUSE_PORT', '8123'),
            'username' => env('CLICKHOUSE_USER', 'default'),
            'password' => env('CLICKHOUSE_PASSWORD', ''),
        ]);

        $client->database(env('CLICKHOUSE_DB', 'sgtm_tracking'));

        foreach ($containers as $container) {
            // Defaulting custom days to 90 if the setting is missing but the power-up is active
            $retentionDays = $container->settings['retention_days'] ?? 90;
            
            $query = "ALTER TABLE sgtm_events DELETE WHERE container_id = '{$container->container_id}' AND processed_at < now() - INTERVAL {$retentionDays} DAY";
            
            try {
                // Execute Lightweight delete in Clickhouse
                $client->write($query);
                Log::info("[CustomLogsRetention] Cleared logs older than {$retentionDays} days for container {$container->container_id}");
                $this->info("Cleaned {$container->container_id} ({$retentionDays} days)");
            } catch (\Exception $e) {
                Log::error("[CustomLogsRetention] Failed for {$container->container_id}: " . $e->getMessage());
                $this->error("Failed to clean {$container->container_id}: {$e->getMessage()}");
            }
        }

        $this->info("Log Retention Cleanup Complete.");
        return 0;
    }
}
