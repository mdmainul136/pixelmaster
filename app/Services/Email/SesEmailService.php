<?php

namespace App\Services\Email;

use Aws\Ses\SesClient;
use Illuminate\Support\Facades\Log;
use App\Models\EmailLog;
use App\Models\TenantEmailConfig;

class SesEmailService
{
    protected string $configurationSet;

    /**
     * Cache of per-tenant SES clients to avoid re-creating on every call.
     * @var array<string, SesClient>
     */
    protected array $clientCache = [];

    public function __construct()
    {
        $this->configurationSet = config('services.ses.configuration_set', '');
    }

    // ─── Dynamic Client Factory ────────────────────────────────────

    /**
     * Get an SES client for a specific tenant.
     * Uses tenant's own credentials if BYOC, otherwise platform credentials.
     */
    public function getClientForTenant(string $tenantId): SesClient
    {
        if (isset($this->clientCache[$tenantId])) {
            return $this->clientCache[$tenantId];
        }

        $config = TenantEmailConfig::where('tenant_id', $tenantId)->first();

        if ($config && $config->isUsingOwnSes()) {
            // BYOC: Use tenant's own AWS credentials
            $client = new SesClient([
                'version'     => 'latest',
                'region'      => $config->aws_region ?: 'us-east-1',
                'credentials' => [
                    'key'    => $config->aws_access_key_id,
                    'secret' => $config->aws_secret_access_key,
                ],
            ]);
            Log::debug("[SES] Using tenant's own SES for tenant {$tenantId}");
        } else {
            // Platform default credentials
            $client = $this->getPlatformClient();
            Log::debug("[SES] Using platform SES for tenant {$tenantId}");
        }

        $this->clientCache[$tenantId] = $client;
        return $client;
    }

    /**
     * Get the platform's default SES client.
     */
    public function getPlatformClient(): SesClient
    {
        if (isset($this->clientCache['__platform__'])) {
            return $this->clientCache['__platform__'];
        }

        $client = new SesClient([
            'version'     => 'latest',
            'region'      => config('services.ses.region', 'us-east-1'),
            'credentials' => [
                'key'    => config('services.ses.key'),
                'secret' => config('services.ses.secret'),
            ],
        ]);

        $this->clientCache['__platform__'] = $client;
        return $client;
    }

    // ─── Credential Validation ─────────────────────────────────────

    /**
     * Validate tenant-provided AWS SES credentials.
     * Tests by calling getSendQuota — if it succeeds, credentials are valid.
     */
    public function validateCredentials(string $accessKey, string $secretKey, string $region = 'us-east-1'): array
    {
        try {
            $testClient = new SesClient([
                'version'     => 'latest',
                'region'      => $region,
                'credentials' => [
                    'key'    => $accessKey,
                    'secret' => $secretKey,
                ],
            ]);

            $quota = $testClient->getSendQuota();

            return [
                'valid'             => true,
                'max_24_hour_send'  => $quota->get('Max24HourSend'),
                'max_send_rate'     => $quota->get('MaxSendRate'),
                'sent_last_24h'     => $quota->get('SentLast24Hours'),
                'message'           => 'AWS SES credentials are valid!',
            ];
        } catch (\Exception $e) {
            return [
                'valid'   => false,
                'message' => 'Invalid credentials: ' . $e->getMessage(),
            ];
        }
    }

    // ─── Domain Verification ───────────────────────────────────────

    /**
     * Initiate domain verification with SES (uses correct client per tenant).
     */
    public function verifyDomain(string $domain, string $tenantId = ''): array
    {
        $ses = $tenantId ? $this->getClientForTenant($tenantId) : $this->getPlatformClient();
        $dnsRecords = [];

        // 1. Verify domain identity (TXT record)
        $identityResult = $ses->verifyDomainIdentity(['Domain' => $domain]);
        $verificationToken = $identityResult->get('VerificationToken');
        $dnsRecords[] = [
            'type'  => 'TXT',
            'name'  => "_amazonses.{$domain}",
            'value' => $verificationToken,
            'note'  => 'Domain verification TXT record',
        ];

        // 2. Enable DKIM (CNAME records)
        $dkimResult = $ses->verifyDomainDkim(['Domain' => $domain]);
        $dkimTokens = $dkimResult->get('DkimTokens') ?? [];
        foreach ($dkimTokens as $token) {
            $dnsRecords[] = [
                'type'  => 'CNAME',
                'name'  => "{$token}._domainkey.{$domain}",
                'value' => "{$token}.dkim.amazonses.com",
                'note'  => 'DKIM authentication record',
            ];
        }

        // 3. SPF record
        $dnsRecords[] = [
            'type'  => 'TXT',
            'name'  => $domain,
            'value' => 'v=spf1 include:amazonses.com ~all',
            'note'  => 'SPF record for email authentication',
        ];

        return $dnsRecords;
    }

    /**
     * Check domain verification and DKIM status.
     */
    public function checkDomainVerification(string $domain, string $tenantId = ''): array
    {
        $ses = $tenantId ? $this->getClientForTenant($tenantId) : $this->getPlatformClient();

        $identityResult = $ses->getIdentityVerificationAttributes([
            'Identities' => [$domain],
        ]);
        $attrs = $identityResult->get('VerificationAttributes')[$domain] ?? [];
        $verificationStatus = $attrs['VerificationStatus'] ?? 'NotStarted';

        $dkimResult = $ses->getIdentityDkimAttributes([
            'Identities' => [$domain],
        ]);
        $dkimAttrs = $dkimResult->get('DkimAttributes')[$domain] ?? [];
        $dkimVerified = ($dkimAttrs['DkimVerificationStatus'] ?? '') === 'Success';

        return [
            'domain'              => $domain,
            'verification_status' => strtolower($verificationStatus),
            'dkim_status'         => $dkimVerified ? 'success' : strtolower($dkimAttrs['DkimVerificationStatus'] ?? 'not_started'),
            'dkim_enabled'        => $dkimAttrs['DkimEnabled'] ?? false,
        ];
    }

