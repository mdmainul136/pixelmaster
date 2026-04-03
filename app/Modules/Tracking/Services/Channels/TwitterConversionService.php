<?php

namespace App\Modules\Tracking\Services\Channels;

use App\Modules\Tracking\Traits\ThrottlesApiCalls;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Twitter / X Conversions API v12 — Dedicated Service.
 *
 * Implements PixelMaster's throttle-avoidance strategy:
 *   - Rate limiting via ThrottlesApiCalls trait (500 req/min).
 *   - Deferred Redis queue for throttled events.
 *   - Automatic hashing of PII (email, phone).
 *   - Support for twitter click ID (twclid).
 *
 * Endpoint: POST https://ads-api.twitter.com/12/measurement/conversions/{pixel_id}
 */
class TwitterConversionService
{
    use ThrottlesApiCalls;

    private const API_BASE = 'https://ads-api.twitter.com/12/measurement/conversions';
    
    // Twitter Measurement API limit: Conservative 450 req/min
    private const RATE_LIMIT      = 450;
    private const RATE_WINDOW_SEC = 60;

    /**
     * Send a single event to Twitter.
     */
    public function sendEvent(array $event, array $creds): array
    {
        return $this->sendEvents([$event], $creds);
    }

    /**
     * Send batch events to Twitter.
     */
    public function sendEvents(array $events, array $creds): array
    {
        $pixelId = $creds['pixel_id'] ?? null;
        $token   = $creds['access_token'] ?? null;

        if (!$pixelId || !$token) {
            return ['success' => false, 'error' => 'Missing pixel_id or access_token'];
        }

        // ── Rate limiting ───────────────────────────────────────────────────────
        $this->initThrottle('twitter', $pixelId, self::RATE_LIMIT, self::RATE_WINDOW_SEC);

        if (!$this->acquireToken()) {
            foreach ($events as $event) {
                $this->enqueueDeferred($pixelId, $event, $creds);
            }
            return [
                'success'     => true,
                'queued'      => count($events),
                'throttled'   => true,
                'queue_depth' => $this->queueDepth($pixelId),
            ];
        }

        // ── Forwarding ─────────────────────────────────────────────────────────
        $conversions = array_map(fn($e) => $this->buildConversion($e), $events);
        $url = self::API_BASE . "/{$pixelId}";

        try {
            $response = Http::withToken($token, 'Bearer')
                ->timeout(30)
                ->post($url, ['conversions' => $conversions]);

            return [
                'success'     => $response->successful(),
                'status_code' => $response->status(),
                'body'        => $response->json(),
                'events_sent' => count($conversions),
            ];
        } catch (\Exception $e) {
            Log::error('[Twitter/X CAPI] Request failed', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Build a Twitter conversion object.
     */
    private function buildConversion(array $event): array
    {
        $userData = $event['user_data'] ?? [];
        $identifiers = [];

        // Hashed email
        $email = $userData['em'] ?? $userData['email'] ?? null;
        if ($email) {
            $identifiers[] = ['hashed_email' => $this->ensureHashed($email)];
        }

        // Hashed phone
        $phone = $userData['ph'] ?? $userData['phone'] ?? null;
        if ($phone) {
            $identifiers[] = ['hashed_phone_number' => $this->ensureHashed(preg_replace('/[^\d]/', '', $phone))];
        }

        // Click ID (twclid)
        $twclid = $event['twclid'] ?? $userData['twclid'] ?? request()?->cookie('_twclid') ?? request()?->get('twclid');
        if ($twclid) {
            $identifiers[] = ['twclid' => $twclid];
        }

        $conversion = [
            'conversion_time' => date('c', $event['event_time'] ?? time()),
            'event_id'        => $event['event_id'] ?? (string) Str::uuid(),
            'identifiers'     => $identifiers ?: [['hashed_email' => '']], // Twitter requires at least one identifier
            'conversion_id'   => $this->normalizeTwitterEvent($event['event_name'] ?? 'page_view'),
            'description'     => $event['event_name'] ?? 'page_view',
        ];

        // Custom Data
        $custom = $event['custom_data'] ?? [];
        if (isset($custom['value'])) {
            $conversion['value'] = (string) $custom['value'];
            $conversion['currency'] = $custom['currency'] ?? 'USD';
        }

        if (!empty($custom['num_items'])) {
            $conversion['number_items'] = (int) $custom['num_items'];
        }

        return $conversion;
    }

    private function ensureHashed(string $value): string
    {
        $value = strtolower(trim($value));
        if (preg_match('/^[a-f0-9]{64}$/', $value)) return $value;
        return hash('sha256', $value);
    }

    private function normalizeTwitterEvent(string $name): string
    {
        $map = [
            'purchase'     => 'tw-purchase',
            'sign_up'      => 'tw-signup',
            'page_view'    => 'tw-pageview',
            'add_to_cart'  => 'tw-addtocart',
            'search'       => 'tw-search',
            'lead'         => 'tw-lead',
            'view_content' => 'tw-viewcontent',
            'download'     => 'tw-download',
        ];

        return $map[strtolower($name)] ?? strtolower($name);
    }
}
