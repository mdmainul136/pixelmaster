<?php

namespace App\Modules\Tracking\Services;

use App\Models\Tracking\TrackingContainer;
use App\Models\Tracking\CustomerIdentity;
use App\Models\Tracking\TrackingEventLog;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class IdentityResolutionService
{
    /**
     * Resolve or create a Customer Identity.
     * Implements deterministic (Email) and heuristic (IP + Device) stitching.
     */
    public function resolve(TrackingContainer $container, array $event): ?CustomerIdentity
    {
        $email = $event['user_data']['email'] ?? null;
        $phone = $event['user_data']['phone'] ?? null;
        $anonymousId = $event['client_id'] ?? $event['anonymous_id'] ?? null;
        
        $emailHash = $email ? hash('sha256', strtolower(trim($email))) : null;
        $phoneHash = $phone ? hash('sha256', str_replace(['+', ' ', '-'], '', $phone)) : null;

        // 1. Attempt Deterministic Match (Email/Phone)
        $identity = null;
        if ($emailHash) {
            $identity = CustomerIdentity::where('tenant_id', $container->tenant_id)
                ->where('email_hash', $emailHash)
                ->first();
        }

        if (!$identity && $phoneHash) {
            $identity = CustomerIdentity::where('tenant_id', $container->tenant_id)
                ->where('phone_hash', $phoneHash)
                ->first();
        }

        // 2. If no identity found, attempt Anonymous ID match
        if (!$identity && $anonymousId) {
            $identity = CustomerIdentity::where('tenant_id', $container->tenant_id)
                ->where('primary_anonymous_id', $anonymousId)
                ->orWhereJsonContains('merged_anonymous_ids', $anonymousId)
                ->first();
        }

        // 3. Create NEW Identity if still not found (only if we have meaningful data)
        if (!$identity && ($emailHash || $phoneHash || $anonymousId)) {
            $identity = CustomerIdentity::create([
                'tenant_id'            => $container->tenant_id,
                'email_hash'           => $emailHash,
                'phone_hash'           => $phoneHash,
                'primary_anonymous_id' => $anonymousId,
                'merged_anonymous_ids' => $anonymousId ? [$anonymousId] : [],
                'customer_segment'     => 'prospect',
                'first_touch_source'   => $event['utm']['utm_source'] ?? 'direct',
                'first_touch_medium'   => $event['utm']['utm_medium'] ?? 'none',
            ]);

            // 4. SMART MERGE (Retroactive 90-day scan)
            $this->retroactiveMerge($container, $identity, $event);
        }

        // 5. Update existing identity if we have new PII
        if ($identity) {
            $this->enrichIdentity($identity, $event, $emailHash, $phoneHash);
        }

        return $identity;
    }

    /**
     * Retroactively find events from the same IP + User Agent within 90 days.
     */
    private function retroactiveMerge(TrackingContainer $container, CustomerIdentity $identity, array $event): void
    {
        $ip = request()->ip();
        $ua = request()->userAgent();
        $thresholdDate = now()->subDays(90);

        // Find anonymous logs with same signature
        $logsToMerge = TrackingEventLog::where('tenant_id', $container->tenant_id)
            ->whereNull('identity_id')
            ->where('source_ip', $ip)
            ->where('user_agent', $ua)
            ->where('processed_at', '>=', $thresholdDate)
            ->get();

        if ($logsToMerge->count() > 0) {
            TrackingEventLog::whereIn('id', $logsToMerge->pluck('id'))
                ->update(['identity_id' => $identity->id]);

            Log::info("CDP: Retroactively merged {$logsToMerge->count()} events for Identity #{$identity->id} via IP+UA Signature.");
            
            // Recalculate metrics
            $this->recalculateLtv($identity);
        }
    }

    /**
     * Update identity stats and segment based on current event.
     */
    private function enrichIdentity(CustomerIdentity $identity, array $event, ?string $emailHash, ?string $phoneHash): void
    {
        $updates = [];
        if ($emailHash && !$identity->email_hash) $updates['email_hash'] = $emailHash;
        if ($phoneHash && !$identity->phone_hash) $updates['phone_hash'] = $phoneHash;

        // Collect metadata
        $ips = $identity->ip_addresses ?? [];
        $currentIp = request()->ip();
        if (!in_array($currentIp, $ips)) {
            $ips[] = $currentIp;
            $updates['ip_addresses'] = $ips;
        }

        // Update LTV on purchase
        if (strtolower($event['event_name'] ?? '') === 'purchase') {
            $value = (float) ($event['custom_data']['value'] ?? 0);
            $identity->increment('order_count');
            $identity->increment('total_spent', $value);
            
            $updates['last_order_at'] = now();
            if (!$identity->first_order_at) $updates['first_order_at'] = now();

            // Segment Threshold Check (Default $1000, but can be container-specific)
            $vipThreshold = 1000; 
            if ($identity->total_spent >= $vipThreshold) {
                $updates['customer_segment'] = 'vip';
            } elseif ($identity->order_count > 1) {
                $updates['customer_segment'] = 'returning';
            }
        }

        if (!empty($updates)) {
            $identity->update($updates);
        }
    }

    private function recalculateLtv(CustomerIdentity $identity): void
    {
        $stats = TrackingEventLog::where('identity_id', $identity->id)
            ->where('event_name', 'purchase')
            ->selectRaw('count(*) as count, sum(JSON_EXTRACT(payload, "$.value")) as total')
            ->first();

        $identity->update([
            'order_count' => $stats->count ?? 0,
            'total_spent' => (float)($stats->total ?? 0),
        ]);
    }
}
