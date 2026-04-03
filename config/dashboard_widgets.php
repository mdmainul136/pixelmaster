<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Dashboard Widget Configurations
    |--------------------------------------------------------------------------
    | Maps modules to their dashboard widgets and metrics.
    | The Controller will use these keys to fetch data dynamically.
    */

    'tracking' => [
        'label' => 'Tracking',
        'widgets' => [
            'events' => ['label' => 'Events (24h)', 'type' => 'number'],
            'containers' => ['label' => 'Active Containers', 'type' => 'number'],
        ]
    ],
];
