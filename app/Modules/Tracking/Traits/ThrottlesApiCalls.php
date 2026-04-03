<?php

namespace App\Modules\Tracking\Traits;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

/**
 * ThrottlesApiCalls
 *
 * Reusable Redis token-bucket rate limiter + deferred queue for
 * third-party event APIs (Meta CAPI, TikTok Events API, etc.).
 *
 * Usage in a service:
 *   use ThrottlesApiCalls;
 *   $this->initThrottle('meta', $pixelId, rateLimit: 200, windowSec: 3600);
 *
 *   if (!$this->acquireToken()) {
 *       $this->enqueueDeferred($event, $creds);
 *       return ['success' => true, 'queued' => 1, 'throttled' => true];
 *   }
 */
trait ThrottlesApiCalls
{
    private string $throttleChannel = 'api';
    private string $throttleKey     = '';
    private int    $throttleLimit   = 60;
    private int    $throttleWindow  = 60; // seconds

    /**
     * Initialize the rate-limiter for this service / credential pair.
     *
     * @param string $channel   Short name used in Redis keys and logs (e.g. 'meta', 'tiktok')
     * @param string $identity  Pixel ID, Access Token prefix, or any unique credential key
     * @param int    $rateLimit Max requests allowed within $windowSec
     * @param int    $windowSec Window size in seconds
     */
    protected function initThrottle(
        string $channel,
        string $identity,
        int    $rateLimit = 60,
        int    $windowSec = 60
    ): void {
        $this->throttleChannel = $channel;
        $this->throttleKey     = "{$channel}:rate:" . substr(hash('sha256', $identity), 0, 12);
        $this->throttleLimit   = $rateLimit;
        $this->throttleWindow  = $windowSec;
    }

    /**
     * Attempt to acquire a rate-limit token.
     * Returns true if the call can proceed, false if throttled.
     *
     * Uses Redis INCR + EXPIRE for atomic token-bucket simulation.
     * On Redis failure → fail-open (allow through) to avoid dropping events.
     */
    protected function acquireToken(): bool
    {
        if (empty($this->throttleKey)) {
            return true; // Not initialized — allow through
        }

        try {
            $count = (int) Redis::get($this->throttleKey);

            if ($count >= $this->throttleLimit) {
                Log::info("[{$this->throttleChannel}] Rate limit hit", [
                    'key'    => $this->throttleKey,
                    'count'  => $count,
                    'limit'  => $this->throttleLimit,
                    'window' => "{$this->throttleWindow}s",
                ]);
                return false;
            }

            $pipe = Redis::pipeline();
            $pipe->incr($this->throttleKey);
            $pipe->expire($this->throttleKey, $this->throttleWindow);
            $pipe->execute();

            return true;

        } catch (\Throwable $e) {
            Log::warning("[{$this->throttleChannel}] Redis throttle error — fail-open", [
                'error' => $e->getMessage(),
            ]);
            return true; // Fail open
        }
    }

    /**
     * Push an event + credentials into the Redis deferred queue.
     * Drained later by the channel-specific Artisan drain command.
     *
     * @param string $queueSuffix  Unique identifier for this queue (e.g. pixelId)
     * @param array  $event        Event payload
     * @param array  $creds        Credentials (stored so drain job can resend independently)
     * @param int    $ttlSeconds   Queue TTL — events beyond this are stale (default 24h)
     */
    protected function enqueueDeferred(
        string $queueSuffix,
        array  $event,
        array  $creds,
        int    $ttlSeconds = 86400
    ): void {
        try {
            $key = "{$this->throttleChannel}:queue:{$queueSuffix}";

            Redis::lpush($key, json_encode([
                'event'     => $event,
                'creds'     => $creds,
                'queued_at' => now()->toIso8601String(),
            ]));

            Redis::expire($key, $ttlSeconds);

        } catch (\Throwable $e) {
            Log::error("[{$this->throttleChannel}] Failed to enqueue deferred event", [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Pop and return up to $limit items from the deferred queue.
     *
     * @return array[] Array of ['event' => ..., 'creds' => ..., 'queued_at' => ...]
     */
    protected function popDeferred(string $queueSuffix, int $limit = 100): array
    {
        try {
            $key   = "{$this->throttleChannel}:queue:{$queueSuffix}";
            $items = [];

            for ($i = 0; $i < $limit; $i++) {
                $raw = Redis::rpop($key);
                if (!$raw) {
                    break;
                }
                $decoded = json_decode($raw, true);
                if ($decoded) {
                    $items[] = $decoded;
                }
            }

            return $items;

        } catch (\Throwable $e) {
            Log::error("[{$this->throttleChannel}] Failed to pop deferred queue", [
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Return current queue depth (for monitoring/alerting).
     */
    protected function queueDepth(string $queueSuffix): int
    {
        try {
            return (int) Redis::llen("{$this->throttleChannel}:queue:{$queueSuffix}");
        } catch (\Throwable) {
            return 0;
        }
    }

    /**
     * Return current rate-limit counter (for monitoring).
     */
    protected function currentRate(): int
    {
        try {
            return (int) Redis::get($this->throttleKey);
        } catch (\Throwable) {
            return 0;
        }
    }
}
