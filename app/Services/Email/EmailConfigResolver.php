<?php

namespace App\Services\Email;

use App\Models\TenantEmailConfig;

class EmailConfigResolver
{
    protected string $platformDomain;
    protected string $platformName;

    public function __construct()
    {
        $this->platformDomain = config('app.url', 'localhost');
        $this->platformName   = config('app.name', 'Platform');

        // Extract domain from URL (e.g., https://example.com → example.com)
        $parsed = parse_url($this->platformDomain);
        $this->platformDomain = $parsed['host'] ?? 'localhost';
    }

    /**
     * Resolve the From email for transactional emails.
     * Uses tenant's verified domain if available, otherwise falls back to platform domain.
     */
    public function resolveFrom(string $tenantId): array
    {
        $config = TenantEmailConfig::where('tenant_id', $tenantId)->first();

        if ($config && $config->isVerified() && $config->from_email) {
            return [
                'email' => $config->from_email,
                'name'  => $config->from_name ?: $this->platformName,
            ];
        }

        // Fallback to platform defaults
        return [
            'email' => "noreply@{$this->platformDomain}",
            'name'  => $this->platformName,
        ];
    }

    /**
     * Resolve the From email for marketing emails.
     * Uses tenant's marketing-specific settings if set, otherwise falls back to standard From.
     */
    public function resolveMarketingFrom(string $tenantId): array
    {
        $config = TenantEmailConfig::where('tenant_id', $tenantId)->first();

        if ($config && $config->isVerified()) {
            if ($config->marketing_from_email) {
                return [
                    'email' => $config->marketing_from_email,
                    'name'  => $config->marketing_from_name ?: $config->from_name ?: $this->platformName,
                ];
            }

            if ($config->from_email) {
                return [
                    'email' => $config->from_email,
                    'name'  => $config->from_name ?: $this->platformName,
                ];
            }
        }

        return [
            'email' => "marketing@{$this->platformDomain}",
            'name'  => $this->platformName,
        ];
    }

    /**
     * Resolve the Reply-To email.
     */
    public function resolveReplyTo(string $tenantId): ?string
    {
        $config = TenantEmailConfig::where('tenant_id', $tenantId)->first();

        if ($config && $config->reply_to_email) {
            return $config->reply_to_email;
        }

        return null;
    }

    /**
     * Check if tenant can send emails right now.
     */
    public function canSend(string $tenantId): bool
    {
        $config = TenantEmailConfig::where('tenant_id', $tenantId)->first();

        if (!$config) {
            return false;
        }

        return $config->isVerified() && $config->canSend();
    }

    /**
     * Get full sending context for a tenant (used by jobs).
     */
    public function getSendContext(string $tenantId, bool $isMarketing = false): array
    {
        $from    = $isMarketing ? $this->resolveMarketingFrom($tenantId) : $this->resolveFrom($tenantId);
        $replyTo = $this->resolveReplyTo($tenantId);

        return [
            'from_email' => $from['email'],
            'from_name'  => $from['name'],
            'reply_to'   => $replyTo,
            'can_send'   => $this->canSend($tenantId),
        ];
    }
}
