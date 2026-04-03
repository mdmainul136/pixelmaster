<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Kafka Brokers
    |--------------------------------------------------------------------------
    |
    | Here you may specify the connections details for your Kafka brokers.
    | You can specify multiple brokers separated by a comma.
    |
    */
    'brokers' => env('KAFKA_BROKERS', '127.0.0.1:9092'),

    /*
    |--------------------------------------------------------------------------
    | Topics
    |--------------------------------------------------------------------------
    |
    | A list of default topics used across the application to prevent
    | hardcoding topic names in services.
    |
    */
    'topics' => [
        'tracking_events' => env('KAFKA_TOPIC_EVENTS', 'tracking-events'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Producer Configuration
    |--------------------------------------------------------------------------
    */
    'producer' => [
        'message' => \Junges\Kafka\Message\Message::class,
        'serializer' => \Junges\Kafka\Message\Serializers\JsonSerializer::class,
        'flush_timeout' => 10000,
        'retries' => 3,
        'retry_backoff_ms' => 100,
    ],

    /*
    |--------------------------------------------------------------------------
    | Consumer Configuration
    |--------------------------------------------------------------------------
    */
    'consumer' => [
        'auto_commit' => true,
        'auto_offset_reset' => 'latest', // Consume from the end of the topic
        'deserializer' => \Junges\Kafka\Message\Deserializers\JsonDeserializer::class,
    ],
];
