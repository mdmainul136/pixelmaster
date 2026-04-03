<?php

namespace App\Services\CDN;

use App\Models\GlobalSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CdnManagerService
{
    /**
     * Purge CDN Cache based on the active provider
     */
    public function purgeCache(): array
    {
        $enabled  = GlobalSetting::get('cdn_tracking_enabled', false);
        $provider = GlobalSetting::get('cdn_provider', 'none');

        if (!$enabled || $provider === 'none') {
            return ['success' => false, 'message' => 'CDN is not enabled or no provider selected.'];
        }

        return match ($provider) {
            'cloudflare' => $this->purgeCloudflare(),
            'bunny'      => $this->purgeBunny(),
            default      => ['success' => false, 'message' => 'Manual purge not supported for custom CDN.'],
        };
    }

    /**
     * Purge Cloudflare Zone Cache
     */
    private function purgeCloudflare(): array
    {
        $token  = GlobalSetting::get('cdn_cloudflare_api_token');
        $zoneId = GlobalSetting::get('cdn_cloudflare_zone_id');

        if (!$token || !$zoneId) {
            return ['success' => false, 'message' => 'Cloudflare API Token or Zone ID missing.'];
        }

        try {
            $response = Http::withToken($token)
                ->post("https://api.cloudflare.com/client/v4/zones/{$zoneId}/purge_cache", [
                    'purge_everything' => true,
                ]);

            if ($response->successful()) {
                Log::info("[CDN] Cloudflare cache purged successfully.");
                return ['success' => true, 'message' => 'Cloudflare cache purged successfully.'];
            }

            return ['success' => false, 'message' => 'Cloudflare Error: ' . ($response->json()['errors'][0]['message'] ?? 'Unknown error')];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Connection failed: ' . $e->getMessage()];
        }
    }

    /**
     * Purge BunnyCDN Pull Zone Cache
     */
    private function purgeBunny(): array
    {
        $apiKey = GlobalSetting::get('cdn_bunny_api_key');
        $zoneId = GlobalSetting::get('cdn_bunny_pull_zone_id');

        if (!$apiKey || !$zoneId) {
            return ['success' => false, 'message' => 'BunnyCDN API Key or Pull Zone ID missing.'];
        }

        try {
            $response = Http::withHeaders([
                'AccessKey' => $apiKey,
                'Accept'    => 'application/json',
            ])->post("https://api.bunny.net/pullzone/{$zoneId}/purgeCache");

            if ($response->successful()) {
                Log::info("[CDN] BunnyCDN cache purged successfully.");
                return ['success' => true, 'message' => 'BunnyCDN cache purged successfully.'];
            }

            return ['success' => false, 'message' => 'BunnyCDN Error: Verification failed. Check API Key.'];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Connection failed: ' . $e->getMessage()];
        }
    }
}
