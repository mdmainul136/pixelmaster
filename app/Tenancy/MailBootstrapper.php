<?php

namespace App\Tenancy;

use Stancl\Tenancy\Contracts\TenancyBootstrapper;
use Stancl\Tenancy\Contracts\Tenant;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class MailBootstrapper implements TenancyBootstrapper
{
    protected $originalConfig = [];

    public function bootstrap(Tenant $tenant)
    {
        /** @var \App\Models\Tenant $tenant */
        $config = $tenant->emailConfig;

        if (!$config) {
            return;
        }

        $this->originalConfig = [
            'default' => config('mail.default'),
            'from'    => config('mail.from'),
            'smtp'    => config('mail.mailers.smtp'),
            'ses'     => config('services.ses'),
        ];

        $newConfig = [];

        // 1. Dynamic From Address
        if ($config->from_email) {
            $newConfig['mail.from.address'] = $config->from_email;
            $newConfig['mail.from.name']    = $config->from_name ?: config('app.name');
        }

        // 2. Mailer Selection & Configuration
        if ($config->mail_driver === 'smtp' && $config->smtp_host) {
            $newConfig['mail.default'] = 'smtp';
            $newConfig['mail.mailers.smtp'] = array_merge(config('mail.mailers.smtp'), [
                'host'       => $config->smtp_host,
                'port'       => $config->smtp_port,
                'username'   => $config->smtp_username,
                'password'   => $config->smtp_password,
                'encryption' => $config->smtp_encryption,
            ]);
        } elseif ($config->mail_driver === 'ses' && $config->isUsingOwnSes()) {
            $newConfig['mail.default'] = 'ses';
            $newConfig['services.ses'] = array_merge(config('services.ses'), [
                'key'    => $config->aws_access_key_id,
                'secret' => $config->aws_secret_access_key,
                'region' => $config->aws_region ?: 'us-east-1',
            ]);
        }

        if (!empty($newConfig)) {
            config($newConfig);
            Mail::purge();
            Log::debug("[MailBootstrapper] Mailer configured for tenant {$tenant->id}: " . config('mail.default'));
        }
    }

    public function revert()
    {
        if (empty($this->originalConfig)) {
            return;
        }

        config([
            'mail.default'      => $this->originalConfig['default'],
            'mail.from'         => $this->originalConfig['from'],
            'mail.mailers.smtp' => $this->originalConfig['smtp'],
            'services.ses'      => $this->originalConfig['ses'],
        ]);

        Mail::purge();
        $this->originalConfig = [];
    }
}
