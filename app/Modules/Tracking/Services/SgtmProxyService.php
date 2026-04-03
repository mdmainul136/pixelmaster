<?php

namespace App\Modules\Tracking\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Server-Side Google Tag Manager (sGTM) Proxy Service
 *
 * Proxies client-side Google tags through the server for:
 * - First-party cookie setting (bypasses ITP/ETP)
 * - Privacy-compliant data enrichment
 * - Consent Mode V2 signal forwarding
 * - Measurement Protocol server-to-server events
 */
class SgtmProxyService
{
    private string $defaultTransportUrl;
    private int $timeout;

    public function __construct()
    {
        $this->defaultTransportUrl = config('tracking.sgtm_transport_url', 'https://sgtm.example.com');
        $this->timeout = config('tracking.sgtm_timeout', 5);
    }

    // ── GTM.js Proxy ──────────────────────────────────

    /**
     * Proxy the gtm.js script via server-side.
     * Supports pass-through query parameters (gtm_auth, gtm_preview, etc.).
     */
    public function proxyGtmJs(string $containerId, array $params = []): ?string
    {
        $queryString = !empty($params) ? '&' . http_build_query($params) : '';
        $url = "https://www.googletagmanager.com/gtm.js?id={$containerId}{$queryString}";

        try {
            $response = Http::timeout($this->timeout)->get($url);
            return $response->successful() ? $response->body() : null;
        } catch (\Exception $e) {
            Log::warning("sGTM: Failed to proxy gtm.js for {$containerId}", [
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Proxy the gtag.js script (GA4 tag).
     */
    public function proxyGtagJs(string $measurementId, array $params = []): ?string
    {
        $queryString = !empty($params) ? '&' . http_build_query($params) : '';
        $url = "https://www.googletagmanager.com/gtag/js?id={$measurementId}{$queryString}";

        try {
            $response = Http::timeout($this->timeout)->get($url);
            return $response->successful() ? $response->body() : null;
        } catch (\Exception $e) {
            Log::warning("sGTM: Failed to proxy gtag.js for {$measurementId}", [
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    // ── Measurement Protocol ──────────────────────────

    /**
     * Forward events via GA4 Measurement Protocol (server-to-server).
     *
     * @param string $measurementId  GA4 Measurement ID (G-XXXX)
     * @param string $apiSecret      GA4 API secret
     * @param array  $events         Events array per MP spec
     * @param string $clientId       Client ID
     * @param string|null $userId    Optional user ID
     */
    public function sendMeasurementProtocol(
        string $measurementId,
        string $apiSecret,
        array $events,
        string $clientId,
        ?string $userId = null
    ): array {
        $url = "https://www.google-analytics.com/mp/collect"
             . "?measurement_id={$measurementId}"
             . "&api_secret={$apiSecret}";

        $payload = [
            'client_id' => $clientId,
            'events'    => $events,
        ];

        if ($userId) {
            $payload['user_id'] = $userId;
        }

        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($url, $payload);

            return [
                'success'     => $response->successful(),
                'status_code' => $response->status(),
            ];
        } catch (\Exception $e) {
            Log::error("sGTM: Measurement Protocol send failed", [
                'measurement_id' => $measurementId,
                'error'          => $e->getMessage(),
            ]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    // ── Consent Mode V2 ──────────────────────────────

    /**
     * Build Consent Mode V2 default settings.
     *
     * @param array $consentState  ['analytics_storage'=>'granted', 'ad_storage'=>'denied', ...]
     */
    public function buildConsentConfig(array $consentState = []): array
    {
        $defaults = [
            'analytics_storage'           => 'denied',
            'ad_storage'                  => 'denied',
            'ad_user_data'                => 'denied',
            'ad_personalization'          => 'denied',
            'functionality_storage'       => 'granted',
            'personalization_storage'     => 'denied',
            'security_storage'            => 'granted',
        ];

        return array_merge($defaults, $consentState);
    }

    /**
     * Generate the client-side consent initialization snippet.
     */
    public function generateConsentSnippet(array $consentState = []): string
    {
        $config = $this->buildConsentConfig($consentState);
        $json = json_encode($config, JSON_UNESCAPED_SLASHES);

        return <<<JS
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', {$json});
        gtag('set', 'url_passthrough', true);
        gtag('set', 'ads_data_redaction', true);
        JS;
    }

    // ── Transport URL ────────────────────────────────

    /**
     * Generate a first-party transport URL for a tenant.
     * This allows the gtag to send data to the tenant's own domain.
     */
    public function getTransportUrl(string $tenantDomain): string
    {
        return "https://{$tenantDomain}/api/v1/tracking/mp/collect";
    }

    /**
     * Generate the full gtag config snippet with server-side transport.
     */
    public function generateGtagSnippet(
        string $measurementId,
        string $transportUrl,
        array $consentState = []
    ): string {
        $consent = $this->generateConsentSnippet($consentState);
        $configJson = json_encode([
            'transport_url'      => $transportUrl,
            'first_party_collection' => true,
        ], JSON_UNESCAPED_SLASHES);

        return <<<HTML
        <script>
        {$consent}
        </script>
        <script async src="{$transportUrl}/../gtag/js?id={$measurementId}"></script>
        <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '{$measurementId}', {$configJson});
        </script>
        HTML;
    }

    /**
     * Generate the standard GTM (Web Container) snippet pointing to your sGTM domain.
     * This is the exact code users will copy into their website <head>.
     */
    public function generateGtmSnippet(string $containerId, string $serverDomain): string
    {
        // Ensure domain has protocol
        $serverUrl = str_starts_with($serverDomain, 'http') ? $serverDomain : "https://{$serverDomain}";

        return <<<HTML
        <!-- PixelMasters sGTM Tracker -->
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        '{$serverUrl}/tracking/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','{$containerId}');</script>
        <!-- End PixelMasters sGTM Tracker -->
        HTML;
    }

    /**
     * Generate the standard GTM (Web Container) noscript snippet for <body>.
     */
    public function generateGtmNoscriptSnippet(string $containerId, string $serverDomain): string
    {
        $serverUrl = str_starts_with($serverDomain, 'http') ? $serverDomain : "https://{$serverDomain}";

        return <<<HTML
        <!-- PixelMasters sGTM Tracker (noscript) -->
        <noscript><iframe src="{$serverUrl}/api/v1/tracking/ns.html?id={$containerId}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        <!-- End PixelMasters sGTM Tracker (noscript) -->
        HTML;
    }

    // ── First-Party Cookie ────────────────────────────

    /**
     * Generate a GA-compatible client ID for first-party cookie.
     */
    public function generateClientId(): string
    {
        return rand(100000000, 999999999) . '.' . time();
    }

    /**
     * Parse _ga cookie value to extract client ID.
     */
    public function parseGaCookie(?string $gaCookie): ?string
    {
        if (!$gaCookie) return null;

        // GA cookie format: GA1.1.XXXXXXXXX.XXXXXXXXXX
        $parts = explode('.', $gaCookie);
        if (count($parts) >= 4) {
            return $parts[2] . '.' . $parts[3];
        }

        return null;
    }
}
