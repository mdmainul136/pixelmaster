<?php

namespace App\Modules\Tracking\Services;

use App\Modules\Tracking\Services\Channels\TikTokEventsService;
use App\Modules\Tracking\Services\Channels\GoogleAdsConversionService;
use App\Modules\Tracking\Services\Channels\SnapchatConversionService;
use App\Modules\Tracking\Services\Channels\PinterestConversionService;
use App\Modules\Tracking\Services\Channels\LinkedInConversionService;
use App\Modules\Tracking\Services\Channels\TwitterConversionService;
use App\Modules\Tracking\Services\Channels\WebhookForwardingService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Destination Service — Unified Multi-Channel Event Router.
 *
 * Routes events to 8 partner-grade advertising channels:
 *   1. Facebook/Meta CAPI v21.0       → MetaCapiService
 *   2. Google Analytics 4 (GA4)       → Measurement Protocol (enhanced)
 *   3. Google Ads Enhanced Conversions → GoogleAdsConversionService
 *   4. TikTok Events API v2           → TikTokEventsService
 *   5. Snapchat CAPI v3               → SnapchatConversionService
 *   6. Pinterest Conversions API v5   → PinterestConversionService
 *   7. LinkedIn Conversions API       → LinkedInConversionService
 *   8. Twitter/X Conversions API v12  → Built-in
 *   + Generic Webhook forwarding
 */
class DestinationService
{
    public function __construct(
        private MetaCapiService $metaCapi,
        private TikTokEventsService $tiktok,
        private GoogleAdsConversionService $googleAds,
        private SnapchatConversionService $snapchat,
        private PinterestConversionService $pinterest,
        private LinkedInConversionService $linkedin,
        private TwitterConversionService $twitter,
        private WebhookForwardingService $webhookService,
    ) {}

    /**
     * Route event to a destination by type.
     */
    public function send(string $type, array $event, array $creds, ?array $options = []): mixed
    {
        return match ($type) {
            'facebook_capi' => $this->sendToFacebookCapi($event, $creds, $options),
            'ga4'           => $this->sendToGA4($event, $creds),
            'google_ads'    => $this->sendToGoogleAds($event, $creds, $options),
            'tiktok'        => $this->sendToTikTok($event, $creds, $options),
            'snapchat'      => $this->sendToSnapchat($event, $creds, $options),
            'pinterest'     => $this->sendToPinterest($event, $creds, $options),
            'linkedin'      => $this->sendToLinkedIn($event, $creds, $options),
            'twitter'       => $this->sendToTwitter($event, $creds),
            'webhook'       => $this->sendToWebhook($event, $creds),
            default         => ['success' => false, 'error' => "Unknown destination: {$type}"],
        };
    }

    /**
     * Fan-out event to ALL active destinations on a container.
     *
     * @param  \App\Models\Tracking\TrackingContainer  $container
     * @param  array  $enrichedEvent  Already enriched event payload
     * @return array  Keyed by destination type: ['facebook_capi' => ['success' => true, ...], ...]
     */
    public function fanOut($container, array $enrichedEvent): array
    {
        $destinations = \App\Models\Tracking\TrackingDestination::where('container_id', $container->id)
            ->where('is_active', true)
            ->where('is_gateway', false)
            ->get();

        $results = [];

        foreach ($destinations as $destination) {
            $type    = $destination->type;
            $creds   = $destination->credentials ?? [];
            $options = $container->event_mappings[$type] ?? [];

            try {
                $results[$type] = $this->send($type, $enrichedEvent, $creds, $options);
            } catch (\Throwable $e) {
                Log::error("[Tracking][fanOut] Destination send failed", [
                    'type'         => $type,
                    'container_id' => $container->id,
                    'event_id'     => $enrichedEvent['event_id'] ?? null,
                    'error'        => $e->getMessage(),
                ]);
                $results[$type] = ['success' => false, 'error' => $e->getMessage()];
            }
        }

        return $results;
    }


    // ═══════════════════════════════════════════════════
    // 1. Facebook / Meta CAPI v21.0
    // ═══════════════════════════════════════════════════

