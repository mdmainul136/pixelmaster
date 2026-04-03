<?php

return [
    /*
    |--------------------------------------------------------------------------
    | PixelMaster Tracking Plans â€” 5-Tier Architecture
    |--------------------------------------------------------------------------
    | Source of Truth for all feature gating, quotas, and billing logic.
    | Tiers: Free â†’ Pro â†’ Business â†’ Enterprise â†’ Custom
    |
    | Feature Categories:
    |   1. Core Features          (core_features)
    |   2. Advanced Infrastructure (advanced_infra)
    |   3. Account Management      (account_mgmt)
    |   4. Connections              (connections)
    |--------------------------------------------------------------------------
    */

    'free' => [
        'name'           => 'Free',
        'price_monthly'  => 0,
        'price_yearly'   => 0,
        'currency'       => 'USD',
        'request_limit'  => 10000,
        'log_retention'  => 0,          // No logs
        'multi_domains'  => 1,          // 1 domain only
        'features' => [
            // â”€â”€ 1. Core Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            'custom_domain',
            'custom_loader',
            'pixelmaster_analytics',
            'anonymizer',
            'http_header_config',
            'global_cdn',
            'geo_headers',
            'user_agent_info',
            'pixelmaster_api',
            'user_id',
            'open_container_bot_index',
            'click_id_restorer',
            'service_account',
            // â”€â”€ 3. Account Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            'transfer_ownership',
            'consolidated_invoice',
            'share_access',
            'two_factor_auth',
        ],
    ],

    'pro' => [
        'name'           => 'Pro',
        'price_monthly'  => 17,
        'price_yearly'   => 200,
        'currency'       => 'USD',
        'request_limit'  => 500000,
        'log_retention'  => 3,          // 3 days
        'multi_domains'  => 1,          // single domain
        'features' => [
            // â”€â”€ 1. Core Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            'custom_domain',
            'custom_loader',
            'pixelmaster_analytics',
            'anonymizer',
            'http_header_config',
            'global_cdn',
            'geo_headers',
            'user_agent_info',
            'pixelmaster_api',
            'user_id',
            'open_container_bot_index',
            'click_id_restorer',
            'service_account',
            // â”€â”€ Core: Pro Unlocks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            'logs',
            'cookie_keeper',
            'bot_detection',
            'ad_blocker_info',
            'poas_data_feed',
            'pixelmaster_store',
            // â”€â”€ 3. Account Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            'transfer_ownership',
            'consolidated_invoice',
            'share_access',
            'two_factor_auth',
            'google_sheets_connection',
            // â”€â”€ 4. Connections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            'data_manager_api',
            'google_ads_connection',
            'microsoft_ads_connection',
            'meta_custom_audiences',
        ],
    ],

    'business' => [
        'name'           => 'Business',
        'price_monthly'  => 83,
        'price_yearly'   => 1000,
        'currency'       => 'USD',
        'request_limit'  => 5000000,
        'log_retention'  => 10,         // 10 days
        'multi_domains'  => 20,         // up to 20
        'features' => [
            // â”€â”€ 1. Core Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            'custom_domain',
            'custom_loader',
            'pixelmaster_analytics',
            'anonymizer',
            'http_header_config',
            'global_cdn',
            'geo_headers',
            'user_agent_info',
            'pixelmaster_api',
            'user_id',
            'open_container_bot_index',
            'click_id_restorer',
            'service_account',
            'logs',
            'cookie_keeper',
            'bot_detection',
            'ad_blocker_info',
            'poas_data_feed',
            'pixelmaster_store',
            // â”€â”€ 2. Advanced Infrastructure â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            'multi_zone_infrastructure',
            'multi_domains',
            'monitoring',
            'file_proxy',
            'xml_to_json',
            'block_request_by_ip',
            'schedule_requests',
            'request_delay',
            // â”€â”€ 3. Account Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            'transfer_ownership',
            'consolidated_invoice',
            'share_access',
            'two_factor_auth',
            'google_sheets_connection',
            // â”€â”€ 4. Connections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            'data_manager_api',
            'google_ads_connection',
            'microsoft_ads_connection',
            'meta_custom_audiences',
        ],
    ],

    'enterprise' => [
        'name'           => 'Enterprise',
        'price_monthly'  => 0,          // Sales-negotiated
        'price_yearly'   => 0,
        'currency'       => 'USD',
        'request_limit'  => 50000000,   // 50M
        'log_retention'  => 30,         // 30 days
        'multi_domains'  => 50,         // up to 50
        'features' => [
            // â”€â”€ 1. Core Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            'custom_domain',
            'custom_loader',
            'pixelmaster_analytics',
            'anonymizer',
            'http_header_config',
            'global_cdn',
            'geo_headers',
            'user_agent_info',
            'pixelmaster_api',
            'user_id',
            'open_container_bot_index',
            'click_id_restorer',
            'service_account',
            'logs',
            'cookie_keeper',
            'bot_detection',
            'ad_blocker_info',
            'poas_data_feed',
            'pixelmaster_store',
            // â”€â”€ 2. Advanced Infrastructure â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            'multi_zone_infrastructure',
            'multi_domains',
            'monitoring',
            'file_proxy',
            'xml_to_json',
            'block_request_by_ip',
            'schedule_requests',
            'request_delay',
            // â”€â”€ 3. Account Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            'transfer_ownership',
            'consolidated_invoice',
            'share_access',
            'two_factor_auth',
            'google_sheets_connection',
            // â”€â”€ 4. Connections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            'data_manager_api',
            'google_ads_connection',
            'microsoft_ads_connection',
            'meta_custom_audiences',
        ],
    ],

    'custom' => [
        'name'           => 'Custom',
        'price_monthly'  => 0,          // Fully negotiated
        'price_yearly'   => 0,
        'currency'       => 'USD',
        'request_limit'  => -1,         // Unlimited / by arrangement
        'log_retention'  => -1,         // Custom retention
        'multi_domains'  => -1,         // By arrangement
        'features' => [
            // â”€â”€ 1. Core Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            'custom_domain',
            'custom_loader',
            'pixelmaster_analytics',
            'anonymizer',
            'http_header_config',
            'global_cdn',
            'geo_headers',
            'user_agent_info',
            'pixelmaster_api',
            'user_id',
            'open_container_bot_index',
            'click_id_restorer',
            'service_account',
            'logs',
            'cookie_keeper',
            'bot_detection',
            'ad_blocker_info',
            'poas_data_feed',
            'pixelmaster_store',
            // â”€â”€ 2. Advanced Infrastructure â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            'multi_zone_infrastructure',
            'multi_domains',
            'monitoring',
            'file_proxy',
            'xml_to_json',
            'block_request_by_ip',
            'schedule_requests',
            'request_delay',
            // â”€â”€ Custom-Exclusive Infra â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            'custom_logs_retention',
            'dedicated_ip',
            'private_cluster',
            // â”€â”€ 3. Account Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            'transfer_ownership',
            'consolidated_invoice',
            'share_access',
            'two_factor_auth',
            'google_sheets_connection',
            'single_sign_on',               // SSO â€” Custom only
            // â”€â”€ 4. Connections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            'data_manager_api',
            'google_ads_connection',
            'microsoft_ads_connection',
            'meta_custom_audiences',
        ],
    ],
];

