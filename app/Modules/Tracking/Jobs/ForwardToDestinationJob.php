<?php

namespace App\Modules\Tracking\Jobs;

use App\Models\Tracking\TrackingDestination;
use App\Modules\Tracking\Services\DestinationService;
use App\Modules\Tracking\Services\FieldMappingService;
use App\Modules\Tracking\Services\RetryQueueService;
use App\Modules\Tracking\Services\Channels\GA4MeasurementProtocolService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * ForwardToDestinationJob
 *
 * Dispatched by ProcessTrackingEventAction for every active destination
 * associated with a tracking container.
 *
 * Pipeline:
 *   1. Load destination record
 *   2. Apply consent filtering (skip if ad_storage / analytics_storage denied)
 *   3. Apply field mappings (destination-specific + container-wide)
 *   4. Apply Power-Ups: phone_formatter, poas
 *   5. Forward to destination channel (Facebook CAPI, TikTok, GA4, etc.)
 *   6. On failure: retry with exponential backoff, then push to DLQ
 *
 * Queue: 'tracking' (high-priority fan-out)
 * Retries: 3 × (30s, 60s, 120s)
 */
class ForwardToDestinationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // ── Retry config ──────────────────────────────────────────────────────────
    public int   $tries   = 3;
    public array $backoff = [30, 60, 120];
    public int   $timeout = 45;

    protected int    $destinationId;
    protected array  $payload;
    protected ?array $containerMappings;
    protected array  $powerUps;
    protected ?array $consentState;   // Phase 2.5 — Consent Mode V2

    /**
     * @param int        $destinationId    ID of the TrackingDestination record
     * @param array      $payload          Enriched event payload
     * @param array|null $containerMappings Container-wide field mappings
     * @param array|null $powerUps         Enabled power-up keys
     * @param array|null $consentState     Consent Mode V2 state:
     *                                     ['analytics_storage' => 'granted'|'denied',
     *                                      'ad_storage'        => 'granted'|'denied']
     */
    public function __construct(
        int     $destinationId,
        array   $payload,
        ?array  $containerMappings = null,
        ?array  $powerUps          = null,
        ?array  $consentState      = null
    ) {
        $this->destinationId    = $destinationId;
        $this->payload          = $payload;
        $this->containerMappings = $containerMappings;
        $this->powerUps          = $powerUps ?? [];
        $this->consentState      = $consentState;
        $this->onQueue('tracking');

        // Apply configurable send delay if destination has delay_minutes set
        $destination = TrackingDestination::find($destinationId);
        if ($destination && ($destination->delay_minutes ?? 0) > 0) {
            $this->delay(now()->addMinutes($destination->delay_minutes));
        }
    }

    /**
     * Execute the job: fan-out to a single destination.
     */
    public function handle(DestinationService $service, FieldMappingService $mappingService): void
    {
        $destination = TrackingDestination::find($this->destinationId);

        if (!$destination || !$destination->is_active) {
            Log::info('[ForwardJob] Destination inactive or deleted, skipping', [
                'destination_id' => $this->destinationId,
            ]);
            return;
        }

        // ── Phase 2.5: Consent Mode V2 Filtering ─────────────────────────────
        if ($this->consentState !== null) {
            $analyticsStorage = $this->consentState['analytics_storage'] ?? 'granted';
            $adStorage        = $this->consentState['ad_storage']        ?? 'granted';

            // GA4 requires analytics_storage consent
            if ($destination->type === 'ga4' && $analyticsStorage !== 'granted') {
                Log::info('[ForwardJob] Skipped GA4 — analytics_storage denied', [
                    'destination_id' => $this->destinationId,
                    'event_id'       => $this->payload['event_id'] ?? null,
                ]);
                return;
            }

            // CAPI/TikTok/Snapchat/Twitter require ad_storage consent
            $adDestinations = ['facebook_capi', 'tiktok', 'snapchat', 'twitter'];
            if (in_array($destination->type, $adDestinations, true) && $adStorage !== 'granted') {
                Log::info("[ForwardJob] Skipped {$destination->type} — ad_storage denied", [
                    'destination_id' => $this->destinationId,
                    'event_id'       => $this->payload['event_id'] ?? null,
                ]);
                return;
            }
        }

        // ── Field mapping ──────────────────────────────────────────────────────
        $mergedMappings = array_merge(
            $destination->mappings        ?? [],
            $this->containerMappings      ?? []
        );
        $finalPayload = $mappingService->applyMappings($this->payload, $mergedMappings);

        // ── Power-Up: Phone E.164 Formatter ───────────────────────────────────
        if (in_array('phone_formatter', $this->powerUps, true)) {
            $finalPayload = $this->formatPhoneNumbers($finalPayload);
        }

        // ── Power-Up: POAS (Profit on Ad Spend) ───────────────────────────────
        if (in_array('poas', $this->powerUps, true)) {
            $finalPayload = $this->calculatePOAS($finalPayload);
        }

        // ── Fan-out to channel ─────────────────────────────────────────────────
        try {
            match ($destination->type) {
                'facebook_capi' => $service->sendToFacebookCapi($finalPayload, $destination->credentials),
                'ga4'           => app(GA4MeasurementProtocolService::class)
                                       ->sendEvent($finalPayload, $destination->credentials),
                'tiktok'        => $service->sendToTikTok($finalPayload, $destination->credentials),
                'snapchat'      => $service->sendToSnapchat($finalPayload, $destination->credentials),
                'twitter'       => $service->sendToTwitter($finalPayload, $destination->credentials),
                'webhook'       => $service->sendToWebhook($finalPayload, $destination->credentials),
                default         => Log::warning("[ForwardJob] Unknown destination type: {$destination->type}"),
            };

            Log::info("[ForwardJob] ✓ Forwarded to {$destination->type}", [
                'destination_id' => $this->destinationId,
                'event_id'       => $this->payload['event_id'] ?? null,
                'attempt'        => $this->attempts(),
            ]);

        } catch (\Throwable $e) {
            Log::warning("[ForwardJob] Failed attempt {$this->attempts()}/{$this->tries} for {$destination->type}", [
                'destination_id' => $this->destinationId,
                'event_id'       => $this->payload['event_id'] ?? null,
                'error'          => $e->getMessage(),
            ]);

            throw $e; // Triggers backoff retry
        }
    }

    /**
     * After all retries have failed → push to DLQ via RetryQueueService.
     */
    public function failed(\Throwable $e): void
    {
        $destination = TrackingDestination::find($this->destinationId);
        $containerId = $destination?->container_id;

        Log::error('[ForwardJob] Permanently failed — pushing to DLQ', [
            'destination_id' => $this->destinationId,
            'destination_type'=> $destination?->type,
            'container_id'   => $containerId,
            'event_id'       => $this->payload['event_id'] ?? null,
            'error'          => $e->getMessage(),
        ]);

        // Push to Dead-Letter Queue for manual review / replay
        if ($containerId) {
            try {
                app(RetryQueueService::class)->enqueue(
                    containerId: $containerId,
                    eventType:   $this->payload['event_name'] ?? 'unknown',
                    payload:     $this->payload,
                    error:       $e->getMessage(),
                    destination: $destination?->type ?? 'unknown',
                );
            } catch (\Throwable $dlqError) {
                Log::critical('[ForwardJob] DLQ enqueue also failed', [
                    'dlq_error' => $dlqError->getMessage(),
                    'event_id'  => $this->payload['event_id'] ?? null,
                ]);
            }
        }
    }

    // ── Private Power-Up helpers ───────────────────────────────────────────────

    /**
     * Format phone numbers to E.164 international standard.
     */
    private function formatPhoneNumbers(array $payload): array
    {
        $phoneFields = ['user_data.ph', 'user_data.phone', 'phone', 'phone_number'];

        foreach ($phoneFields as $field) {
            $value = data_get($payload, $field);
            if ($value && is_string($value)) {
                $cleaned = preg_replace('/[^\d+]/', '', $value);
                if (!str_starts_with($cleaned, '+')) {
                    $cleaned = match (strlen($cleaned)) {
                        10      => '+1' . $cleaned,        // US without country code
                        11      => str_starts_with($cleaned, '1') ? '+' . $cleaned : '+' . $cleaned,
                        default => '+' . $cleaned,
                    };
                }
                data_set($payload, $field, $cleaned);
            }
        }

        return $payload;
    }

    /**
     * Calculate Profit on Ad Spend (POAS).
     * Adjusts conversion value from revenue to profit = revenue - COGS.
     */
    private function calculatePOAS(array $payload): array
    {
        $revenue = $payload['custom_data']['value']         ?? null;
        $cogs    = $payload['custom_data']['cost_of_goods'] ?? null;

        if ($revenue !== null && $cogs !== null) {
            $profit = max(0, (float) $revenue - (float) $cogs);
            $payload['custom_data']['original_value'] = $revenue;
            $payload['custom_data']['value']          = round($profit, 2);
            $payload['custom_data']['poas_adjusted']  = true;
        }

        return $payload;
    }
}
