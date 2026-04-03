<?php

namespace App\Services\Email;

use App\Models\TenantEmailConfig;
use Illuminate\Support\Facades\Log;

class DomainVerificationService
{
    protected SesEmailService $ses;

    public function __construct(SesEmailService $ses)
    {
        $this->ses = $ses;
    }

    /**
     * Initiate domain verification for a tenant.
     * Uses tenant's own SES client if BYOC.
     */
    public function initiate(string $tenantId, string $domain): TenantEmailConfig
    {
        Log::info("[Email] Initiating domain verification for tenant {$tenantId}: {$domain}");

        $dnsRecords = $this->ses->verifyDomain($domain, $tenantId);

        $config = TenantEmailConfig::updateOrCreate(
            ['tenant_id' => $tenantId],
            [
                'verified_domain'      => $domain,
                'verification_status'  => 'pending',
                'dkim_status'          => 'pending',
                'dns_records'          => $dnsRecords,
                'from_email'           => "noreply@{$domain}",
                'from_name'            => '',
                'marketing_from_email' => "marketing@{$domain}",
            ]
        );

        return $config;
    }

    /**
     * Check the current verification status for a tenant's domain.
     */
    public function verify(string $tenantId): array
    {
        $config = TenantEmailConfig::where('tenant_id', $tenantId)->first();

        if (!$config || !$config->verified_domain) {
            return [
                'verified' => false,
                'message'  => 'No domain configured for email verification.',
            ];
        }

        $status = $this->ses->checkDomainVerification($config->verified_domain, $tenantId);

        $config->update([
            'verification_status' => $status['verification_status'] === 'success' ? 'verified' : $status['verification_status'],
            'dkim_status'         => $status['dkim_status'],
        ]);

        $isFullyVerified = $status['verification_status'] === 'success' && $status['dkim_status'] === 'success';

        return [
            'domain'              => $config->verified_domain,
            'verified'            => $isFullyVerified,
            'verification_status' => $status['verification_status'],
            'dkim_status'         => $status['dkim_status'],
            'dkim_enabled'        => $status['dkim_enabled'],
            'provider'            => $config->getProviderLabel(),
            'message'             => $isFullyVerified
                ? 'Domain is fully verified and ready for sending!'
                : 'Domain verification is still pending. Please add the DNS records.',
        ];
    }

    /**
     * Get DNS records that the tenant needs to add.
     */
    public function getDnsRecords(string $tenantId): array
    {
        $config = TenantEmailConfig::where('tenant_id', $tenantId)->first();

        if (!$config) {
            return [];
        }

        return [
            'domain'   => $config->verified_domain,
            'status'   => $config->verification_status,
            'provider' => $config->getProviderLabel(),
            'records'  => $config->dns_records ?? [],
        ];
    }
}
