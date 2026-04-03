<?php

namespace App\Modules\Tracking\Services;

use App\Models\Tenant;
use App\Models\TenantDomain;
use Illuminate\Support\Facades\Log;

/**
 * Tracking Domain Service — 3-Case Domain Handler
 *
 * Manages tracking domain lifecycle:
 *   CASE A: SaaS auto subdomain (track.{tenant}.yoursaas.com)
 *   CASE B: Custom tracking domain (track.baseus.com.bd via CNAME)
 *   CASE C: Existing subdomain path (shop.baseus.com.bd/track) — not recommended
 */
class TrackingDomainService
{
    private string $saasBaseDomain;
    private string $trackingCname;

    public function __construct()
    {
        $this->saasBaseDomain = config('tracking.docker.base_domain', 'yoursaas.com');
        $this->trackingCname  = config('tracking.cname_target', 'tracking.yoursaas.com');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  CASE A: SaaS Auto Subdomain (Default & Recommended)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Auto-provision SaaS tracking subdomain on onboard.
     *
     * Creates: track.{tenant_id}.{saasBaseDomain}
     * Example: track.baseus-bd.yoursaas.com
     *
     * ✅ No DNS setup needed
     * ✅ Fast onboarding
     * ✅ Works instantly
     */
    public function provisionSaasTracking(string $tenantId): TenantDomain
    {
        $trackingDomain = $this->generateSaasTrackingDomain($tenantId);

        // Check if already provisioned
        $existing = TenantDomain::where('tenant_id', $tenantId)
            ->where('purpose', 'tracking')
            ->first();

        if ($existing) {
            return $existing;
        }

        $domain = TenantDomain::create([
            'tenant_id'          => $tenantId,
            'domain'             => $trackingDomain,
            'is_primary'         => false,
            'is_verified'        => true,     // SaaS subdomain = auto-verified
            'verification_token' => null,
            'status'             => 'verified',
            'purpose'            => 'tracking',
        ]);

        Log::info("[Tracking Domain] SaaS auto-provisioned: {$trackingDomain} for tenant {$tenantId}");

        return $domain;
    }

    /**
     * Generate SaaS tracking subdomain.
     */
    public function generateSaasTrackingDomain(string $tenantId): string
    {
        $slug = strtolower(str_replace('_', '-', $tenantId));
        return "track.{$slug}.{$this->saasBaseDomain}";
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  CASE B: Custom Tracking Domain (CNAME)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Register a custom tracking domain.
     *
     * Tenant adds their own domain → We give CNAME instructions.
     * Example: track.baseus.com.bd → CNAME → tracking.yoursaas.com
     *
     * Returns DNS instructions for the tenant to configure.
     */
    public function registerCustomTracking(string $tenantId, string $customTrackingDomain): array
    {
        // Validate format
        if (!$this->isValidTrackingDomain($customTrackingDomain)) {
            throw new \InvalidArgumentException(
                "Invalid tracking domain: {$customTrackingDomain}. Use format: track.yourdomain.com"
            );
        }

        // Create pending domain record
        $verificationToken = 'verify-' . bin2hex(random_bytes(16));

        $domain = TenantDomain::updateOrCreate(
            [
                'tenant_id' => $tenantId,
                'domain'    => $customTrackingDomain,
            ],
            [
                'is_primary'         => false,
                'is_verified'        => false,
                'verification_token' => $verificationToken,
                'status'             => 'pending',
                'purpose'            => 'tracking',
            ]
        );

        $dnsInstructions = $this->getDnsInstructions($customTrackingDomain, $verificationToken);

        Log::info("[Tracking Domain] Custom domain registered: {$customTrackingDomain} for tenant {$tenantId}");

        return [
            'domain'           => $domain,
            'dns_instructions' => $dnsInstructions,
            'cname_target'     => $this->trackingCname,
            'status'           => 'pending_verification',
        ];
    }

    /**
     * Generate a custom tracking subdomain from tenant's custom domain.
     *
     * If tenant has baseus.com.bd verified, suggest track.baseus.com.bd
     */
    public function suggestTrackingDomain(string $tenantId): ?array
    {
        $customDomains = TenantDomain::getCustomDomains($tenantId, $this->saasBaseDomain);

        if (empty($customDomains)) {
            return null;
        }

        $suggestions = [];
        foreach ($customDomains as $domain) {
            $suggestions[] = [
                'domain'       => "track.{$domain}",
                'parent'       => $domain,
                'cname_target' => $this->trackingCname,
            ];
        }

        return $suggestions;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  CASE C: Existing Subdomain Path (Not Recommended)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Use existing subdomain with /track path.
     *
     * shop.baseus.com.bd/track → Same server, path-based routing
     * ⚠ Not recommended — separate subdomain is better for:
     *   - Cookie isolation
     *   - Ad-blocker bypass
     *   - Performance
     */
    public function useExistingSubdomain(string $tenantId, string $existingDomain): TenantDomain
    {
        $domain = TenantDomain::updateOrCreate(
            [
                'tenant_id' => $tenantId,
                'domain'    => $existingDomain,
                'purpose'   => 'tracking',
            ],
            [
                'is_primary'  => false,
                'is_verified' => true,
                'status'      => 'verified',
            ]
        );

        Log::warning("[Tracking Domain] Using existing subdomain for tracking (not recommended): {$existingDomain}");

        return $domain;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  DOMAIN LOOKUP & MANAGEMENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Get the active tracking domain for a tenant.
     * Priority: Custom verified > SaaS auto
     */
    public function getTrackingDomain(string $tenantId): ?string
    {
        // First try custom tracking domain (first-party, preferred)
        $custom = TenantDomain::where('tenant_id', $tenantId)
            ->where('purpose', 'tracking')
            ->where('is_verified', true)
            ->where('domain', 'not like', "%.{$this->saasBaseDomain}")
            ->value('domain');

        if ($custom) {
            return $custom;
        }

        // Fallback to SaaS auto subdomain
        return TenantDomain::where('tenant_id', $tenantId)
            ->where('purpose', 'tracking')
            ->where('is_verified', true)
            ->value('domain');
    }

    /**
     * Get all tracking domains for a tenant (for NGINX multi-domain).
     */
    public function getAllTrackingDomains(string $tenantId): array
    {
        return TenantDomain::where('tenant_id', $tenantId)
            ->where('purpose', 'tracking')
            ->where('is_verified', true)
            ->pluck('domain')
            ->toArray();
    }

    /**
     * Get the transport URL for a tenant's tracking.
     */
    public function getTransportUrl(string $tenantId): ?string
    {
        $domain = $this->getTrackingDomain($tenantId);
        return $domain ? "https://{$domain}" : null;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  DNS INSTRUCTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Generate DNS instructions for custom tracking domain.
     */
    public function getDnsInstructions(string $customDomain, ?string $verificationToken = null): array
    {
        $instructions = [
            'cname' => [
                'type'  => 'CNAME',
                'host'  => $this->extractSubdomain($customDomain),
                'value' => $this->trackingCname,
                'ttl'   => 3600,
                'note'  => 'Points your tracking domain to our servers',
            ],
        ];

        if ($verificationToken) {
            $instructions['txt'] = [
                'type'  => 'TXT',
                'host'  => '_verify.' . $this->extractSubdomain($customDomain),
                'value' => $verificationToken,
                'ttl'   => 3600,
                'note'  => 'Verifies domain ownership',
            ];
        }

        return $instructions;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  PRIVATE HELPERS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private function isValidTrackingDomain(string $domain): bool
    {
        return (bool) preg_match(
            '/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/',
            $domain
        );
    }

    private function extractSubdomain(string $domain): string
    {
        $parts = explode('.', $domain);
        return $parts[0]; // e.g., "track" from "track.baseus.com.bd"
    }
}
