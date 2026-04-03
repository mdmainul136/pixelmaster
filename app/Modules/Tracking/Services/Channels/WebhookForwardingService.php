<?php

namespace App\Modules\Tracking\Services\Channels;

use App\Modules\Tracking\Traits\ThrottlesApiCalls;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Webhook Forwarding Service — Hardened with Throttling.
 *
 * Provides a secure way to forward tracking events to generic third-party
 * webhooks with rate limiting and HMAC signature support.
 */
class WebhookForwardingService
{
    use ThrottlesApiCalls;

    // Default rate limit for generic webhooks: 20 req/sec per URL
    private const RATE_LIMIT      = 20;
    private const RATE_WINDOW_SEC = 1;

    /**
     * Forward event to a generic webhook.
     */
    public function sendEvent(array $event, array $creds): array
    {
        $url = $creds['url'] ?? null;
        if (!$url) {
            return ['success' => false, 'error' => 'Missing webhook URL'];
        }

        // ── Rate limiting ───────────────────────────────────────────────────────
        $this->initThrottle('webhook', $url, self::RATE_LIMIT, self::RATE_WINDOW_SEC);

        if (!$this->acquireToken()) {
            $this->enqueueDeferred(base64_encode($url), $event, $creds);
            return [
                'success'     => true,
                'queued'      => 1,
                'throttled'   => true,
                'queue_depth' => $this->queueDepth(base64_encode($url)),
            ];
        }

        // ── Forwarding ─────────────────────────────────────────────────────────
        $headers = $creds['headers'] ?? [];
        $secret  = $creds['secret']  ?? null;

        try {
            $request = Http::timeout(15);

            if (!empty($headers)) {
                $request = $request->withHeaders($headers);
            }

            if ($secret) {
                $signature = hash_hmac('sha256', json_encode($event), $secret);
                $request = $request->withHeaders(['X-Webhook-Signature' => $signature]);
            }

            $response = $request->post($url, $event);

            return [
                'success'     => $response->successful(),
                'status_code' => $response->status(),
            ];
        } catch (\Exception $e) {
            Log::error('[Webhook Service] Request failed', ['url' => $url, 'error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Batch forwarding (iterative).
     */
    public function sendEvents(array $events, array $creds): array
    {
        $results = [];
        foreach ($events as $event) {
            $results[] = $this->sendEvent($event, $creds);
        }
        return ['success' => true, 'batch_results' => $results];
    }
}
