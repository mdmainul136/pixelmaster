<?php

namespace App\Modules\Tracking\Actions;

use App\Models\Tracking\TrackingContainer;
use App\Modules\Tracking\DTOs\TrackingEventDTO;
use App\Modules\Tracking\Jobs\ProcessTrackingEventJob;
use App\Modules\Tracking\Services\BillingAlertService;
use App\Modules\Tracking\Services\DestinationService;
use App\Modules\Tracking\Services\EventEnrichmentService;
use App\Modules\Tracking\Services\PowerUpService;
use App\Modules\Tracking\Services\TrackingUsageService;
use App\Modules\Tracking\Services\DataFilterService;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;

/**
 * ProcessTrackingEventAction
 *
 * Full 7-step proxy pipeline:
 *
 *  1. Auth    - handled upstream in ProxyController (X-Container-Secret)
 *  2. Consent - dropped if consent=false when consent_mode power-up is on
 *  3. Dedup   - dropped if event_id seen in Redis within 24h
 *  4. Enrich  - geo + device + UTM + click-ids via EventEnrichmentService
 *  5. Fan-out - DestinationService::fanOut(container, enriched)
 *  6. Meter   - TrackingUsageService::incrementHit() + sampled billing alert
 *  7. Return  - { status, event_id, _destinations, _power_ups }
 */
class ProcessTrackingEventAction
{
    public function __construct(
        private PowerUpService         $powerUps,
        private TrackingUsageService   $usage,
        private DataFilterService      $dataFilter,
        private EventEnrichmentService $enrichment,
        private DestinationService     $destinations,
        private BillingAlertService    $billingAlert,
    ) {}

