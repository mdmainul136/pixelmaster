<?php

namespace App\Services;

use App\Models\TenantDomain;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class SslProvisioningService
{
    /**
     * Request an SSL certificate for a verified domain.
     * This current implementation serves as a hook for external reverse proxies (Coolify, Nginx Proxy Manager, Cloudflare).
     */
    public function requestCertificate(int $domainId): bool
    {
        $domain = TenantDomain::findOrFail($domainId);

        if (!$domain->is_verified) {
            Log::warning("SSL certificate requested for unverified domain: {$domain->domain}");
            return false;
        }

        Log::info("Triggering SSL provisioning for: {$domain->domain}");

        // Placeholder for Let's Encrypt / Proxy webhook
        // Example: Http::post(config('services.proxy_manager.webhook'), ['domain' => $domain->domain]);

        $domain->update([
            'ssl_status' => 'provisioning',
        ]);

        return true;
    }

    /**
     * Check the status of an SSL provisioning request.
     */
    public function checkSslStatus(int $domainId): string
    {
        $domain = TenantDomain::findOrFail($domainId);
        
        // Logic to poll proxy or check local cert storage would go here
        
        return $domain->ssl_status ?? 'unknown';
    }
}
