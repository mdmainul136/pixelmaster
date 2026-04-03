<?php

namespace App\Modules\Tracking\Console;

use App\Modules\Tracking\Actions\ProcessTrackingEventAction;
use App\Modules\Tracking\DTOs\TrackingEventDTO;
use App\Models\Tracking\TrackingContainer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * KafkaTrackingConsumer — Artisan Command
 *
 * Consumes tracking events from AWS MSK (Kafka) and runs them through
 * the full event pipeline: validate → dedup → enrich → fan-out.
 *
 * Usage:
 *   php artisan tracking:kafka-consume
 *   php artisan tracking:kafka-consume --partition=3 --group=tracking-consumer-2
 *
 * In Supervisor (production):
 *   command=php /var/www/html/artisan tracking:kafka-consume
 *   numprocs=4  (one per Kafka partition group)
 *
 * Kafka Topic Config (12 partitions, 3 brokers):
 *   KAFKA_BROKERS=b-1.xxx.kafka.ap-southeast-1.amazonaws.com:9092,...
 *   KAFKA_TOPIC_EVENTS=sgtm-events
 *   KAFKA_CONSUMER_GROUP=tracking-workers
 */
class KafkaTrackingConsumer extends Command
{
    protected $signature = 'tracking:kafka-consume
                            {--group=tracking-workers : Kafka consumer group ID}
                            {--topic= : Override Kafka topic (default: KAFKA_TOPIC_EVENTS)}
                            {--timeout=0 : Max runtime in seconds (0 = run forever)}
                            {--max-messages=0 : Stop after N messages (0 = unlimited)}';

    protected $description = 'Consume tracking events from Kafka (AWS MSK) and process them';

    private int $processed  = 0;
    private int $errors     = 0;
    private int $skipped    = 0;
    private bool $shouldStop = false;

    public function __construct(
        private readonly ProcessTrackingEventAction $action
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $topic     = $this->option('topic') ?? env('KAFKA_TOPIC_EVENTS', 'sgtm-events');
        $group     = $this->option('group');
        $maxTime   = (int) $this->option('timeout');
        $maxMsgs   = (int) $this->option('max-messages');
        $brokers   = env('KAFKA_BROKERS', 'localhost:9092');

        $this->info("🚀 Kafka consumer starting...");
        $this->info("   Topic:  {$topic}");
        $this->info("   Group:  {$group}");
        $this->info("   Broker: {$brokers}");

        if (!extension_loaded('rdkafka')) {
            $this->error("❌ rdkafka PHP extension not installed.");
            $this->line("   Run: pecl install rdkafka");
            return Command::FAILURE;
        }

        // ── Configure Kafka consumer ──────────────────────────────────────────
        $conf = new \RdKafka\Conf();
        $conf->set('group.id',                    $group);
        $conf->set('metadata.broker.list',         $brokers);
        $conf->set('auto.offset.reset',            'earliest');
        $conf->set('enable.auto.commit',           'false');  // Manual commit after process
        $conf->set('session.timeout.ms',           '30000');
        $conf->set('heartbeat.interval.ms',        '10000');
        $conf->set('max.poll.interval.ms',         '300000');
        $conf->set('security.protocol',            'SASL_SSL'); // AWS MSK requires SSL
        $conf->set('sasl.mechanisms',              'AWS_MSK_IAM');
        $conf->set('sasl.oauthbearer.config',      'awsRegion=' . env('AWS_DEFAULT_REGION', 'ap-southeast-1'));

        $conf->setRebalanceCb(function (\RdKafka\KafkaConsumer $kafka, $err, ?array $partitions) {
            match ($err) {
                RD_KAFKA_RESP_ERR__ASSIGN_PARTITIONS => $kafka->assign($partitions),
                RD_KAFKA_RESP_ERR__REVOKE_PARTITIONS => $kafka->assign(null),
                default => Log::warning("[Kafka] Rebalance error: {$err}"),
            };
        });

        try {
            $consumer = new \RdKafka\KafkaConsumer($conf);
            $consumer->subscribe([$topic]);

            $startTime = time();

            $this->info("✅ Subscribed to topic: {$topic}. Waiting for messages...\n");

            // ── Main consume loop ─────────────────────────────────────────────
            while (!$this->shouldStop) {
                // Check time/message limits
                if ($maxTime > 0 && (time() - $startTime) >= $maxTime) {
                    $this->info("⏰ Max runtime reached ({$maxTime}s). Stopping.");
                    break;
                }

                if ($maxMsgs > 0 && $this->processed >= $maxMsgs) {
                    $this->info("✉️  Max messages reached ({$maxMsgs}). Stopping.");
                    break;
                }

                // Poll for messages (1s timeout)
                $message = $consumer->consume(1000);

                match ($message->err) {
                    RD_KAFKA_RESP_ERR_NO_ERROR         => $this->processMessage($consumer, $message),
                    RD_KAFKA_RESP_ERR__PARTITION_EOF   => null, // End of partition — normal
                    RD_KAFKA_RESP_ERR__TIMED_OUT       => null, // No messages — normal
                    default => $this->handleKafkaError($message),
                };

                // Print progress every 100 messages
                if ($this->processed > 0 && $this->processed % 100 === 0) {
                    $this->line("📊 Processed: {$this->processed} | Errors: {$this->errors} | Skipped: {$this->skipped}");
                }
            }

        } catch (\Throwable $e) {
            Log::critical('[Kafka] Consumer crashed', ['error' => $e->getMessage()]);
            $this->error("💥 Fatal: {$e->getMessage()}");
            return Command::FAILURE;
        }

        $this->info("\n✅ Consumer stopped cleanly.");
        $this->line("   Processed: {$this->processed} | Errors: {$this->errors} | Skipped: {$this->skipped}");

        return Command::SUCCESS;
    }

