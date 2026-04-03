<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'platform/*', 'admin/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('CORS_ALLOWED_ORIGINS', 'http://localhost:7000'),
        env('FRONTEND_URL', 'http://localhost:7000'),
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:30001',
        'http://localhost:4000',
        'http://localhost:4001',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:7000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:30001',
        'http://127.0.0.1:4000',
        'http://127.0.0.1:7000',
    ],

    'allowed_origins_patterns' => [
        '/^https?:\/\/[a-z0-9-]+\.localhost:3000$/',
        '/^https?:\/\/[a-z0-9-]+\.localhost(:[0-9]+)?$/',
        '/^https?:\/\/[a-z0-9-]+\.lvh\.me(:[0-9]+)?$/',
        '/^https?:\/\/[a-z0-9-]+\.zosair\.com$/',
        '/^https?:\/\/([a-z0-9-]+\.)?afrosafashion\.com(:[0-9]+)?$/',
        '/^https?:\/\/localhost(:[0-9]+)?$/',
        '/^https?:\/\/127\.0\.0\.1(:[0-9]+)?$/',
    ],


    'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-TOKEN', 'X-XSRF-TOKEN', 'X-Inertia', 'X-Inertia-Version', 'X-Inertia-Partial-Data', 'X-Inertia-Partial-Component', 'Accept'],

    'exposed_headers' => ['X-Inertia', 'X-Inertia-Location'],

    'max_age' => 0,

    'supports_credentials' => true,

];
