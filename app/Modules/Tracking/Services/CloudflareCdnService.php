<?php

namespace App\Modules\Tracking\Services;

use App\Models\Tracking\TrackingContainer;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * CloudflareCdnService
 * 
 * Handles the 'Global CDN' power-up features for provisioning custom 
 * domain proxying via Cloudflare's Edge network for low latency.
 */
class CloudflareCdnService
{
    private string $apiToken;
    private string $zoneId;

    public function __construct()
    {
        $this->apiToken = env('CLOUDFLARE_API_TOKEN', '');
        $this->zoneId = env('CLOUDFLARE_ZONE_ID', '');
    }

    /**
     * Check if Global CDN powerup is active and provision if needed.
     */
    public function provisionCdn(TrackingContainer $container): array
    {
        if (!in_array('global_cdn', $container->power_ups ?? [])) {
            return ['success' => false, 'message' => 'Global CDN power up not active.'];
        }

        $domain = $container->custom_domain;
        if (!$domain || empty($this->apiToken)) {
            return ['success' => false, 'message' => 'Valid domain and API token required.'];
        }

        Log::info("[CloudflareCdn] Provisioning Global CDN for {$domain} on {$container->container_id}");

        // Execute Cloudflare DNS Registration (Proxied)
        $response = Http::withToken($this->apiToken)
            ->post("https://api.cloudflare.com/client/v4/zones/{$this->zoneId}/dns_records", [
                'type' => 'CNAME',
                'name' => $domain,
                'content' => env('AWS_EKS_LB_URL', 'loadbalancer.pixelmaster.com'),
                'ttl' => 1,
                'proxied' => true,
                'comment' => "Provisioned for {$container->container_id} (Global CDN)"
            ]);

        if ($response->successful()) {
            return ['success' => true, 'id' => $response->json('result.id')];
        }

        Log::error("[CloudflareCdn] Failed provisioning {$domain}", ['error' => $response->body()]);
        return ['success' => false, 'error' => $response->json('errors')];
    }
}
