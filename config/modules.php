<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Available Modules
    |--------------------------------------------------------------------------
    */

    // ── Analytics & Tracking ────────────────────────────────────────────
    'tracking' => [
        'name'        => 'Tracking & Analytics',
        'description' => 'Event tracking, pixel management, attribution, and analytics dashboards',
        'migrations_path' => 'database/migrations/tenant/modules/tracking',
        'price'       => 29.99,
        'icon'        => 'activity',
        'color'       => '#14b8a6',
        'features'    => ['Event Tracking', 'Pixel Management', 'Attribution', 'Real-time Dashboard'],
    ],
];
