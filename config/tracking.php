<?php

// Tracking Module Configuration
return [

    /*
    |--------------------------------------------------------------------------
    | Docker Orchestrator Settings
    |--------------------------------------------------------------------------
    */
    'docker' => [
        // Custom Node.js tracking proxy image
        // Build: docker build -t sgtm-tracking-proxy:latest ./docker/sgtm
        'image'            => env('SGTM_DOCKER_IMAGE', 'sgtm-tracking-proxy:latest'),
        
        // Docker network for inter-container communication
        'network'          => env('SGTM_DOCKER_NETWORK', 'tracking_network'),
        
        // NGINX config output directory
        'nginx_config_path' => env('SGTM_NGINX_CONFIG_PATH', '/etc/nginx/sites-enabled'),
        
        // Base domain for auto-generated subdomains
        // e.g. track-{slug}.yourdomain.com
        'base_domain'      => env('SGTM_BASE_DOMAIN', 'track.yourdomain.com'),
        
        // Port range start for container allocation
        'port_range_start' => (int) env('SGTM_PORT_RANGE_START', 9000),

        // ── Multi-Node Remote Docker Config ──────────────────────────
        // Mode: 'self_hosted' = run Docker on same server (dev/small scale)
        //        'remote_ssh' = SSH into AWS EC2 nodes (production)
        //        'remote_api' = Docker Remote API over TCP (advanced)
        'mode'                    => env('SGTM_DOCKER_MODE', 'self_hosted'),

        // SSH credentials for remote Docker nodes
        'ssh_key_path'            => env('SGTM_SSH_KEY_PATH', storage_path('app/ssh/sgtm-aws.pem')),
        'ssh_user'                => env('SGTM_SSH_USER', 'ubuntu'),
        'ssh_port'                => (int) env('SGTM_SSH_PORT', 22),

        // Node capacity limits
        'max_containers_per_node' => (int) env('SGTM_MAX_CONTAINERS_PER_NODE', 50),

        // Health check interval in seconds (cron: every 5 min)
        'health_check_interval'   => (int) env('SGTM_HEALTH_CHECK_INTERVAL', 300),

        // Google Official sGTM image (tag processing engine)
        'sgtm_image'              => env('SGTM_GOOGLE_IMAGE', 'gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable'),

        // Power-Ups sidecar image (custom loader, click ID restorer, debug UI)
        'sidecar_image'           => env('SGTM_SIDECAR_IMAGE', 'sgtm-tracking-proxy:latest'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Blocked IPs for Bot Filtering (Power-Up: bot_filter)
    |--------------------------------------------------------------------------
    */
    'blocked_ips' => array_filter(explode(',', env('TRACKING_BLOCKED_IPS', ''))),

    /*
    |--------------------------------------------------------------------------
    | Internal Processor Queue Tiers
    |--------------------------------------------------------------------------
    | Maps plan tiers (defined in config/plans.php) to internal tracking
    | queue pools and processing priorities.
    */
    'tiers' => [
        'free' => [
            'priority'    => 10,
            'queue_pool'  => 'tracking:free',
            'power_ups'   => ['dedupe', 'anonymize'],
        ],
        'pro' => [
            'priority'    => 50,
            'queue_pool'  => 'tracking:pro',
            'power_ups'   => ['dedupe', 'anonymize', 'consent_mode', 'cookie_extend', 'bot_filter', 'poas'],
        ],
        'business' => [
            'priority'    => 100,
            'queue_pool'  => 'tracking:business',
            'power_ups'   => ['dedupe', 'anonymize', 'consent_mode', 'cookie_extend', 'geo_enrich', 'bot_filter', 'poas', 'phone_formatter'],
        ],
        'enterprise' => [
            'priority'    => 200,
            'queue_pool'  => 'tracking:enterprise',
            'power_ups'   => ['dedupe', 'anonymize', 'consent_mode', 'cookie_extend', 'geo_enrich', 'bot_filter', 'poas', 'phone_formatter', 'advanced_routing'],
        ],
        'custom' => [
            'priority'    => 200,
            'queue_pool'  => 'tracking:enterprise',
            'power_ups'   => ['dedupe', 'anonymize', 'consent_mode', 'cookie_extend', 'geo_enrich', 'bot_filter', 'poas', 'phone_formatter', 'advanced_routing'],
        ],
    ],

    /**
     * Threshold multiplier for usage suspension.
     * 1.5 means container suspends at 150% of event_limit (50% overage allowed before dropping).
     */
    'suspension_threshold' => (float) env('TRACKING_SUSPENSION_THRESHOLD', 1.5),

    /*
    |--------------------------------------------------------------------------
    | AWS / K8s Infrastructure Proven Specs
    |--------------------------------------------------------------------------
    */
    'infra' => [
        'pod_spec' => [
            'cpu_request'    => '500m',
            'cpu_limit'      => '1000m',
            'memory_request' => '1Gi',
            'memory_limit'   => '2Gi',
            'events_per_sec' => 300, // Average throughput per pod
        ],
        'cost_per_mil' => 0.80, // Revenue optimization target
    ],

    /*
    |--------------------------------------------------------------------------
    | Tier 2: ClickHouse Sidecar (Event Data Lake)
    |--------------------------------------------------------------------------
    | Used for high-volume raw event storage to keep MySQL performant.
    */
    'clickhouse' => [
        'enabled'  => env('CLICKHOUSE_ENABLED', true),
        'host'     => env('CLICKHOUSE_HOST', '127.0.0.1'),
        'port'     => env('CLICKHOUSE_PORT', '8123'),
        'database' => env('CLICKHOUSE_DB', 'sgtm_tracking'),
        'username' => env('CLICKHOUSE_USER', 'default'),
        'password' => env('CLICKHOUSE_PASSWORD', ''),
        'table'    => env('CLICKHOUSE_TABLE', 'sgtm_events'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Metabase Analytics Integration
    |--------------------------------------------------------------------------
    | Auto-clones template dashboards for each new tracking container.
    */
    'metabase' => [
        'enabled'                => env('METABASE_ENABLED', true),
        'url'                    => env('METABASE_URL', ''),
        'email'                  => env('METABASE_ADMIN_EMAIL', ''),
        'password'               => env('METABASE_ADMIN_PASSWORD', ''),
        'template_dashboard_id'  => (int) env('METABASE_TEMPLATE_DASHBOARD_ID', 1),
        'embed_secret'           => env('METABASE_EMBED_SECRET', ''),
    ],

];
