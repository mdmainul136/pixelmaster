<?php

return [
    'database_prefix' => env('TENANT_DB_PREFIX', 'tenant_'),

    'identification_methods' => ['header', 'subdomain'],

    'database' => [
        'host' => env('TENANT_DB_HOST', env('DB_HOST', '127.0.0.1')),
        'port' => env('TENANT_DB_PORT', env('DB_PORT', '3306')),
        'username' => env('TENANT_DB_USERNAME', env('DB_USERNAME', 'root')),
        'password' => env('TENANT_DB_PASSWORD', env('DB_PASSWORD', '')),
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'prefix' => '',
        'strict' => true,
        'engine' => 'InnoDB',
    ],

    'master_database' => env('DB_DATABASE', 'tenant_master'),

    /*
    |--------------------------------------------------------------------------
    | Regional Database Server Groups
    |--------------------------------------------------------------------------
    |
    | Each region has its own MySQL server (or server group in production).
    | Tenants are automatically routed based on their country.
    |
    */
    'region_servers' => [
        'mena' => [
            'host' => env('REGION_MENA_DB_HOST', '127.0.0.1'),
            'port' => env('REGION_MENA_DB_PORT', '3306'),
            'username' => env('REGION_MENA_DB_USERNAME', env('TENANT_DB_USERNAME', 'root')),
            'password' => env('REGION_MENA_DB_PASSWORD', env('TENANT_DB_PASSWORD', '')),
        ],
        'europe' => [
            'host' => env('REGION_EUROPE_DB_HOST', '127.0.0.1'),
            'port' => env('REGION_EUROPE_DB_PORT', '3306'),
            'username' => env('REGION_EUROPE_DB_USERNAME', env('TENANT_DB_USERNAME', 'root')),
            'password' => env('REGION_EUROPE_DB_PASSWORD', env('TENANT_DB_PASSWORD', '')),
        ],
        'south_asia' => [
            'host' => env('REGION_SOUTH_ASIA_DB_HOST', '127.0.0.1'),
            'port' => env('REGION_SOUTH_ASIA_DB_PORT', '3306'),
            'username' => env('REGION_SOUTH_ASIA_DB_USERNAME', env('TENANT_DB_USERNAME', 'root')),
            'password' => env('REGION_SOUTH_ASIA_DB_PASSWORD', env('TENANT_DB_PASSWORD', '')),
        ],
        'americas' => [
            'host' => env('REGION_AMERICAS_DB_HOST', '127.0.0.1'),
            'port' => env('REGION_AMERICAS_DB_PORT', '3306'),
            'username' => env('REGION_AMERICAS_DB_USERNAME', env('TENANT_DB_USERNAME', 'root')),
            'password' => env('REGION_AMERICAS_DB_PASSWORD', env('TENANT_DB_PASSWORD', '')),
        ],
        'global' => [
            'host' => env('REGION_GLOBAL_DB_HOST', '127.0.0.1'),
            'port' => env('REGION_GLOBAL_DB_PORT', '3306'),
            'username' => env('REGION_GLOBAL_DB_USERNAME', env('TENANT_DB_USERNAME', 'root')),
            'password' => env('REGION_GLOBAL_DB_PASSWORD', env('TENANT_DB_PASSWORD', '')),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Country → Region Mapping
    |--------------------------------------------------------------------------
    */
    'country_region_map' => [
        // MENA
        'Saudi Arabia' => 'mena',
        'UAE' => 'mena',
        'Kuwait' => 'mena',
        'Bahrain' => 'mena',
        'Qatar' => 'mena',
        'Oman' => 'mena',
        'Egypt' => 'mena',
        'Jordan' => 'mena',

        // Europe
        'UK' => 'europe',
        'Germany' => 'europe',
        'France' => 'europe',
        'Turkey' => 'europe',
        'Spain' => 'europe',
        'Italy' => 'europe',
        'Netherlands' => 'europe',
        'Sweden' => 'europe',

        // South Asia
        'India' => 'south_asia',
        'Bangladesh' => 'south_asia',
        'Pakistan' => 'south_asia',
        'Sri Lanka' => 'south_asia',
        'Nepal' => 'south_asia',

        // Americas
        'USA' => 'americas',
        'Canada' => 'americas',
        'Brazil' => 'americas',
        'Mexico' => 'americas',

        // Global (catch-all)
        'Australia' => 'global',
        'Japan' => 'global',
        'Nigeria' => 'global',
        'Kenya' => 'global',
    ],
];

