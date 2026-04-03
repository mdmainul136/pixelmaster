<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Queue Connection Name
    |--------------------------------------------------------------------------
    |
    | Laravel's queue supports a variety of backends via a single, unified
    | API, giving you convenient access to each backend using identical
    | syntax for each. The default queue connection is defined below.
    |
    */

    'default' => env('QUEUE_CONNECTION', 'database'),

    /*
    |--------------------------------------------------------------------------
    | Queue Connections
    |--------------------------------------------------------------------------
    |
    | Here you may configure the connection options for every queue backend
    | used by your application. An example configuration is provided for
    | each backend supported by Laravel. You're also free to add more.
    |
    | Drivers: "sync", "database", "beanstalkd", "sqs", "redis",
    |          "deferred", "background", "failover", "null"
    |
    */

    'connections' => [

        'sync' => [
            'driver' => 'sync',
        ],

        'database' => [
            'driver' => 'database',
            'connection' => env('DB_QUEUE_CONNECTION'),
            'table' => env('DB_QUEUE_TABLE', 'jobs'),
            'queue' => env('DB_QUEUE', 'default'),
            'retry_after' => (int) env('DB_QUEUE_RETRY_AFTER', 90),
            'after_commit' => false,
        ],

        'beanstalkd' => [
            'driver' => 'beanstalkd',
            'host' => env('BEANSTALKD_QUEUE_HOST', 'localhost'),
            'queue' => env('BEANSTALKD_QUEUE', 'default'),
            'retry_after' => (int) env('BEANSTALKD_QUEUE_RETRY_AFTER', 90),
            'block_for' => 0,
            'after_commit' => false,
        ],

        'sqs' => [
            'driver' => 'sqs',
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'prefix' => env('SQS_PREFIX', 'https://sqs.us-east-1.amazonaws.com/your-account-id'),
            'queue' => env('SQS_QUEUE', 'default'),
            'suffix' => env('SQS_SUFFIX'),
            'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
            'after_commit' => false,
        ],

        'redis' => [
            'driver'      => 'redis',
            'connection'  => env('REDIS_QUEUE_CONNECTION', 'default'),
            'queue'       => env('REDIS_QUEUE', 'default'),
            'retry_after' => (int) env('REDIS_QUEUE_RETRY_AFTER', 90),
            'block_for'   => null,
            'after_commit'=> false,
        ],

        // ── Tracking Fan-out Queue (high-priority, per-destination jobs) ─────
        // Set TRACKING_QUEUE_CONNECTION=sqs in .env for Phase 3 SQS migration
        'tracking' => [
            'driver'      => env('TRACKING_QUEUE_CONNECTION', 'redis'),
            'connection'  => env('REDIS_QUEUE_CONNECTION', 'default'),
            'queue'       => 'tracking',
            'retry_after' => 90,
            'after_commit'=> false,
        ],

        // ── Tracking Log Queue (lower-priority, event log writes) ────────────
        'tracking-logs' => [
            'driver'      => env('TRACKING_QUEUE_CONNECTION', 'redis'),
            'connection'  => env('REDIS_QUEUE_CONNECTION', 'default'),
            'queue'       => 'tracking-logs',
            'retry_after' => 120,
            'after_commit'=> false,
        ],

        // ── Tracking Fan-out Queue (SQS — per-destination async fan-out) ──────
        // Each destination gets its own ForwardToDestinationJob on this queue.
        // Set TRACKING_SQS_DRIVER=sqs and SQS_PREFIX in .env.
        // Local dev: falls back to redis.
        'tracking-fanout' => [
            'driver'      => env('TRACKING_SQS_DRIVER', 'redis'),
            'key'         => env('AWS_ACCESS_KEY_ID'),
            'secret'      => env('AWS_SECRET_ACCESS_KEY'),
            'prefix'      => env('SQS_PREFIX', 'https://sqs.us-east-1.amazonaws.com/your-account-id'),
            'queue'       => env('SQS_TRACKING_FANOUT_QUEUE', 'tracking-fanout'),
            'region'      => env('AWS_DEFAULT_REGION', 'us-east-1'),
            'retry_after' => 90,
            'after_commit'=> false,
            // Redis fallback config (ignored when driver=sqs)
            'connection'  => env('REDIS_QUEUE_CONNECTION', 'default'),
        ],

        // ── Tracking Infra Queue (SQS — slow provisioning jobs) ─────────────
        // Metabase dashboard provisioning, Kubernetes container setup, etc.
        'tracking-infra' => [
            'driver'      => env('TRACKING_SQS_DRIVER', 'redis'),
            'key'         => env('AWS_ACCESS_KEY_ID'),
            'secret'      => env('AWS_SECRET_ACCESS_KEY'),
            'prefix'      => env('SQS_PREFIX', 'https://sqs.us-east-1.amazonaws.com/your-account-id'),
            'queue'       => env('SQS_TRACKING_INFRA_QUEUE', 'tracking-infra'),
            'region'      => env('AWS_DEFAULT_REGION', 'us-east-1'),
            'retry_after' => 120,
            'after_commit'=> false,
            'connection'  => env('REDIS_QUEUE_CONNECTION', 'default'),
        ],



        'deferred' => [
            'driver' => 'deferred',
        ],

        'background' => [
            'driver' => 'background',
        ],

        'failover' => [
            'driver' => 'failover',
            'connections' => [
                'database',
                'deferred',
            ],
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Job Batching
    |--------------------------------------------------------------------------
    |
    | The following options configure the database and table that store job
    | batching information. These options can be updated to any database
    | connection and table which has been defined by your application.
    |
    */

    'batching' => [
        'database' => env('DB_CONNECTION', 'sqlite'),
        'table' => 'job_batches',
    ],

    /*
    |--------------------------------------------------------------------------
    | Failed Queue Jobs
    |--------------------------------------------------------------------------
    |
    | These options configure the behavior of failed queue job logging so you
    | can control how and where failed jobs are stored. Laravel ships with
    | support for storing failed jobs in a simple file or in a database.
    |
    | Supported drivers: "database-uuids", "dynamodb", "file", "null"
    |
    */

    'failed' => [
        'driver' => env('QUEUE_FAILED_DRIVER', 'database-uuids'),
        'database' => env('DB_CONNECTION', 'sqlite'),
        'table' => 'failed_jobs',
    ],

];
