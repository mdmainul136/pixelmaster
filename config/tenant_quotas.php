<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Subscription Tiers and Quotas
    |--------------------------------------------------------------------------
    |
    | Definitions for resource limits across different plans.
    |
    | max_products: -1 means unlimited
    | max_users: -1 means unlimited
    | max_branches: -1 means unlimited
    */
    'tiers' => [
        'starter' => [
            'api_rpm_limit' => 30,
            'ai_daily_limit' => 10,
            'whatsapp_monthly_limit' => 50,
            'max_users' => 1,
            'max_products' => 50,
            'max_branches' => 1,
            'storage_gb' => 2,
            'tracking_monthly_limit' => 10000,
        ],
        'growth' => [
            'api_rpm_limit' => 100, 
            'ai_daily_limit' => 50,
            'whatsapp_monthly_limit' => 500,
            'max_users' => 3,
            'max_products' => -1,
            'max_branches' => 1,
            'storage_gb' => 10,
            'tracking_monthly_limit' => 50000,
        ],
        'pro' => [
            'api_rpm_limit' => 1000, 
            'ai_daily_limit' => 1000,
            'whatsapp_monthly_limit' => 10000,
            'max_users' => 10,
            'max_products' => -1,
            'max_branches' => 10,
            'storage_gb' => 50,
            'tracking_monthly_limit' => 1000000,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Per-Resource Limits (Plan-Based)
    |--------------------------------------------------------------------------
    |
    | Maps DB table names to their Starter/Growth/Pro limits.
    | -1 = unlimited. Used by EnforceResourceQuota middleware.
    |
    */
    'resource_limits' => [
        'ec_products' => [
            'starter' => 50,
            'growth'  => -1,
            'pro'     => -1,
        ],
        're_properties' => [
            'starter' => 20,
            'growth'  => -1,
            'pro'     => -1,
        ],
        'crm_customers' => [
            'starter' => 100,
            'growth'  => -1,
            'pro'     => -1,
        ],
        'crm_deals' => [
            'starter' => 50,
            'growth'  => -1,
            'pro'     => -1,
        ],
        'inv_products' => [
            'starter' => 100,
            'growth'  => -1,
            'pro'     => -1,
        ],
        'events' => [
            'starter' => 5,
            'growth'  => 50,
            'pro'     => -1,
        ],
        'sgtm_containers' => [
            'starter' => 1,
            'growth'  => 3,
            'pro'     => -1,
        ],
        'users' => [
            'starter' => 1,
            'growth'  => 3,
            'pro'     => 10,
        ],
    ],

    'redis_prefix' => 'tenant_quota:',
];
