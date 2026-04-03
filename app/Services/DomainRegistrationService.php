<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\TenantDomain;
use App\Models\DomainOrder;
use App\Services\NamecheapService;
use Illuminate\Support\Facades\Log;

class DomainRegistrationService
{
    protected NamecheapService $namecheap;

    public function __construct(NamecheapService $namecheap)
    {
        $this->namecheap = $namecheap;
    }

    /**
     * Register a domain through Namecheap API.
     * Creates the domain record in tenant_domains as Primary and Verified.
     *
     * @param  string $tenantId    Tenant identifier
     * @param  string $domain      Full domain name (e.g. baseus.com.bd)
     * @param  int    $years       Registration years
     * @param  array  $contactInfo Contact info for registration
     * @param  string $purpose     Domain purpose: website, tracking, api, storefront
     * @return TenantDomain
     */
    public function registerDomain(
        string $tenantId,
        string $domain,
        int $years = 1,
        array $contactInfo = [],
        string $purpose = 'website'
    ): TenantDomain {
        try {
            // 1. Call Namecheap API for real registration
            $result = $this->namecheap->registerDomain($domain, $years, $contactInfo);

            // 2. Unset existing primary domains for this tenant (same purpose)
            if ($purpose === 'website') {
                TenantDomain::where('tenant_id', $tenantId)->update(['is_primary' => false]);
            }

            // 3. Create the domain record in tenant_domains
            $tenantDomain = TenantDomain::create([
                'tenant_id'   => $tenantId,
                'domain'      => $domain,
                'is_verified' => true,
                'is_primary'  => $purpose === 'website',
                'status'      => 'verified',
                'purpose'     => $purpose,
                'verified_at' => now(),
            ]);

            // 4. Update the main Tenant record's domain field (Primary cache)
            if ($purpose === 'website') {
                Tenant::where('id', $tenantId)->update(['domain' => $domain]);
            }

            // 5. Mark the order as completed
            DomainOrder::where('tenant_id', $tenantId)
                ->where('domain', $domain)
                ->update([
                    'tenant_domain_id' => $tenantDomain->id,
                    'status'           => 'completed',
                    'expiry_date'      => now()->addYears($years),
                    'registrar_data'   => json_encode([
                        'provider'          => 'Namecheap',
                        'status'            => 'active',
                        'domain_id'         => (string) ($result['DomainID'] ?? ''),
                        'registration_date' => now()->toDateTimeString(),
                    ])
                ]);

            return $tenantDomain;
        } catch (\Exception $e) {
            Log::error('Namecheap registration error: ' . $e->getMessage());
            throw new \Exception("Failed to register domain with Namecheap: " . $e->getMessage());
        }
    }

    /**
     * Renew an existing domain
     */
    public function renewDomain(string $domain, int $years = 1)
    {
        try {
            $result = $this->namecheap->renewDomain($domain, $years);

            $expiryDate = $result['expiry_date'];

            $order = DomainOrder::where('domain', $domain)
                ->where('status', 'completed')
                ->latest()
                ->first();

            if ($order && $expiryDate) {
                $order->update([
                    'expiry_date'        => $expiryDate,
                    'registration_years' => $order->registration_years + $years,
                ]);
            }

            return $result;
        } catch (\Exception $e) {
            Log::error("Domain renewal failed for {$domain}: " . $e->getMessage());
            throw new \Exception("Failed to renew domain: " . $e->getMessage());
        }
    }

