<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Welcome Email Toggle
    |--------------------------------------------------------------------------
    |
    | When enabled, a welcome email is sent to the tenant admin after
    | successful provisioning. If disabled, the email step is skipped
    | silently and provisioning completes without sending any email.
    |
    */
    'send_welcome_email' => env('TENANT_SEND_WELCOME_EMAIL', true),

    /*
    |--------------------------------------------------------------------------
    | Email Verification Toggle
    |--------------------------------------------------------------------------
    |
    | When enabled, the admin user must verify their email via OTP before
    | they can log in. If disabled, the email_verified_at timestamp is
    | automatically set during provisioning so login works immediately.
    |
    */
    'require_email_verification' => env('TENANT_REQUIRE_EMAIL_VERIFICATION', false),

    /*
    |--------------------------------------------------------------------------
    | Verification Code Settings
    |--------------------------------------------------------------------------
    */
    'verification_code_length' => 6,
    'verification_code_expiry_minutes' => 30,
];
