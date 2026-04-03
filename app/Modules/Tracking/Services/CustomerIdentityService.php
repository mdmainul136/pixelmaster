<?php

namespace App\Modules\Tracking\Services;

use App\Models\Tracking\CustomerIdentity;
use App\Models\Tracking\TrackingContainer;
use App\Models\Tracking\IdentityEvent;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * CustomerIdentityService
 *
 * Resolves, links, and segments customer identities for multi-tenant tracking.
 *
 * Identity Resolution Strategy (priority order):
 *   1. user_id      — strongest (login)
 *   2. email_hash   — strong (deterministic)
 *   3. phone_hash   — strong (deterministic)
 *   4. anonymous_id — weak (probabilistic, session-based)
 *
 * Cross-device tracking:
 *   - Mobile browse (anon_id A) → Desktop purchase (email X)
 *   - anon_id A gets merged into email X's identity profile
 *   - All historical events reattributed to the unified profile
 *
 * Repeat customer detection:
 *   - order_count, total_spent, last_order_at updated on every Purchase event
 *   - Segment recalculated automatically after each update
 */
class CustomerIdentityService
{
    // Segment thresholds — can be overridden per-tenant in settings
    const LOYAL_ORDER_THRESHOLD = 5;
    const LOYAL_SPEND_THRESHOLD = 10000;
    const VIP_SPEND_THRESHOLD   = 50000;
    const CHURN_DAYS_THRESHOLD  = 180;
    const RETURNING_DAYS_MAX    = 90;