    /**
     * Process a single Kafka message through the tracking pipeline.
     */
    private function processMessage(\RdKafka\KafkaConsumer $consumer, \RdKafka\Message $message): void
    {
        $payload = json_decode($message->payload, true);

        if (!is_array($payload)) {
            Log::warning('[Kafka] Invalid JSON payload', ['raw' => substr($message->payload, 0, 200)]);
            $consumer->commit($message);
            $this->skipped++;
            return;
        }

        $containerId = $payload['container_id'] ?? null;

        if (!$containerId) {
            Log::warning('[Kafka] Missing container_id in payload');
            $consumer->commit($message);
            $this->skipped++;
            return;
        }

        try {
            $container = TrackingContainer::find($containerId);

            if (!$container || !$container->is_active) {
                $this->skipped++;
                $consumer->commit($message);
                return;
            }

            // Build DTO from Kafka message payload
            $dto = new TrackingEventDTO(
                containerId: $container->id,
                eventName:   $payload['event_name']   ?? 'unknown',
                eventId:     $payload['event_id']     ?? null,
                sessionId:   $payload['session_id']   ?? null,
                clientId:    $payload['client_id']    ?? null,
                sourceIp:    $payload['source_ip']    ?? null,
                userAgent:   $payload['user_agent']   ?? null,
                pageUrl:     $payload['page_url']     ?? null,
                userData:    $payload['user_data']    ?? [],
                customData:  $payload['custom_data']  ?? [],
                fbp:         $payload['_fbp']         ?? null,
                fbc:         $payload['_fbc']         ?? null,
                consentData: $payload['consent']      ?? [],
                requestId:   $payload['_request_id']  ?? null,
                retryCount:  $payload['_retry_count'] ?? 0,
            );

            // Run full pipeline
            $this->action->execute($container, $dto);

            // Commit AFTER successful processing (at-least-once semantics)
            $consumer->commit($message);
            $this->processed++;

        } catch (\Throwable $e) {
            Log::error('[Kafka] Processing failed', [
                'container_id' => $containerId,
                'event_id'     => $payload['event_id'] ?? null,
                'error'        => $e->getMessage(),
                'partition'    => $message->partition,
                'offset'       => $message->offset,
            ]);

            // Commit anyway to avoid infinite retry loop on poison pill messages
            // For critical retries: push to DLQ instead
            $consumer->commit($message);
            $this->errors++;
        }
    }

    private function handleKafkaError(\RdKafka\Message $message): void
    {
        Log::error('[Kafka] Consumer error', [
            'error' => $message->errstr(),
            'code'  => $message->err,
        ]);
        $this->errors++;
    }
}
