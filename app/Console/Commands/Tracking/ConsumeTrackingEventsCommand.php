<?php

namespace App\Console\Commands\Tracking;

use Illuminate\Console\Command;
use Junges\Kafka\Facades\Kafka;
use Junges\Kafka\Contracts\MessageConsumer;
use Junges\Kafka\Contracts\ConsumerMessage;
use Illuminate\Support\Facades\Log;
use App\Models\Tracking\TrackingEventLog;
use App\Models\Tracking\TrackingContainer;
use App\Modules\Tracking\Services\ClickHouseService;
use Illuminate\Support\Str;

/**
 * Superfast Kafka Event Loop Consumer
 *
 * This daemon is designed to be configured in Supervisor. It pulls continuously 
 * from the Apache Kafka Tracking bus and writes into destination databases 
 * (MySQL via standard jobs, or ClickHouse natively during Phase 3).
 *
 * Usage: php artisan tracking:kafka-consume
 */
class ConsumeTrackingEventsCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'tracking:kafka-consume {--topic=}';

    /**
     * The console command description.
     */
    protected $description = 'Listen to the Kafka Events Bus and persist tracking hit rates indefinitely.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!extension_loaded('rdkafka')) {
            $this->error('The rdkafka pecl extension is missing. Kafka consumer cannot start.');
            $this->error('For local dev fallback on Windows, the Producer runs in Memory Mock mode, but Consumers require a real Broker.');
            return 1;
        }

        $topic = $this->option('topic') ?? config('kafka.topics.tracking_events', env('KAFKA_TOPIC_EVENTS', 'tracking-events'));
        $this->info("Starting Apache Kafka Consumer on Topic: {$topic}");
        
        // Build the continuous listener
        $consumer = Kafka::consumer([$topic])
            ->withBrokers(config('kafka.brokers', env('KAFKA_BROKERS', '127.0.0.1:9092')))
            ->withConsumerGroupId('primary-tracking-mysql-ingester')
            ->withHandler(function ($message, $consumer) {
                try {
                    $payload = $message->getBody();
                    $this->processEvent($payload);
                } catch (\Exception $e) {
                    Log::error("Kafka Consume Failure: " . $e->getMessage());
                    // Decide if we acknowledge, dead-letter, or throw depending on retry logic
                }
            })
            ->build();

        // Blocking loop starts here
        $consumer->consume();

        return 0;
    }

    /**
     * Process normalized Kafka JSON event into MySQL or Redis fanout queues.
     * Note: In Phase 3, this function might be deleted completely if 
     * ClickHouse points directly at Kafka natively!
     */
    private function processEvent(array $payload)
    {
        // Check array integrity
        if (empty($payload['container_id']) || empty($payload['events'])) {
            return;
        }

        // tenant_id must be provided by the producer for DB isolation to succeed
        if (empty($payload['tenant_id'])) {
            Log::warning("Kafka Consumer: Missing tenant_id in payload. Skipping event.", ['container_id' => $payload['container_id']]);
            return;
        }

        try {
            // ⚡ Context Switch: Initialize Tenant Environment dynamically
            tenancy()->initialize($payload['tenant_id']);
            
            /** @var TrackingContainer $container */
            $container = TrackingContainer::find($payload['container_id']);
            if (!$container) {
                tenancy()->end();
                return;
            }

        $source   = $payload['source'] ?? 'unknown';
        $ip       = $payload['ip_address'] ?? null;
        $agent    = $payload['user_agent'] ?? null;
        
        $isClickhouseEnabled = config('infrastructure.clickhouse.enabled', env('CLICKHOUSE_ENABLED', false) === true || env('CLICKHOUSE_ENABLED') === 'true');
        $clickhouseBatch = [];

        foreach ($payload['events'] as $event) {
            
            // Phase 3: Analytical Storage Forking
            if ($isClickhouseEnabled) {
                // Buffer for Bulk Insert via HTTP
                $clickhouseBatch[] = [
                    'id'           => Str::uuid()->toString(),
                    'container_id' => $container->id,
                    'event_type'   => $event['name'],
                    'event_data'   => json_encode($event['params']),
                    'client_id'    => $payload['client_id'] ?? '',
                    'user_id'      => $payload['user_id'] ?? '',
                    'source'       => ltrim($source, '\\'),
                    'ip_address'   => $ip ?? '',
                    'user_agent'   => $agent ?? '',
                    'status_code'  => 200,
                    'created_at'   => date('Y-m-d H:i:s'),
                ];
            } else {
                // Legacy Phase 1: Local Tracking Logs DB MySQL ingestion
                TrackingEventLog::create([
                    'container_id' => $container->id,
                    'event_type'   => $event['name'],
                    'event_data'   => $event['params'],
                    'client_id'    => $payload['client_id'] ?? null,
                    'user_id'      => $payload['user_id'] ?? null,
                    'source'       => $source,
                    'ip_address'   => $ip,
                    'user_agent'   => $agent,
                    'status_code'  => 200,
                ]);
            }

            // Phase 4: Extreme Low-Latency Quota/Billing Increment (O(1) Memory Hit)
            if (!empty($payload['tenant_id'])) {
                $quotaKey = "tracking_usage:{$payload['tenant_id']}:" . date('Y-m-d') . ":events_received";
                \Illuminate\Support\Facades\Redis::incr($quotaKey);
            }

            // Dispatch Forward Destinations jobs
            $destinations = $container->destinations()->where('is_active', true)->get();
            
            $enrichedEvent = array_merge($event, [
                'client_id'  => $payload['client_id'] ?? null,
                'user_id'    => $payload['user_id'] ?? null,
                'ip_address' => $ip,
                'user_agent' => $agent,
            ]);

            foreach ($destinations as $destination) {
                dispatch(new \App\Modules\Tracking\Jobs\ForwardToDestinationJob(
                    $destination->id,
                    $enrichedEvent,
                    $container->settings['mappings'] ?? null,
                    $container->settings['power_ups'] ?? null
                ))->onQueue(env('REDIS_QUEUE_CONNECTION', 'default'));
            }
        }
        
        // Execute Phase 3 Bulk Write
        if ($isClickhouseEnabled && !empty($clickhouseBatch)) {
            app(ClickHouseService::class)->bulkInsert('tracking_event_logs', $clickhouseBatch);
        }


        } catch (\Exception $e) {
            Log::error("Kafka Consumer Context Error: " . $e->getMessage(), ['tenant' => $payload['tenant_id'] ?? null]);
            
            // 🔄 DLQ Integration: Rescue orphaned ClickHouse / Database inserts 
            if (!empty($clickhouseBatch)) {
                $dlqService = app(\App\Modules\Tracking\Services\RetryQueueService::class);
                foreach ($clickhouseBatch as $failedEvent) {
                    try {
                        $dlqService->enqueue([
                            'container_id'     => $payload['container_id'],
                            'destination_type' => 'database_bulk_insert',
                            'event_name'       => $failedEvent['event_type'] ?? 'unknown',
                            'event_payload'    => $failedEvent,
                            'error_message'    => substr("Kafka write error: " . $e->getMessage(), 0, 500),
                            'attempt_count'    => 1,
                            'max_attempts'     => 5
                        ]);
                    } catch (\Exception $dlqException) {
                        Log::emergency("DLQ WRITE FAILED: " . $dlqException->getMessage());
                    }
                }
            }
        } finally {
            // Restore global context to wait for the next Kafka generic message
            tenancy()->end();
        }
    }
}
