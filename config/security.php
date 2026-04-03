<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Global Rate Limiting Configuration
    |--------------------------------------------------------------------------
    | Limits are defined as "requests per minute".
    */
    'rate_limits' => [
        'global' => env('SECURITY_GLOBAL_LIMIT', 300),
        'platform_admin' => env('SECURITY_ADMIN_LIMIT', 1000),
        'tenant_api' => env('SECURITY_TENANT_LIMIT', 500),
        'guest' => env('SECURITY_GUEST_LIMIT', 60),
    ],

    /*
    |--------------------------------------------------------------------------
    | 2FA Enforcement
    |--------------------------------------------------------------------------
    */
    'two_factor' => [
        'enforce_admins' => env('SECURITY_2FA_ADMINS', false),
        'enforce_merchants' => env('SECURITY_2FA_MERCHANTS', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Audit Log Retention
    |--------------------------------------------------------------------------
    | Number of days to keep audit logs before archiving/pruning.
    */
    'audit_retention_days' => 90,
];
