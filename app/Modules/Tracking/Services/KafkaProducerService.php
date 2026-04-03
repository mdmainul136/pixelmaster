<?php

namespace App\Modules\Tracking\Services;

use Illuminate\Support\Facades\Log;
use Junges\Kafka\Facades\Kafka;
use Junges\Kafka\Message\Message;

/**
 * High-Throughput Kafka Producer Service
 *
 * This service takes validated incoming tracking events and buffers them
 * into Apache Kafka topics. This keeps the PHP HTTP workers extremely fast
 * and shifts the heavy lifting (MySQL insert, Destination mapping) to background
 * consumer processes or directly into ClickHouse.
 */
class KafkaProducerService
{
    /**
     * The default Kafka topic for tracking events.
     */
    protected string $topic;

    public function __construct()
    {
        $this->topic = config('kafka.topics.tracking_events', env('KAFKA_TOPIC_EVENTS', 'tracking-events'));
    }

    /**
     * Publish an event payload aggressively to Kafka.
     *
     * @param array $payload Validated normalized event array
     * @param string|null $messageKey Partitioning key (e.g. client_id or container_id)
     * @return bool
     */
    public function publishEvent(array $payload, ?string $messageKey = null): bool
    {
        try {
            // Local fallback logic: if running on local windows without PECL rdkafka, 
            // safely mock the queue so the system doesn't crash.
            if (!extension_loaded('rdkafka')) {
                Log::channel('single')->info("[KAFKA MOCK - Missing rdkafka ext] Published to topic ({$this->topic})", [
                    'key'     => $messageKey,
                    'payload' => $payload,
                ]);
                return true;
            }

            // Real Kafka Publish natively via C library
            $message = new Message(
                headers: [
                    'Process-ID' => uniqid('msg_', true),
                    'Source-IP'  => request()->ip() ?? 'CLI',
                ],
                body: $payload,
                key: $messageKey
            );

            Kafka::publishOn($this->topic)
                ->withBrokers(config('kafka.brokers', env('KAFKA_BROKERS', '127.0.0.1:9092')))
                ->withMessage($message)
                ->send();

            return true;

        } catch (\Exception $e) {
            // Fallback strategy: If Kafka is down, log an emergency but don't break the HTTP request
            Log::emergency("Kafka publish failed: {$e->getMessage()}", [
                'payload' => $payload,
                'topic'   => $this->topic
            ]);
            
            // In a full implementation, you might want to dispatch to a secondary Redis queue here
            return false;
        }
    }
}