    /**
     * Create a subdomain via Namecheap DNS + register in tenant_domains.
     *
     * @param  string $tenantId     Tenant identifier
     * @param  string $parentDomain Parent domain (e.g. baseus.com.bd)
     * @param  string $subdomain    Subdomain name (e.g. "shop", "track", "api")
     * @param  string $recordType   'A' or 'CNAME'
     * @param  string $address      Target (IP for A, hostname for CNAME)
     * @param  string $purpose      Domain purpose: website, tracking, api, storefront
     * @return TenantDomain
     */
    public function createSubdomain(
        string $tenantId,
        string $parentDomain,
        string $subdomain,
        string $recordType = 'A',
        string $address = '',
        string $purpose = 'website'
    ): TenantDomain {
        $fullSubdomain = "{$subdomain}.{$parentDomain}";
        $platformIp    = config('services.platform.ip', env('PLATFORM_IP', '127.0.0.1'));

        // Default address: platform IP for A records
        if (empty($address)) {
            $address = $recordType === 'A'
                ? $platformIp
                : (parse_url(config('app.url'), PHP_URL_HOST) ?? 'yourdomain.com');
        }

        // Check if subdomain already registered
        if (TenantDomain::where('domain', $fullSubdomain)->exists()) {
            throw new \Exception("Subdomain {$fullSubdomain} is already registered");
        }

        try {
            // 1. Parse parent domain for Namecheap API
            $parsed = NamecheapService::parseDomain($parentDomain);

            // 2. Create DNS record via Namecheap
            $success = $this->namecheap->createSubdomain(
                $parsed['sld'],
                $parsed['tld'],
                $subdomain,
                $recordType,
                $address
            );

            if (!$success) {
                throw new \Exception("Namecheap DNS record creation failed");
            }

            // 3. Register in tenant_domains
            $tenantDomain = TenantDomain::create([
                'tenant_id'   => $tenantId,
                'domain'      => $fullSubdomain,
                'is_verified' => true,
                'is_primary'  => false,
                'status'      => 'verified',
                'purpose'     => $purpose,
                'verified_at' => now(),
            ]);

            Log::info("Subdomain created: {$fullSubdomain} → {$recordType} {$address} (purpose: {$purpose})");

            return $tenantDomain;
        } catch (\Exception $e) {
            Log::error("Failed to create subdomain {$fullSubdomain}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Auto-setup DNS for a purchased domain.
     * 1. A record → platform IP (for website)
     * 2. Tracking subdomain → track.{domain} CNAME (if tracking module active)
     *
     * @param  string $tenantId  Tenant identifier
     * @param  string $domain    Purchased domain
     * @return array  Summary of what was configured
     */
    public function autoSetupDnsForPurchasedDomain(string $tenantId, string $domain): array
    {
        $platformIp = config('services.platform.ip', env('PLATFORM_IP', '127.0.0.1'));
        $baseDomain = parse_url(config('app.url'), PHP_URL_HOST) ?? 'yourdomain.com';
        $parsed     = NamecheapService::parseDomain($domain);
        $results    = [];

        try {
            // 1. Main A record → points domain to platform
            $this->namecheap->createSubdomain(
                $parsed['sld'], $parsed['tld'],
                '@', 'A', $platformIp
            );
            $results[] = "A @ → {$platformIp}";

            // 2. www CNAME → base domain
            $this->namecheap->createSubdomain(
                $parsed['sld'], $parsed['tld'],
                'www', 'CNAME', $domain
            );
            $results[] = "CNAME www → {$domain}";

            // 3. Tracking subdomain (if tracking module is active for this tenant)
            $tenant = Tenant::find($tenantId);
            $activeModules = $tenant ? json_decode($tenant->modules ?? '[]', true) : [];

            if (in_array('tracking', $activeModules)) {
                $trackDomain = $this->createSubdomain(
                    $tenantId,
                    $domain,
                    'track',
                    'CNAME',
                    $baseDomain,
                    'tracking'
                );
                $results[] = "CNAME track → {$baseDomain} (tracking)";
            }

            Log::info("Auto DNS setup for {$domain}: " . implode(', ', $results));
        } catch (\Exception $e) {
            Log::warning("Partial DNS auto-setup for {$domain}: " . $e->getMessage());
            $results[] = "Error: " . $e->getMessage();
        }

        return $results;
    }
}