    public function execute(TrackingContainer $container, TrackingEventDTO $dto): array
    {
        $eventId  = $dto->eventId;
        $powerUps = array_keys(array_filter($container->power_ups ?? []));
        $settings = $container->settings['tracking'] ?? [];

        // ── 0. High-Scale Tuning: Cache container state ──────────────────────
        $cacheKey = "tracking:container:{$container->id}:meta";
        $meta = Redis::get($cacheKey);

        if (!$meta) {
            $meta = [
                'is_active'   => (bool) ($container->is_active ?? true),
                'tier'        => $container->settings['tier']    ?? 'basic',
                'sgtm_enabled' => (bool) ($settings['sgtm_enabled'] ?? true),
                'rate_limit'  => (int) ($settings['rate_limit_per_tenant'] ?? 1000),
            ];
            Redis::setex($cacheKey, 60, json_encode($meta)); // Cache for 60s
        } else {
            $meta = json_decode($meta, true);
        }

        // Apply cached meta checks
        $tier = $meta['tier'];

        if (!$meta['is_active'] || !$meta['sgtm_enabled']) {
            $this->usage->recordEvent($container->id, 'dropped');
            return $this->response('error', $eventId, 'container_inactive', [], $powerUps);
        }

        // Monthly quota check (Using cached tier)
        if ($this->usage->hasReachedLimit($container->id, $tier)) {
            $this->usage->recordEvent($container->id, 'dropped');
            return $this->response('error', $eventId, 'quota_exceeded', [], $powerUps);
        }

        // Per-tenant Rate Limiting (Using cached limit)
        $limit = $meta['rate_limit'];
        $redisKey = "tracking:ratelimit:{$container->id}:" . date('YmdHi');
        $current = Redis::incr($redisKey);
        if ($current === 1) Redis::expire($redisKey, 60);

        if ($current > $limit) {
            $this->usage->recordEvent($container->id, 'dropped');
            return $this->response('error', $eventId, 'rate_limit_exceeded', [], $powerUps);
        }

        $this->usage->recordEvent($container->id, 'received');

        // Step 2: Consent
        if ($this->powerUps->isEnabled($container, 'consent_mode') && $dto->consent === false) {
            $this->usage->recordEvent($container->id, 'dropped');
            return $this->response('dropped', $eventId, 'no_consent', [], $powerUps);
        }

        // Step 3: Deduplication (Redis 24h TTL)
        if ($eventId && $this->powerUps->isEnabled($container, 'dedupe')) {
            $redisKey = "tracking:dedup:{$container->id}:{$eventId}";
            if (Redis::exists($redisKey)) {
                $this->usage->recordEvent($container->id, 'dropped');
                return $this->response('duplicate', $eventId, 'already_processed', [], $powerUps);
            }
        }

        // Step 4: Enrichment
        // Note: PII hashing and Bot filtering are now handled inside DataFilterService::applyFilters
        $payload = $dto->payload;

        // Full enrichment pipeline: geo + device + UTM + click-ids + session
        $enriched = $this->enrichment->enrich($payload);

        // Add context for data filter (UA, IP)
        $enriched['user_agent'] = $dto->userAgent;
        $enriched['source_ip']  = $dto->sourceIp;

        // ── 4b. Step 4b: Profit & Margin Injection (POAS) ────────────────────
        if (in_array(strtolower($dto->eventName), ['purchase', 'purchase_event'])) {
            $totalProfit = 0;
            $items = $enriched['items'] ?? $enriched['contents'] ?? [];
            
            if (!empty($items)) {
                $skus = array_column($items, 'item_id');
                if (empty($skus)) {
                    $skus = array_column($items, 'sku');
                }

                if (!empty($skus)) {
                    $productCosts = \App\Modules\Tracking\CatalogueManager\Models\Product::whereIn('sku', $skus)
                        ->get(['sku', 'cost', 'price'])
                        ->keyBy('sku');

                    foreach ($items as &$item) {
                        $sku = $item['item_id'] ?? $item['sku'] ?? null;
                        if ($sku && isset($productCosts[$sku])) {
                            $cost = (float) $productCosts[$sku]->cost;
                            $price = (float) ($item['price'] ?? $productCosts[$sku]->price);
                            $margin = $price - $cost;
                            $item['pixelmaster_margin'] = $margin;
                            $item['pixelmaster_profit'] = $margin * ($item['quantity'] ?? 1);
                            $totalProfit += $item['pixelmaster_profit'];
                        }
                    }
                    $enriched['pixelmaster_total_profit'] = $totalProfit;
                    $enriched['pixelmaster_total_margin'] = $totalProfit; // Net margin for the order
                }
            }
        }

        // Data filter pipeline (Handles: Bot Filter, PII Hash, IP Anonymization, Field Stripping)
        $filterConfig = $container->settings['data_filters'] ?? [];
        
        // Map UI Power-Ups to internal data filters
        $filterConfig['anonymize_ip'] = $this->powerUps->isEnabled($container, 'anonymizer');
        $filterConfig['bot_detection'] = $this->powerUps->isEnabled($container, 'bot_detection');
        if ($this->powerUps->isEnabled($container, 'block_request_by_ip')) {
            $filterConfig['ip_blocking'] = true;
            $filterConfig['blocked_ips'] = $container->settings['blocked_ips'] ?? [];
        }

        if (!empty($filterConfig)) {
            $enriched = $this->dataFilter->applyFilters($enriched, $filterConfig);
            if ($enriched === null) {
                $this->usage->recordEvent($container->id, 'dropped');
                return $this->response('dropped', $eventId, 'filtered_or_bot', [], $powerUps);
            }
        }

        // Persist event async — MySQL + ClickHouse via ProcessTrackingEventJob
        // PROVEN: Shared sGTM Worker Pod (500m CPU / 1Gi RAM) supports 250-400 events/sec.
        // Test Mode Check: Skip storage and fan-out if test_mode is on
        $isTest = $settings['test_mode'] ?? false;

        if (!$isTest && ($container->settings['data_filters']['store_events'] ?? true)) {
            $queueName = config("tracking.tiers.{$tier}.queue_pool", 'tracking-logs');
            
            ProcessTrackingEventJob::dispatch([
                'container_id'  => $container->id,
                'tenant_id'     => $container->tenant_id ?? 0,
                'event_type'    => $dto->eventName,
                'source_ip'     => $dto->sourceIp,
                'user_agent'    => $dto->userAgent,
                'payload'       => $enriched,
                '_request_id'   => $enriched['_request_id'] ?? null,
                '_retry_count'  => $enriched['_retry_count'] ?? 0,
                '_dispatched_at' => microtime(true),
            ])->onQueue($queueName);
        }

        // Step 5: Fan-out to all destinations
        $destResults = $isTest ? [] : $this->destinations->fanOut($container, $enriched);

        // Meter forwarded events
        foreach ($destResults as $result) {
            if ($result['success'] ?? false) {
                $this->usage->recordEvent($container->id, 'forwarded');
            }
        }

        // Step 6: Meter — increment hit counter
        $this->usage->incrementHit($container->id);

        // Billing alert — sampled 1-in-50 for near-real-time threshold detection.
        // Daily cron is the primary alert mechanism; this is the fast-path early-warning check.
        if (mt_rand(1, 50) === 1) {
            try {
                $this->billingAlert->checkAndAlert($container);
            } catch (\Throwable $e) {
                // Non-fatal: billing alert failure never blocks event processing
                Log::warning('[BillingAlert] Sampled check failed', [
                    'container_id' => $container->id,
                    'error'        => $e->getMessage(),
                ]);
            }
        }

        // Step 3b: Store dedup key in Redis AFTER successful processing
        if ($eventId && $this->powerUps->isEnabled($container, 'dedupe')) {
            Redis::setex("tracking:dedup:{$container->id}:{$eventId}", 86400, 1);
        }

        // Step 7: Structured response
        return $this->response('ok', $eventId, null, $destResults, $powerUps);
    }

    // Private helpers

    private function response(
        string  $status,
        ?string $eventId,
        ?string $reason,
        array   $destinations,
        array   $powerUps
    ): array {
        $out = [
            'status'        => $status,
            'event_id'      => $eventId,
            '_destinations' => $destinations,
            '_power_ups'    => $powerUps,
        ];

        if ($reason) {
            $out['reason'] = $reason;
        }

        return $out;
    }

    // response() method remains here
}