    public function sendToFacebookCapi(array $event, array $creds, ?array $options = []): array
    {
        return $this->metaCapi->sendEvent($event, $creds, $options);
    }

    // ═══════════════════════════════════════════════════
    // 2. Google Analytics 4 — Measurement Protocol
    // ═══════════════════════════════════════════════════

    public function sendToGA4(array $event, array $creds): array
    {
        $measurementId = $creds['measurement_id'] ?? null;
        $apiSecret     = $creds['api_secret'] ?? null;

        if (!$measurementId || !$apiSecret) {
            return ['success' => false, 'error' => 'Missing measurement_id or api_secret'];
        }

        $url = "https://www.google-analytics.com/mp/collect?measurement_id={$measurementId}&api_secret={$apiSecret}";

        // Build GA4 event
        $ga4Event = [
            'name'   => $this->normalizeGA4EventName($event['event_name'] ?? 'page_view'),
            'params' => $this->buildGA4Params($event),
        ];

        $payload = [
            'client_id' => $event['user_data']['client_id']
                ?? $event['client_id']
                ?? $event['user_data']['fbp']
                ?? (string) Str::uuid(),
            'events'    => [$ga4Event],
        ];

        // User ID for cross-device tracking
        $userId = $event['user_data']['external_id'] ?? $event['user_id'] ?? null;
        if ($userId) {
            $payload['user_id'] = $userId;
        }

        // User properties
        if (!empty($event['user_properties'])) {
            $payload['user_properties'] = $event['user_properties'];
        }

        // Timestamp micros (for historical data)
        if (isset($event['event_time']) && $event['event_time'] < time() - 60) {
            $payload['timestamp_micros'] = (string) ($event['event_time'] * 1000000);
        }

        // Non-personalized ads (consent)
        if (isset($event['consent']['analytics']) && !$event['consent']['analytics']) {
            $payload['non_personalized_ads'] = true;
        }

        try {
            $response = Http::post($url, $payload);

            return [
                'success'     => $response->successful(),
                'status_code' => $response->status(),
                'events_sent' => 1,
            ];
        } catch (\Exception $e) {
            Log::error('[GA4] Request failed', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    // ═══════════════════════════════════════════════════
    // 3. Google Ads Enhanced Conversions
    // ═══════════════════════════════════════════════════

    public function sendToGoogleAds(array $event, array $creds, ?array $options = []): array
    {
        return $this->googleAds->sendEvent($event, $creds, $options);
    }

    // ═══════════════════════════════════════════════════
    // 4. TikTok Events API v2
    // ═══════════════════════════════════════════════════

    public function sendToTikTok(array $event, array $creds, ?array $options = []): array
    {
        return $this->tiktok->sendEvent($event, $creds, $options);
    }

    // ═══════════════════════════════════════════════════
    // 5. Snapchat CAPI v3
    // ═══════════════════════════════════════════════════

    public function sendToSnapchat(array $event, array $creds, ?array $options = []): array
    {
        return $this->snapchat->sendEvent($event, $creds, $options);
    }

    // ═══════════════════════════════════════════════════
    // 6. Pinterest Conversions API v5
    // ═══════════════════════════════════════════════════

    public function sendToPinterest(array $event, array $creds, ?array $options = []): array
    {
        return $this->pinterest->sendEvent($event, $creds, $options);
    }

    // ═══════════════════════════════════════════════════
    // 7. LinkedIn Conversions API
    // ═══════════════════════════════════════════════════

    public function sendToLinkedIn(array $event, array $creds, ?array $options = []): array
    {
        return $this->linkedin->sendEvent($event, $creds, $options);
    }

    // ═══════════════════════════════════════════════════
    // 8. Twitter / X Conversions API v12
    // ═══════════════════════════════════════════════════

    public function sendToTwitter(array $event, array $creds): array
    {
        return $this->twitter->sendEvent($event, $creds);
    }

    // ═══════════════════════════════════════════════════
    // Generic Webhook
    // ═══════════════════════════════════════════════════

    public function sendToWebhook(array $event, array $creds): array
    {
        return $this->webhookService->sendEvent($event, $creds);
    }

    // ═══════════════════════════════════════════════════
    // Helpers
    // ═══════════════════════════════════════════════════

    /**
     * Get all supported destination types.
     */
    public static function supportedDestinations(): array
    {
        return [
            'facebook_capi' => ['name' => 'Meta / Facebook CAPI',  'version' => 'v21.0',  'icon' => '📘'],
            'ga4'           => ['name' => 'Google Analytics 4',     'version' => 'MP',     'icon' => '📊'],
            'google_ads'    => ['name' => 'Google Ads',             'version' => 'v17',    'icon' => '🔍'],
            'tiktok'        => ['name' => 'TikTok Events API',     'version' => 'v1.3',   'icon' => '🎵'],
            'snapchat'      => ['name' => 'Snapchat CAPI',         'version' => 'v3',     'icon' => '👻'],
            'pinterest'     => ['name' => 'Pinterest Conversions', 'version' => 'v5',     'icon' => '📌'],
            'linkedin'      => ['name' => 'LinkedIn Conversions',  'version' => '202402', 'icon' => '💼'],
            'twitter'       => ['name' => 'Twitter / X Conversions', 'version' => 'v12',  'icon' => '🐦'],
            'webhook'       => ['name' => 'Custom Webhook',        'version' => '-',      'icon' => '🔗'],
        ];
    }

    /**
     * Get required credential fields for a destination type.
     */
    public static function requiredCredentials(string $type): array
    {
        return match ($type) {
            'facebook_capi' => ['pixel_id', 'access_token'],
            'ga4'           => ['measurement_id', 'api_secret'],
            'google_ads'    => ['customer_id', 'conversion_action', 'access_token', 'developer_token'],
            'tiktok'        => ['pixel_code', 'access_token'],
            'snapchat'      => ['pixel_id', 'access_token'],
            'pinterest'     => ['ad_account_id', 'access_token'],
            'linkedin'      => ['access_token', 'conversion_rule_id'],
            'twitter'       => ['pixel_id', 'access_token'],
            'webhook'       => ['url'],
            default         => [],
        };
    }

    private function normalizeGA4EventName(string $name): string
    {
        $map = [
            'PageView'       => 'page_view',
            'Purchase'       => 'purchase',
            'AddToCart'       => 'add_to_cart',
            'ViewContent'    => 'view_item',
            'Search'         => 'search',
            'InitiateCheckout' => 'begin_checkout',
            'AddPaymentInfo' => 'add_payment_info',
            'CompleteRegistration' => 'sign_up',
            'Lead'           => 'generate_lead',
            'Subscribe'      => 'sign_up',
            'AddToWishlist'  => 'add_to_wishlist',
        ];

        return $map[$name] ?? strtolower($name);
    }

    private function buildGA4Params(array $event): array
    {
        $params = [];
        $custom = $event['custom_data'] ?? [];

        if (isset($custom['value']))    $params['value'] = (float) $custom['value'];
        if (isset($custom['currency'])) $params['currency'] = $custom['currency'];
        if (isset($custom['content_name'])) $params['item_name'] = $custom['content_name'];
        if (isset($custom['content_category'])) $params['item_category'] = $custom['content_category'];
        if (isset($custom['search_string'])) $params['search_term'] = $custom['search_string'];
        if (isset($custom['order_id'])) $params['transaction_id'] = $custom['order_id'];
        if (isset($custom['num_items'])) $params['items_count'] = $custom['num_items'];

        // GA4 items array
        if (!empty($custom['content_ids'])) {
            $params['items'] = array_map(fn ($id) => ['item_id' => $id], $custom['content_ids']);
        }

        // Page location
        if (!empty($event['event_source_url'])) {
            $params['page_location'] = $event['event_source_url'];
        }

        // Session ID / Engagement
        if (!empty($event['session_id'])) {
            $params['session_id'] = $event['session_id'];
        }
        if (!empty($event['engagement_time_msec'])) {
            $params['engagement_time_msec'] = $event['engagement_time_msec'];
        }

        return $params;
    }
}
