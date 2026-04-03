<?php

namespace App\Modules\Tracking\Services\Channels;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

/**
 * GA4MeasurementProtocolService
 *
 * Server-side GA4 event forwarding via Measurement Protocol v2.
 * Implements PixelMaster's throttle-avoidance strategy:
 *
 *   1. Batching     — up to 25 events per HTTP request (GA4 hard limit)
 *   2. Rate limiter — Redis token-bucket: max 10 events/sec per client_id
 *   3. Queue buffer — events exceeding rate limit go to a Redis list for
 *                     deferred sending (ProcessGA4QueueCommand drains it)
 *   4. Retry        — exponential backoff via ForwardToDestinationJob retries
 *
 * GA4 Limits (as of 2024):
 *   - 10 events/sec per client_id
 *   - 25 events per batch request
 *   - 500 distinct event names per property
 *   - 25 parameters per event
 *
 * Endpoint: POST https://www.google-analytics.com/mp/collect
 * Debug:    POST https://www.google-analytics.com/debug/mp/collect
 *
 * Required credentials:
 *   api_secret       → GA4 Measurement Protocol API secret
 *   measurement_id   → G-XXXXXXXX (GA4 Web Stream ID)
 *
 * ENV (optional overrides):
 *   GA4_RATE_LIMIT_PER_SEC=10
 *   GA4_BATCH_SIZE=25
 *   GA4_QUEUE_KEY_PREFIX=ga4_queue
 */
class GA4MeasurementProtocolService
{
    private const API_URL   = 'https://www.google-analytics.com/mp/collect';
    private const DEBUG_URL = 'https://www.google-analytics.com/debug/mp/collect';

    // GA4 hard limits
    private const MAX_BATCH_SIZE      = 25;   // max events per HTTP request
    private const MAX_PARAMS_PER_EVENT = 25;   // max custom params per event
    private const RATE_LIMIT_WINDOW   = 1;    // seconds
    private const DEFAULT_RATE_LIMIT  = 10;   // events/sec per client_id

    // Redis key patterns
    private const RATE_KEY_PREFIX  = 'ga4:rate:';
    private const QUEUE_KEY_PREFIX = 'ga4:queue:';

    /** @var int Events per second per client_id */
    private int $rateLimit;

    public function __construct()
    {
        $this->rateLimit = (int) env('GA4_RATE_LIMIT_PER_SEC', self::DEFAULT_RATE_LIMIT);
    }

    /**
     * Send a single event (batched if possible).
     * Main entry point called by DestinationService/ForwardToDestinationJob.
     */
    public function sendEvent(array $event, array $creds, bool $debug = false): array
    {
        return $this->sendBatch([$event], $creds, $debug);
    }

    /**
     * Send multiple events in a single Measurement Protocol request.
     * Enforces GA4's 25-event-per-request limit automatically.
     */
    public function sendBatch(array $events, array $creds, bool $debug = false): array
    {
        $apiSecret     = $creds['api_secret']     ?? null;
        $measurementId = $creds['measurement_id'] ?? null;

        if (!$apiSecret || !$measurementId) {
            return ['success' => false, 'error' => 'Missing api_secret or measurement_id'];
        }

        $clientId = $events[0]['client_id'] ?? null;

        // ── Rate limit check (token bucket via Redis) ──────────────────────────
        if ($clientId && !$this->acquireRateToken($clientId)) {
            // Rate limit exceeded — queue for deferred sending
            foreach ($events as $event) {
                $this->enqueueDeferred($event, $creds);
            }
            Log::info('[GA4] Rate limit hit — events queued for deferred send', [
                'client_id'   => $clientId,
                'count'       => count($events),
                'limit'       => $this->rateLimit . '/sec',
            ]);
            return ['success' => true, 'queued' => count($events), 'throttled' => true];
        }

        // ── Chunk into GA4's 25-event batches ─────────────────────────────────
        $chunks  = array_chunk($events, self::MAX_BATCH_SIZE);
        $results = [];

        foreach ($chunks as $chunk) {
            $results[] = $this->dispatchBatch($chunk, $apiSecret, $measurementId, $debug);
        }

        // Aggregate results
        $allSucceeded = !in_array(false, array_column($results, 'success'), true);
        return [
            'success'  => $allSucceeded,
            'batches'  => count($results),
            'sent'     => count($events),
            'details'  => $results,
        ];
    }

    /**
     * Drain the deferred queue for a given measurement_id.
     * Called by `php artisan tracking:drain-ga4-queue`.
     */
    public function drainQueue(string $measurementId, array $creds, int $limit = 100): int
    {
        $key    = self::QUEUE_KEY_PREFIX . $measurementId;
        $drained = 0;
        $batch  = [];

        while ($drained < $limit) {
            $raw = Redis::rpop($key);
            if (!$raw) {
                break;
            }

            $event = json_decode($raw, true);
            if ($event) {
                $batch[] = $event;
            }

            // Flush in 25-event batches
            if (count($batch) >= self::MAX_BATCH_SIZE) {
                $this->sendBatch($batch, $creds);
                $drained += count($batch);
                $batch = [];
            }
        }

        // Flush remainder
        if (!empty($batch)) {
            $this->sendBatch($batch, $creds);
            $drained += count($batch);
        }

        return $drained;
    }

    // ── Private: HTTP dispatch ─────────────────────────────────────────────────

