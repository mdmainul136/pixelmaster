<?php

namespace App\Console\Commands\Tracking;

use Illuminate\Console\Command;
use App\Modules\Tracking\Services\ClickHouseService;

class ClickHouseMigrateCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'tracking:clickhouse-migrate';

    /**
     * The console command description.
     */
    protected $description = 'Provision ClickHouse MergeTree analytical tables for massive event volumes.';

    /**
     * Execute the console command.
     */
    public function handle(ClickHouseService $clickhouse)
    {
        if (!config('infrastructure.clickhouse.enabled', env('CLICKHOUSE_ENABLED', false))) {
            $this->warn('ClickHouse is not enabled in settings. Enable it first.');
            return 1;
        }

        $tenants = \App\Models\Tenant::all();
        if ($tenants->isEmpty()) {
            $this->warn('No tenants found to migrate ClickHouse databases.');
            return 0;
        }

        $this->info("Starting ClickHouse Migration for {$tenants->count()} tenants...");

        foreach ($tenants as $tenant) {
            $dbName = env('CLICKHOUSE_DATABASE', 'tracking') . '_' . str_replace('-', '_', $tenant->id);
            $this->info("Provisioning isolated analytical database: {$dbName}");
            
            // Create Tenant Database
            $clickhouse->setDatabase('default'); // Switch to default to create the DB first
            $clickhouse->statement("CREATE DATABASE IF NOT EXISTS {$dbName}");
            
            // Switch to Tenant Database
            $clickhouse->setDatabase($dbName);

            $tableQuery = "
                CREATE TABLE IF NOT EXISTS tracking_event_logs (
                    id UUID,
                    container_id UInt64,
                    event_type LowCardinality(String),
                    event_data String,
                    client_id String,
                    user_id String,
                    source LowCardinality(String),
                    ip_address String,
                    user_agent String,
                    status_code UInt16,
                    created_at DateTime DEFAULT now()
                ) ENGINE = MergeTree()
                ORDER BY (container_id, created_at, event_type)
                PARTITION BY toYYYYMM(created_at)
            ";

            if (!$clickhouse->statement($tableQuery)) {
                $this->error("Failed to provision ClickHouse table for tenant: {$tenant->id}");
                return 1;
            }
        }

        $this->info("✓ All tenant ClickHouse databases have been successfully provisioned!");
        return 0;
    }
}
