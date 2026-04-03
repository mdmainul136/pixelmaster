<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class InitClickHouseSchema extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'clickhouse:init-schema';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Initialize the ClickHouse database schema for high-throughput tracking event logs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Initializing ClickHouse Schema: tracking_event_logs');

        $query = "
            CREATE TABLE IF NOT EXISTS tracking_event_logs
            (
                -- Identity
                tenant_id        String,
                container_id     UInt64,

                -- Event
                event_id         String,
                event_name       String,
                client_id        String,

                -- Source
                source_ip        String,
                user_agent       String,
                page_url         String,
                referer          String,

                -- User
                user_hash        String,
                phone_hash       String,
                anonymous_id     String,
                identity_id      UInt64,

                -- Conversion
                value            Decimal(12, 2),
                currency         String,
                order_id         String,

                -- Geo
                country          LowCardinality(String),
                city             LowCardinality(String),
                region           LowCardinality(String),

                -- UTM
                utm_source       LowCardinality(String),
                utm_medium       LowCardinality(String),
                utm_campaign     String,
                utm_content      String,

                -- Processing
                status           LowCardinality(String) DEFAULT 'received',
                status_code      UInt16,
                request_id       String,
                retry_count      UInt8 DEFAULT 0,

                -- Results
                destinations_result String,  -- JSON string instead of native JSON object
                payload             String,  -- JSON string instead of native JSON object

                -- Time
                processed_at     DateTime DEFAULT now(),
                created_at       DateTime DEFAULT now()
            )
            ENGINE = MergeTree()
            PARTITION BY toYYYYMM(processed_at)
            ORDER BY (tenant_id, container_id, processed_at)
            SETTINGS index_granularity = 8192;
        ";

        try {
            DB::connection('clickhouse')->statement($query);
            $this->info("ClickHouse 'tracking_event_logs' table created successfully.");
        } catch (\Exception $e) {
            $this->error("Failed to execute ClickHouse schema creation.");
            $this->error($e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
