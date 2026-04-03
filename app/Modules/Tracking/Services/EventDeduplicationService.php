<?php

namespace App\Modules\Tracking\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Event Deduplication Service
 *
 * Prevents duplicate events across Web + POS channels.
 *
 * Dedup strategy:
 *   - Each event has a unique event_id (e.g., web_purchase_123, pos_purchase_456)
 *   - event_id is cached for 24h with source tag
 *   - If same event_id arrives again → duplicate → skip
 *   - Different event_id for same order from different source → NOT duplicate
 *
 * Examples:
 *   web_purchase_123  → first time → process ✅
 *   web_purchase_123  → retry     → duplicate, skip ⏭
 *   pos_purchase_123  → POS sale  → different event_id → process ✅
 */
class EventDeduplicationService
{
    private string $cachePrefix = 'tracking_dedup:';
    private int $ttlSeconds = 86400; // 24 hours

    /**
     * Get the configured cache store for deduplication.
     */
    protected function getStore()
    {
        return Cache::store(env('TRACKING_DEDUP_STORE', 'redis'));
    }

    /**
     * Get the dynamic cache prefix for the current tenant.
     */
    private function getPrefix(): string
    {
        $tenantId = tenant('id') ?? 'global';
        return "{$this->cachePrefix}{$tenantId}:";
    }

    /**
     * Check if an event has already been processed.
     */
    public function isDuplicate(string $eventId): bool
    {
        return $this->getStore()->has($this->getPrefix() . $eventId);
    }

    /**
     * Mark an event as processed.
     *
     * @param string $eventId  Unique event identifier
     * @param string $source   Event source: 'web' | 'pos' | 'api'
     */
    public function markProcessed(string $eventId, string $source = 'web'): void
    {
        $this->getStore()->put(
            $this->getPrefix() . $eventId,
            [
                'source'       => $source,
                'processed_at' => now()->toIso8601String(),
            ],
            $this->ttlSeconds
        );
    }

    /**
     * Get dedup info for an event (for debugging).
     */
    public function getEventInfo(string $eventId): ?array
    {
        return $this->getStore()->get($this->getPrefix() . $eventId);
    }

    /**
     * Generate a unique event_id for a given source and context.
     *
     * @param string $source    'web' | 'pos'
     * @param string $eventName 'purchase' | 'add_to_cart' | etc.
     * @param string $uniqueKey Order ID, cart ID, etc.
     */
    public function generateEventId(string $source, string $eventName, string $uniqueKey): string
    {
        return "{$source}_{$eventName}_{$uniqueKey}";
    }

    /**
     * Flush dedup cache for a tenant (for testing/debugging).
     */
    public function flush(string $pattern = '*'): void
    {
        // Note: This only works with Redis/Memcached cache drivers
        // For file/array drivers, the TTL-based expiry handles cleanup
        Log::info("[Dedup] Cache flush requested for pattern: {$pattern}");
    }
}
