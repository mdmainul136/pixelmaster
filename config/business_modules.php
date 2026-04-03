<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Business Type → Module Mapping
    |--------------------------------------------------------------------------
    | Defines which modules are automatically activated for each business type
    | during tenant onboarding. Only 'tracking' module is available.
    */

    'sgtm' => [
        'label' => 'Server-Side Tracking (sGTM)',
        'primary' => 'tracking',
        'starter'  => ['tracking'],
        'recommended' => [],
    ],

    /*
    |--------------------------------------------------------------------------
    | Module Relationships (Related Modules)
    |--------------------------------------------------------------------------
    */

    'relationships' => [
        'tracking' => [],
    ],
];
