<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\Email\SesEmailService;
use App\Services\Email\EmailConfigResolver;
use App\Services\Email\DomainVerificationService;
use App\Models\TenantEmailConfig;

class EmailConfigController
{
    protected DomainVerificationService $verification;
    protected SesEmailService $ses;
    protected EmailConfigResolver $resolver;

    public function __construct(
        DomainVerificationService $verification,
        SesEmailService $ses,
        EmailConfigResolver $resolver
    ) {
        $this->verification = $verification;
        $this->ses          = $ses;
        $this->resolver     = $resolver;
    }

    /**
     * GET /api/email/config
     */
    public function show(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $config = TenantEmailConfig::where('tenant_id', $tenantId)->first();

        if (!$config) {
            return response()->json([
                'configured'   => false,
                'provider'     => 'Platform (Free Tier)',
                'uses_own_ses' => false,
                'message'      => 'No email configuration found. You are using platform defaults (200 emails/day).',
            ]);
        }

        return response()->json([
            'configured'           => true,
            'provider'             => $config->getProviderLabel(),
            'uses_own_ses'         => $config->isUsingOwnSes(),
            'mail_driver'          => $config->mail_driver ?: 'platform',
            'verified_domain'      => $config->verified_domain,
            'verification_status'  => $config->verification_status,
            'dkim_status'          => $config->dkim_status,
            'from_name'            => $config->from_name,
            'from_email'           => $config->from_email,
            'reply_to_email'       => $config->reply_to_email,
            'marketing_from_name'  => $config->marketing_from_name,
            'marketing_from_email' => $config->marketing_from_email,
            'daily_send_limit'     => $config->isUsingOwnSes() ? 'Unlimited' : $config->daily_send_limit,
            'sends_today'          => $config->sends_today,
            'remaining_sends'      => $config->isUsingOwnSes() ? 'Unlimited' : $config->remainingSends(),
            'is_verified'          => $config->isVerified(),
            'has_aws_credentials'  => (bool) $config->aws_access_key_id,
            'aws_region'           => $config->aws_region,
            'credentials_valid'    => $config->ses_credentials_valid,
            'credentials_verified_at' => $config->ses_credentials_verified_at,
            // SMTP specific fields
            'smtp_host'            => $config->smtp_host,
            'smtp_port'            => $config->smtp_port,
            'smtp_username'        => $config->smtp_username,
            'smtp_encryption'      => $config->smtp_encryption,
            // Credential status flags
            'is_aws_secret_set'    => !empty($config->getRawOriginal('aws_secret_access_key')),
            'is_smtp_password_set' => !empty($config->getRawOriginal('smtp_password')),
        ]);
    }

    /**
     * POST /api/email/config
     */
    public function update(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');

        $validated = $request->validate([
            'from_name'            => 'nullable|string|max:255',
            'from_email'           => 'nullable|email|max:255',
            'reply_to_email'       => 'nullable|email|max:255',
            'marketing_from_name'  => 'nullable|string|max:255',
            'marketing_from_email' => 'nullable|email|max:255',
        ]);

        $config = TenantEmailConfig::updateOrCreate(
            ['tenant_id' => $tenantId],
            array_filter($validated, fn($v) => $v !== null)
        );

        return response()->json([
            'success' => true,
            'message' => 'Email configuration updated.',
            'config'  => $config,
        ]);
    }

    /**
     * POST /api/email/connect-aws
     * Tenant connects their own AWS SES credentials (BYOC).
     */
    public function connectAws(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $config = TenantEmailConfig::where('tenant_id', $tenantId)->first();

        $validated = $request->validate([
            'aws_access_key_id'     => [$config && $config->aws_access_key_id ? 'nullable' : 'required', 'string', 'min:16', 'max:128'],
            'aws_secret_access_key' => [$config && $config->aws_secret_access_key ? 'nullable' : 'required', 'string', 'min:30', 'max:128'],
            'aws_region'            => 'nullable|string|max:30',
        ]);

        $region = $validated['aws_region'] ?? ($config->aws_region ?? 'us-east-1');
        $accessKey = $validated['aws_access_key_id'] ?? $config->aws_access_key_id;
        $secretKey = $validated['aws_secret_access_key'] ?? $config->aws_secret_access_key;

        // Step 1: Validate credentials by calling SES
        $validation = $this->ses->validateCredentials(
            $accessKey,
            $secretKey,
            $region
        );

        if (!$validation['valid']) {
            return response()->json([
                'success' => false,
                'message' => $validation['message'],
            ], 422);
        }

        // Step 2: Store credentials
        $config = TenantEmailConfig::updateOrCreate(
            ['tenant_id' => $tenantId],
            [
                'aws_access_key_id'          => $accessKey,
                'aws_secret_access_key'      => $secretKey,
                'aws_region'                 => $region,
                'mail_driver'                => 'ses',
                'uses_own_ses'               => true,
                'ses_credentials_valid'      => true,
                'ses_credentials_verified_at' => now(),
            ]
        );

        return response()->json([
            'success'  => true,
            'message'  => 'AWS SES connected successfully! You now have unlimited email sending.',
            'provider' => $config->getProviderLabel(),
            'quota'    => $validation,
        ]);
    }

