<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\GlobalSetting;
use Illuminate\Support\Facades\Config;

class DynamicMailConfiguration
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only apply to central domain requests
        $centralDomains = config('tenancy.central_domains', ['localhost', '127.0.0.1']);
        if (in_array($request->getHost(), $centralDomains)) {
            $this->applyMailConfiguration();
        }

        return $next($request);
    }

    /**
     * Apply mail configuration from GlobalSetting
     */
    protected function applyMailConfiguration(): void
    {
        $settings = GlobalSetting::whereIn('key', [
            'mail_mailer',
            'mail_host',
            'mail_port',
            'mail_username',
            'mail_password',
            'mail_encryption',
            'mail_from_address',
            'mail_from_name',
        ])->pluck('value', 'key');

        if ($settings->isEmpty()) {
            return;
        }

        $mailer = $settings->get('mail_mailer', 'smtp');

        // Update default mailer
        Config::set('mail.default', $mailer);

        // Update SMTP configuration if applicable
        if ($mailer === 'smtp') {
            Config::set('mail.mailers.smtp.host', $settings->get('mail_host', env('MAIL_HOST')));
            Config::set('mail.mailers.smtp.port', (int) $settings->get('mail_port', env('MAIL_PORT', 587)));
            Config::set('mail.mailers.smtp.username', $settings->get('mail_username', env('MAIL_USERNAME')));
            Config::set('mail.mailers.smtp.password', $settings->get('mail_password', env('MAIL_PASSWORD')));
            Config::set('mail.mailers.smtp.encryption', $settings->get('mail_encryption', env('MAIL_ENCRYPTION', 'tls')));
        }

        // Global From Address
        Config::set('mail.from.address', $settings->get('mail_from_address', env('MAIL_FROM_ADDRESS')));
        Config::set('mail.from.name', $settings->get('mail_from_name', env('MAIL_FROM_NAME')));
    }
}