    // ─── Sending ───────────────────────────────────────────────────

    /**
     * Send a single email via SES (uses tenant's own client if BYOC).
     */
    public function send(
        string $tenantId,
        string $to,
        string $subject,
        string $htmlBody,
        string $fromEmail,
        string $fromName = '',
        ?string $replyTo = null,
        ?int $campaignId = null,
        array $metadata = []
    ): EmailLog {
        $log = EmailLog::create([
            'tenant_id'   => $tenantId,
            'to_email'    => $to,
            'from_email'  => $fromEmail,
            'subject'     => $subject,
            'status'      => 'queued',
            'campaign_id' => $campaignId,
            'metadata'    => $metadata,
        ]);

        try {
            $ses  = $this->getClientForTenant($tenantId);
            $from = $fromName ? "{$fromName} <{$fromEmail}>" : $fromEmail;

            $params = [
                'Source'      => $from,
                'Destination' => ['ToAddresses' => [$to]],
                'Message'     => [
                    'Subject' => ['Data' => $subject, 'Charset' => 'UTF-8'],
                    'Body'    => ['Html' => ['Data' => $htmlBody, 'Charset' => 'UTF-8']],
                ],
            ];

            if ($replyTo) {
                $params['ReplyToAddresses'] = [$replyTo];
            }

            // Only apply configuration set for platform sends (BYOC tenants may not have one)
            $config = TenantEmailConfig::where('tenant_id', $tenantId)->first();
            if (!$config?->isUsingOwnSes() && $this->configurationSet) {
                $params['ConfigurationSetName'] = $this->configurationSet;
            }

            $result    = $ses->sendEmail($params);
            $messageId = $result->get('MessageId');

            $log->update([
                'status'         => 'sent',
                'ses_message_id' => $messageId,
            ]);

            // Increment counter (skipped for BYOC tenants)
            if ($config) {
                $config->incrementSendCount();
            }

        } catch (\Exception $e) {
            Log::error("[SES] Send failed for tenant {$tenantId}: " . $e->getMessage());
            $log->update([
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }

        return $log;
    }

    /**
     * Send bulk emails (for marketing campaigns).
     */
    public function sendBulk(
        string $tenantId,
        array $recipients,
        string $subject,
        string $htmlBody,
        string $fromEmail,
        string $fromName = '',
        ?int $campaignId = null
    ): array {
        $results = [];
        $chunks  = array_chunk($recipients, 50);

        foreach ($chunks as $chunk) {
            foreach ($chunk as $recipient) {
                $log = $this->send(
                    $tenantId,
                    $recipient['email'],
                    $subject,
                    $htmlBody,
                    $fromEmail,
                    $fromName,
                    null,
                    $campaignId,
                    ['recipient_name' => $recipient['name'] ?? '']
                );
                $results[] = $log;
            }
            usleep(100000); // 100ms between chunks
        }

        return $results;
    }

    // ─── Quota & Stats ─────────────────────────────────────────────

    /**
     * Get SES sending quota (uses tenant's own client if BYOC).
     */
    public function getQuota(string $tenantId = ''): array
    {
        $ses   = $tenantId ? $this->getClientForTenant($tenantId) : $this->getPlatformClient();
        $quota = $ses->getSendQuota();

        return [
            'max_24_hour_send'   => $quota->get('Max24HourSend'),
            'max_send_rate'      => $quota->get('MaxSendRate'),
            'sent_last_24_hours' => $quota->get('SentLast24Hours'),
        ];
    }

    /**
     * Get sending statistics for a tenant.
     */
    public function getTenantStats(string $tenantId): array
    {
        $config = TenantEmailConfig::where('tenant_id', $tenantId)->first();

        $stats = [
            'provider'         => $config ? $config->getProviderLabel() : 'Platform (Free Tier)',
            'uses_own_ses'     => $config ? $config->isUsingOwnSes() : false,
            'domain_verified'  => $config ? $config->isVerified() : false,
            'total_sent'       => EmailLog::forTenant($tenantId)->where('status', 'sent')->count(),
            'total_delivered'  => EmailLog::forTenant($tenantId)->where('status', 'delivered')->count(),
            'total_bounced'    => EmailLog::forTenant($tenantId)->bounced()->count(),
            'total_complained' => EmailLog::forTenant($tenantId)->complained()->count(),
        ];

        if ($config && $config->isUsingOwnSes()) {
            // BYOC: show AWS quota directly
            try {
                $quota = $this->getQuota($tenantId);
                $stats['ses_quota'] = $quota;
            } catch (\Exception $e) {
                $stats['ses_quota'] = null;
            }
            $stats['daily_limit'] = 'Unlimited (your AWS account)';
            $stats['sends_today'] = EmailLog::forTenant($tenantId)->today()->count();
            $stats['remaining']   = 'Unlimited';
        } else {
            // Platform: show platform limits
            $stats['daily_limit'] = $config ? $config->daily_send_limit : 200;
            $stats['sends_today'] = $config ? $config->sends_today : 0;
            $stats['remaining']   = $config ? $config->remainingSends() : 200;
        }

        return $stats;
    }
}