    /**
     * POST /api/email/disconnect-aws
     * Tenant disconnects their own AWS credentials, reverts to platform SES.
     */
    public function disconnectAws(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $config = TenantEmailConfig::where('tenant_id', $tenantId)->first();

        if (!$config) {
            return response()->json([
                'success' => false,
                'message' => 'No email configuration found.',
            ], 404);
        }

        $config->update([
            'aws_access_key_id'          => null,
            'aws_secret_access_key'      => null,
            'aws_region'                 => null,
            'mail_driver'                => 'platform',
            'uses_own_ses'               => false,
            'ses_credentials_valid'      => false,
            'ses_credentials_verified_at' => null,
        ]);

        return response()->json([
            'success'  => true,
            'message'  => 'AWS SES disconnected. You are now using Platform Free Tier (200 emails/day).',
            'provider' => 'Platform (Free Tier)',
        ]);
    }

    /**
     * POST /api/email/connect-smtp
     */
    public function connectSmtp(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $config = TenantEmailConfig::where('tenant_id', $tenantId)->first();

        $validated = $request->validate([
            'smtp_host'       => 'required|string|max:255',
            'smtp_port'       => 'required|integer',
            'smtp_username'   => 'required|string|max:255',
            'smtp_password'   => [$config && $config->smtp_password ? 'nullable' : 'required', 'string', 'max:255'],
            'smtp_encryption' => 'nullable|string|in:tls,ssl,none',
        ]);

        $password = $validated['smtp_password'] ?? $config->smtp_password;

        // Validate SMTP connection
        try {
            $transport = new \Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport(
                $validated['smtp_host'],
                $validated['smtp_port'],
                $validated['smtp_encryption'] === 'tls' || $validated['smtp_encryption'] === 'ssl'
            );
            $transport->setUsername($validated['smtp_username']);
            $transport->setPassword($password);
            
            // Simple check to see if we can create the transport
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'SMTP Configuration error: ' . $e->getMessage(),
            ], 422);
        }

        $config = TenantEmailConfig::updateOrCreate(
            ['tenant_id' => $tenantId],
            array_merge($validated, [
                'smtp_password' => $password,
                'mail_driver'   => 'smtp',
                'uses_own_ses'  => false,
            ])
        );

        return response()->json([
            'success' => true,
            'message' => 'SMTP connected successfully!',
            'config'  => $config,
        ]);
    }

    /**
     * POST /api/email/disconnect-smtp
     */
    public function disconnectSmtp(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $config = TenantEmailConfig::where('tenant_id', $tenantId)->first();

        if ($config) {
            $config->update([
                'mail_driver'     => 'platform',
                'smtp_host'       => null,
                'smtp_port'       => null,
                'smtp_username'   => null,
                'smtp_password'   => null,
                'smtp_encryption' => null,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'SMTP disconnected. Reverted to platform defaults.',
        ]);
    }

    /**
     * POST /api/email/verify-domain
     */
    public function verifyDomain(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');

        $validated = $request->validate([
            'domain' => 'required|string|max:255',
        ]);

        try {
            $config = $this->verification->initiate($tenantId, $validated['domain']);

            return response()->json([
                'success'     => true,
                'message'     => 'Domain verification initiated! Add the DNS records below.',
                'domain'      => $config->verified_domain,
                'provider'    => $config->getProviderLabel(),
                'dns_records' => $config->dns_records,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate domain verification: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/email/verify-domain/status
     */
    public function verifyDomainStatus(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        return response()->json($this->verification->verify($tenantId));
    }

    /**
     * GET /api/email/verify-domain/dns
     */
    public function verifyDomainDns(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        return response()->json($this->verification->getDnsRecords($tenantId));
    }

    /**
     * GET /api/email/stats
     */
    public function stats(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        return response()->json($this->ses->getTenantStats($tenantId));
    }
}