    // ─────────────────────────────────────────────────────────────────────────
    // PRIMARY API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Identify a user from an inbound event payload.
     * Creates or resolves an existing identity profile.
     * Merges if multiple identifiers are found.
     *
     * @param  TrackingContainer $container
     * @param  array             $payload   Event payload (user_data, custom_data, etc.)
     * @return CustomerIdentity|null
     */
    public function identify(TrackingContainer $container, array $payload): ?CustomerIdentity
    {
        $tenantId   = $container->tenant_id ?? 0;
        $userData   = $payload['user_data']  ?? [];
        $customData = $payload['custom_data'] ?? [];

        // Extract identifiers
        $emailHash   = $userData['em']    ?? $userData['email_hash']  ?? null;
        $phoneHash   = $userData['ph']    ?? $userData['phone_hash']  ?? null;
        $userId      = $userData['external_id'] ?? $userData['user_id'] ?? null;
        $anonymousId = $payload['anonymous_id'] ?? $payload['client_id'] ?? null;

        if (!$emailHash && !$phoneHash && !$userId && !$anonymousId) {
            return null; // No identifiers — cannot resolve
        }

        try {
            return DB::transaction(function () use (
                $tenantId, $emailHash, $phoneHash, $userId, $anonymousId, $payload, $customData
            ) {
                // Try to find existing identity (strongest → weakest)
                $identity = $this->findExistingIdentity($tenantId, $userId, $emailHash, $phoneHash, $anonymousId);

                if ($identity) {
                    // Update with new identifiers (merge)
                    $this->enrichIdentity($identity, $userId, $emailHash, $phoneHash, $anonymousId, $payload);
                } else {
                    // Create new identity profile
                    $identity = $this->createIdentity($tenantId, $userId, $emailHash, $phoneHash, $anonymousId, $payload);
                }

                // Update purchase metrics on purchase events
                if (in_array(strtolower($payload['event_name'] ?? ''), ['purchase', 'order_placed'])) {
                    $this->recordPurchase($identity, $customData, $payload);
                }

                // Track WhatsApp/phone clicks
                if (in_array(strtolower($payload['event_name'] ?? ''), ['whatsapp_click', 'phone_click', 'call_intent'])) {
                    $this->recordContactClick($identity, $payload);
                }

                // Recalculate segment
                $this->recalculateSegment($identity);

                // Update device intelligence
                $this->updateDeviceInfo($identity, $payload);

                return $identity->fresh();
            });

        } catch (\Throwable $e) {
            Log::error('[Identity] Resolution failed', [
                'tenant_id' => $tenantId,
                'error'     => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Manually merge an anonymous_id into a known identity.
     * Called when a user logs in or provides email during checkout.
     *
     * @param string $anonymousId  The session/cookie anonymous ID
     * @param string $knownId      email_hash, phone_hash, or user_id
     * @param string $linkType     'email' | 'phone' | 'user_id' | 'login'
     * @param int    $tenantId
     * @param string $sourceEvent  e.g. 'purchase', 'login', 'otp_verify'
     */
    public function merge(
        string $anonymousId,
        string $knownId,
        string $linkType,
        int    $tenantId,
        string $sourceEvent = 'manual'
    ): bool {
        try {
            // Find the known identity
            $knownIdentity = match ($linkType) {
                'email'   => CustomerIdentity::where('tenant_id', $tenantId)->where('email_hash', $knownId)->first(),
                'phone'   => CustomerIdentity::where('tenant_id', $tenantId)->where('phone_hash', $knownId)->first(),
                'user_id' => CustomerIdentity::where('tenant_id', $tenantId)->where('user_id', $knownId)->first(),
                default   => null,
            };

            if (!$knownIdentity) {
                return false;
            }

            // Add anonymous_id to the merged list
            $mergedIds   = $knownIdentity->merged_anonymous_ids ?? [];
            $mergedIds[] = $anonymousId;
            $mergedIds   = array_unique($mergedIds);

            $knownIdentity->update([
                'merged_anonymous_ids' => $mergedIds,
                'is_cross_device'      => count($mergedIds) > 1,
            ]);

            // Log the merge event
            IdentityEvent::create([
                'tenant_id'    => $tenantId,
                'from_id'      => $anonymousId,
                'to_id'        => $knownId,
                'link_type'    => $linkType,
                'source_event' => $sourceEvent,
                'identity_id'  => $knownIdentity->id,
                'confidence'   => 100,
                'linked_at'    => now(),
            ]);

            Log::info('[Identity] Merged anonymous ID into known identity', [
                'tenant_id'    => $tenantId,
                'anonymous_id' => $anonymousId,
                'known_id'     => $knownId,
                'link_type'    => $linkType,
                'identity_id'  => $knownIdentity->id,
            ]);

            return true;

        } catch (\Throwable $e) {
            Log::error('[Identity] Merge failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SEGMENT CALCULATION
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get customer segment label based on purchase history.
     *
     * @param int        $orderCount
     * @param float      $totalSpent
     * @param Carbon|null $lastOrderAt
     */
    public function getSegment(int $orderCount, float $totalSpent, ?Carbon $lastOrderAt): string
    {
        if ($orderCount === 0) {
            return 'prospect';
        }

        $daysSinceLast = $lastOrderAt ? now()->diffInDays($lastOrderAt) : 9999;

        // VIP — highest spend
        if ($totalSpent >= self::VIP_SPEND_THRESHOLD) {
            return 'vip';
        }

        // Churned — hasn't ordered in 180+ days
        if ($daysSinceLast > self::CHURN_DAYS_THRESHOLD) {
            return 'churned';
        }

        // Loyal — 5+ orders OR 10K+ spend
        if ($orderCount >= self::LOYAL_ORDER_THRESHOLD || $totalSpent >= self::LOYAL_SPEND_THRESHOLD) {
            return 'loyal';
        }

        // Returning — 2-4 orders, active in 90 days
        if ($orderCount >= 2 && $daysSinceLast <= self::RETURNING_DAYS_MAX) {
            return 'returning';
        }

        // New customer — 1st order
        return 'new_customer';
    }

    /**
     * Get aggregated segment stats for the dashboard.
     */
    public function getSegmentStats(int $tenantId): array
    {
        $cacheKey = "identity_segments_{$tenantId}";

        return Cache::remember($cacheKey, 300, function () use ($tenantId) {
            $counts = CustomerIdentity::where('tenant_id', $tenantId)
                ->selectRaw('customer_segment, COUNT(*) as count, SUM(total_spent) as revenue, AVG(total_spent) as avg_ltv')
                ->groupBy('customer_segment')
                ->get()
                ->keyBy('customer_segment')
                ->map(fn($row) => [
                    'count'   => $row->count,
                    'revenue' => round($row->revenue, 2),
                    'avg_ltv' => round($row->avg_ltv, 2),
                ]);

            $total   = CustomerIdentity::where('tenant_id', $tenantId)->count();
            $repeats = CustomerIdentity::where('tenant_id', $tenantId)->where('order_count', '>', 1)->count();

            return [
                'segments'         => $counts,
                'total_customers'  => $total,
                'repeat_customers' => $repeats,
                'repeat_rate'      => $total > 0 ? round($repeats / $total * 100, 1) : 0,
                'cross_device'     => CustomerIdentity::where('tenant_id', $tenantId)->where('is_cross_device', true)->count(),
            ];
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private function findExistingIdentity(
        int     $tenantId,
        ?string $userId,
        ?string $emailHash,
        ?string $phoneHash,
        ?string $anonymousId
    ): ?CustomerIdentity {
        // Priority: user_id > email > phone > anon (JSON search — can miss, that's OK)
        return CustomerIdentity::where('tenant_id', $tenantId)
            ->where(function ($q) use ($userId, $emailHash, $phoneHash, $anonymousId) {
                if ($userId)      $q->orWhere('user_id', $userId);
                if ($emailHash)   $q->orWhere('email_hash', $emailHash);
                if ($phoneHash)   $q->orWhere('phone_hash', $phoneHash);
                if ($anonymousId) $q->orWhere('primary_anonymous_id', $anonymousId);
            })
            ->orderByRaw("CASE
                WHEN user_id IS NOT NULL THEN 1
                WHEN email_hash IS NOT NULL THEN 2
                WHEN phone_hash IS NOT NULL THEN 3
                ELSE 4
            END")
            ->first();
    }

    private function createIdentity(
        int     $tenantId,
        ?string $userId,
        ?string $emailHash,
        ?string $phoneHash,
        ?string $anonymousId,
        array   $payload
    ): CustomerIdentity {
        $utmSource   = $payload['utm_source']   ?? null;
        $utmMedium   = $payload['utm_medium']   ?? null;
        $utmCampaign = $payload['utm_campaign'] ?? null;

        return CustomerIdentity::create([
            'tenant_id'             => $tenantId,
            'user_id'               => $userId,
            'email_hash'            => $emailHash,
            'phone_hash'            => $phoneHash,
            'primary_anonymous_id'  => $anonymousId,
            'merged_anonymous_ids'  => $anonymousId ? [$anonymousId] : [],
            'customer_segment'      => 'prospect',
            'first_touch_source'    => $utmSource,
            'first_touch_medium'    => $utmMedium,
            'first_touch_campaign'  => $utmCampaign,
            'last_touch_source'     => $utmSource,
            'last_touch_medium'     => $utmMedium,
        ]);
    }

    private function enrichIdentity(
        CustomerIdentity $identity,
        ?string $userId,
        ?string $emailHash,
        ?string $phoneHash,
        ?string $anonymousId,
        array   $payload
    ): void {
        $updates = [];

        if ($userId    && !$identity->user_id)    $updates['user_id']    = $userId;
        if ($emailHash && !$identity->email_hash) $updates['email_hash'] = $emailHash;
        if ($phoneHash && !$identity->phone_hash) $updates['phone_hash'] = $phoneHash;

        // Cross-device: new anonymous_id seen for same known identity
        if ($anonymousId && $anonymousId !== $identity->primary_anonymous_id) {
            $merged   = $identity->merged_anonymous_ids ?? [];
            if (!in_array($anonymousId, $merged)) {
                $merged[]         = $anonymousId;
                $updates['merged_anonymous_ids'] = array_unique($merged);
                $updates['is_cross_device']      = true;
                $updates['device_count']         = count($merged);
            }
        }

        // Update last-touch UTM
        if (!empty($payload['utm_source'])) {
            $updates['last_touch_source'] = $payload['utm_source'];
            $updates['last_touch_medium'] = $payload['utm_medium'] ?? null;
        }

        if ($updates) {
            $identity->update($updates);
        }
    }

    private function recordPurchase(CustomerIdentity $identity, array $customData, array $payload): void
    {
        $value      = (float) ($customData['value'] ?? $payload['value'] ?? 0);
        $newCount   = $identity->order_count + 1;
        $newTotal   = $identity->total_spent + $value;
        $newAvg     = $newCount > 0 ? $newTotal / $newCount : 0;

        $identity->update([
            'order_count'          => $newCount,
            'total_spent'          => $newTotal,
            'avg_order_value'      => round($newAvg, 2),
            'first_order_at'       => $identity->first_order_at ?? now(),
            'last_order_at'        => now(),
            'days_since_last_order' => 0,
        ]);
    }

    private function recordContactClick(CustomerIdentity $identity, array $payload): void
    {
        $field = str_contains(strtolower($payload['event_name'] ?? ''), 'whatsapp')
            ? 'whatsapp_click_count'
            : 'phone_order_count';

        $identity->increment($field);
        $identity->update(['last_whatsapp_click_at' => now()]);
    }

    private function recalculateSegment(CustomerIdentity $identity): void
    {
        $newSegment = $this->getSegment(
            $identity->order_count,
            (float) $identity->total_spent,
            $identity->last_order_at ? Carbon::parse($identity->last_order_at) : null
        );

        if ($newSegment !== $identity->customer_segment) {
            $identity->update([
                'customer_segment'   => $newSegment,
                'segment_updated_at' => now(),
            ]);
        }
    }

    private function updateDeviceInfo(CustomerIdentity $identity, array $payload): void
    {
        $ua = $payload['user_agent'] ?? null;
        if (!$ua) return;

        $devices = $identity->devices ?? [];
        $uaKey   = md5($ua);

        // Add device if not already tracked
        if (!isset($devices[$uaKey])) {
            $devices[$uaKey] = [
                'ua'         => substr($ua, 0, 200),
                'first_seen' => now()->toIso8601String(),
                'last_seen'  => now()->toIso8601String(),
                'type'       => $this->detectDeviceType($ua),
            ];

            $identity->update(['devices' => $devices]);
        }
    }

    private function detectDeviceType(string $ua): string
    {
        if (preg_match('/Mobile|Android|iPhone|iPad/i', $ua)) {
            return preg_match('/iPad/i', $ua) ? 'tablet' : 'mobile';
        }
        return 'desktop';
    }
}
