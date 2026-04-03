<?php

namespace App\Services;

use App\Models\GlobalSetting;
use Illuminate\Support\Facades\Config;

class ConfigOverrideService
{
    /**
     * Map of GlobalSetting keys to Laravel Config keys.
     */
    protected static array $mapping = [
        // App Identity
        'app_name' => 'app.name',
        'app_url' => 'app.url',
        
        // Mail Configuration
        'mail_mailer' => 'mail.default',
        'mail_host' => 'mail.mailers.smtp.host',
        'mail_port' => 'mail.mailers.smtp.port',
        'mail_username' => 'mail.mailers.smtp.username',
        'mail_password' => 'mail.mailers.smtp.password',
        'mail_encryption' => 'mail.mailers.smtp.encryption',
        'mail_from_address' => 'mail.from.address',
        'mail_from_name' => 'mail.from.name',

        // Services
        'stripe_key' => 'services.stripe.key',
        'stripe_secret' => 'services.stripe.secret',
        'openai_api_key' => 'services.openai.key',
        'openai_model' => 'services.openai.model',
        
        // Social Auth (Google)
        'google_client_id' => 'services.google.client_id',
        'google_client_secret' => 'services.google.client_secret',
        'google_redirect_url' => 'services.google.redirect',

        // Social Auth (Facebook)
        'facebook_client_id' => 'services.facebook.client_id',
        'facebook_client_secret' => 'services.facebook.client_secret',
        'facebook_redirect_url' => 'services.facebook.redirect',
    ];

    /**
     * Apply database settings to Laravel configuration at runtime.
     */
    public static function apply(): void
    {
        try {
            // Check if settings table exists to avoid errors during migrations
            if (!\Illuminate\Support\Facades\Schema::connection('central')->hasTable('global_settings')) {
                return;
            }

            foreach (self::$mapping as $settingKey => $configPath) {
                $value = GlobalSetting::get($settingKey);
                
                if ($value !== null) {
                    // Cast common types
                    if ($value === 'true') $value = true;
                    if ($value === 'false') $value = false;
                    if (is_numeric($value) && in_array($settingKey, ['mail_port'])) {
                        $value = (int) $value;
                    }

                    Config::set($configPath, $value);
                }
            }
        } catch (\Throwable $e) {
            // Silently fail to prevent app crash if DB is not ready
            \Illuminate\Support\Facades\Log::error("ConfigOverrideService: Failed to apply overrides - " . $e->getMessage());
        }
    }
}
