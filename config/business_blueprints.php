<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Industry Blueprints (3-Tier Plan Architecture)
    |--------------------------------------------------------------------------
    | Only the sGTM (Server-Side Tracking) blueprint remains.
    */

    'sgtm' => [
        'primary' => 'tracking',
        'label'   => 'Server-Side Tracking (sGTM)',
        'starter'    => ['tracking'],
        'groups'  => [
            'tracking_operations' => [
                'label'   => 'Tracking & Analytics',
                'modules' => [
                    'starter' => ['tracking'],
                    'growth'  => ['tracking'],
                    'pro'     => ['tracking'],
                ],
            ],
        ],
    ],
];
