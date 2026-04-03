<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Region-Wise Module Strategy
    |--------------------------------------------------------------------------
    | Only the 'tracking' module is available across all regions globally.
    | Add-ons and fine-grained limits are now managed via plans.php.
    */

    'MENA' => [
        'name' => 'Middle East (MENA)',
        'countries' => ['SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'EG', 'JO'],
        'currency' => 'SAR',
        'modules' => [
            'starter' => ['tracking'],
            'addons' => []
        ],
        'payment_methods' => ['mada', 'stcpay', 'tamara', 'tabby', 'sadad', 'apple_pay', 'cod']
    ],

    'SOUTH_ASIA' => [
        'name' => 'South Asia',
        'countries' => ['BD', 'IN', 'PK', 'LK', 'NP'],
        'currency' => 'USD',
        'modules' => [
            'starter' => ['tracking'],
            'addons' => []
        ],
        'payment_methods' => ['razorpay', 'bkash', 'jazzcash', 'upi', 'cod', 'bank_transfer']
    ],

    'GLOBAL' => [
        'name' => 'Global (Default)',
        'countries' => '*',
        'currency' => 'USD',
        'modules' => [
            'starter' => ['tracking'],
            'addons' => []
        ],
        'payment_methods' => ['stripe', 'paypal', 'apple_pay', 'google_pay']
    ]
];