    private function dispatchBatch(
        array  $events,
        string $apiSecret,
        string $measurementId,
        bool   $debug = false
    ): array {
        $url = ($debug ? self::DEBUG_URL : self::API_URL)
            . "?api_secret={$apiSecret}&measurement_id={$measurementId}";

        $built = array_map(fn($e) => $this->buildEvent($e), $events);

        try {
            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->timeout(15)
                ->post($url, [
                    'client_id' => $events[0]['client_id'] ?? $this->syntheticClientId($events[0]),
                    'events'    => $built,
                ]);

            if (!$response->successful()) {
                Log::warning('[GA4] Batch send failed', [
                    'status'      => $response->status(),
                    'body'        => $response->body(),
                    'event_count' => count($events),
                ]);
                return ['success' => false, 'status' => $response->status(), 'body' => $response->body()];
            }

            // Debug endpoint returns validation errors in body
            if ($debug) {
                $body = $response->json();
                if (!empty($body['validationMessages'])) {
                    Log::warning('[GA4 Debug] Validation warnings', [
                        'messages' => $body['validationMessages'],
                    ]);
                }
                return ['success' => true, 'debug' => $body];
            }

            return ['success' => true, 'status' => $response->status(), 'sent' => count($events)];

        } catch (\Throwable $e) {
            Log::error('[GA4] HTTP request failed', [
                'error'       => $e->getMessage(),
                'event_count' => count($events),
            ]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    // ── Private: Build event ───────────────────────────────────────────────────

    private function buildEvent(array $event): array
    {
        $name   = $this->normalizeEventName($event['event_name'] ?? 'page_view');
        $params = $event['params'] ?? $event['custom_data'] ?? [];

        // GA4 recommended params
        $builtParams = [
            'engagement_time_msec' => $params['engagement_time_msec'] ?? 100,
            'session_id'           => $params['session_id'] ?? $event['session_id'] ?? null,
        ];

        // Commerce params
        foreach (['value', 'currency', 'transaction_id', 'coupon', 'shipping', 'tax'] as $k) {
            if (isset($params[$k])) {
                $builtParams[$k] = $params[$k];
            }
        }

        // Items array (ecommerce)
        if (!empty($params['items'])) {
            $builtParams['items'] = $params['items'];
        }

        // Custom params — GA4 allows up to 25
        $custom = array_diff_key($params, array_flip([
            'engagement_time_msec', 'session_id', 'value', 'currency',
            'transaction_id', 'coupon', 'shipping', 'tax', 'items',
        ]));

        // Enforce 25-param limit
        $custom = array_slice($custom, 0, self::MAX_PARAMS_PER_EVENT - count($builtParams), true);

        if (count($custom) < count($params) - count($builtParams)) {
            Log::warning('[GA4] Event params truncated to 25 limit', ['event_name' => $name]);
        }

        return ['name' => $name, 'params' => array_merge($builtParams, $custom)];
    }

    private function normalizeEventName(string $name): string
    {
        // GA4 recommended event names (snake_case)
        $map = [
            'purchase'         => 'purchase',
            'add_to_cart'      => 'add_to_cart',
            'remove_from_cart' => 'remove_from_cart',
            'begin_checkout'   => 'begin_checkout',
            'view_item'        => 'view_item',
            'view_item_list'   => 'view_item_list',
            'select_item'      => 'select_item',
            'add_payment_info' => 'add_payment_info',
            'add_shipping_info'=> 'add_shipping_info',
            'view_cart'        => 'view_cart',
            'page_view'        => 'page_view',
            'pageview'         => 'page_view',
            'sign_up'          => 'sign_up',
            'login'            => 'login',
            'search'           => 'search',
            'share'            => 'share',
            'lead'             => 'generate_lead',
        ];

        $normalized = strtolower(str_replace(['-', ' '], '_', $name));
        return $map[$normalized] ?? $normalized;
    }

    // ── Private: Rate limiting (Redis token bucket) ────────────────────────────

    /**
     * Token-bucket rate limiter.
     * Returns true if the request can proceed, false if throttled.
     */
    private function acquireRateToken(string $clientId): bool
    {
        try {
            $key   = self::RATE_KEY_PREFIX . $clientId;
            $count = (int) Redis::get($key);

            if ($count >= $this->rateLimit) {
                return false; // Throttled
            }

            // Increment counter, set 1-second TTL on first touch
            $pipe = Redis::pipeline();
            $pipe->incr($key);
            $pipe->expire($key, self::RATE_LIMIT_WINDOW);
            $pipe->execute();

            return true;

        } catch (\Throwable $e) {
            // Redis unavailable — allow through (fail open to avoid dropping events)
            Log::warning('[GA4] Rate limiter Redis error (fail-open)', ['error' => $e->getMessage()]);
            return true;
        }
    }

    // ── Private: Deferred queue ────────────────────────────────────────────────

    private function enqueueDeferred(array $event, array $creds): void
    {
        try {
            $measurementId = $creds['measurement_id'] ?? 'unknown';
            $key = self::QUEUE_KEY_PREFIX . $measurementId;

            // Store event + creds together so drainQueue can resend independently
            Redis::lpush($key, json_encode([
                'event'    => $event,
                'creds'    => $creds,
                'queued_at'=> now()->toIso8601String(),
            ]));

            // Expire queue after 24h (events older than this are stale)
            Redis::expire($key, 86400);

        } catch (\Throwable $e) {
            Log::error('[GA4] Failed to enqueue deferred event', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Generate a synthetic client_id from user_data when no client_id is present.
     * GA4 requires client_id — without it the hit is dropped silently.
     */
    private function syntheticClientId(array $event): string
    {
        $seed = $event['user_data']['em']
            ?? $event['source_ip']
            ?? $event['user_agent']
            ?? Str::uuid()->toString();

        // Format: <first-8-of-hash>.<unix-timestamp>  (mimics GA4 cookie pattern)
        return substr(hash('sha256', $seed), 0, 8) . '.' . now()->timestamp;
    }
}
