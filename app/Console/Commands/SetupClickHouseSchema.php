<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Modules\Tracking\Services\ClickHouseEventLogService;
use Illuminate\Support\Facades\Log;

class SetupClickHouseSchema extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tracking:setup-clickhouse {--type=all}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Initialize the ClickHouse schema for sGTM tracking events.';

    /**
     * Execute the console command.
     */
    public function handle(ClickHouseEventLogService $clickhouse)
    {
        $typeParam = $this->option('type');
        $types = ($typeParam === 'all') ? ['self_hosted', 'cloud'] : [$typeParam];

        foreach ($types as $type) {
            $this->info("🚀 Starting ClickHouse Schema Setup for [{$type}]...");
            
            $clickhouse->configureFor($type);
            
            // Build DDLs
            $database = \App\Models\GlobalSetting::get("{$type}_database", 'sgtm_tracking');
            
            $createDb = "CREATE DATABASE IF NOT EXISTS {$database}";
            
            $createTable = "CREATE TABLE IF NOT EXISTS {$database}.sgtm_events (
                tenant_id       UInt32,
                container_id    LowCardinality(String),
                event_id        String CODEC(ZSTD(3)),
                event_name      LowCardinality(String),
                source_ip       String CODEC(ZSTD(3)),
                user_hash       String FIXED_STRING(64) CODEC(LZ4),
                value           Nullable(Float64),
                currency        LowCardinality(String),
                request_id      String CODEC(ZSTD(3)),
                retry_count     UInt8 DEFAULT 0,
                payload         String CODEC(ZSTD(3)),
                status          LowCardinality(String) DEFAULT 'received',
                processed_at    DateTime64(3) DEFAULT now64() CODEC(Delta, LZ4)
            ) ENGINE = MergeTree()
            PARTITION BY toYYYYMM(processed_at)
            ORDER BY (tenant_id, container_id, processed_at)
            TTL processed_at + INTERVAL 12 MONTH;";

            $this->comment("Initializing Database [{$database}] on [{$type}]...");
            
            // We use the service's raw query method now for security/consistency
            $dbRes = $clickhouse->queryRaw($createDb);
            $tblRes = $clickhouse->queryRaw($createTable);

            // Note: queryRaw returns [] on success usually if it's DDL
            $this->info("✅ ClickHouse [{$type}] schema initialized.");
            Log::info("[ClickHouse] Schema initialized for {$type} via artisan command.");
        }

        return 0;
    }
}
