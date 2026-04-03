<?php

namespace App\Modules\Tracking\Services;

use App\Models\Tracking\TrackingContainer;
use App\Modules\Tracking\DTOs\TrackingEventDTO;
use App\Modules\Tracking\Actions\ProcessTrackingEventAction;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

/**
 * TrackingProxyService
 *
 * Entry-point service called by ProxyController::handle().
 * Normalises the incoming raw request payload into a TrackingEventDTO,
 * guarantees a stable event_id for deduplication, attaches request-tracing
 * metadata, then hands execution to ProcessTrackingEventAction.
 *
 * Responsibilities of THIS service:
 *   - Payload normalisation (snake_case, missing-field fallbacks)
 *   - UUID event_id generation when the sidecar doesn't supply one
 *   - X-Request-ID propagation for cross-service log correlation
 *   - Retry-count header tracking
 *   - Surface-level error boundary (never throws to the controller)
 *
 * Responsibilities delegated to ProcessTrackingEventAction:
 *   - Quota checks
 *   - Consent enforcement
 *   - Deduplication via cache
 *   - Geo/PII enrichment
 *   - Data-filter pipeline
 *   - ForwardToDestinationJob dispatch
 *   - Usage metering
 */
class TrackingProxyService
{
    public function __construct(
        private readonly ProcessTrackingEventAction $action,
        private readonly \App\Modules\Tracking\Services\IdentityResolutionService $identityService
    ) {}

    /**
     * Normalise, enrich, and process an inbound tracking event.
     *
     * @param  TrackingContainer  $container  Authenticated container record
     * @param  array              $data       Raw request body from ProxyController
     * @param  string|null        $requestId  X-Request-ID header value (for tracing)
     * @return array              Structured result: { status, event_id, ... }
     */
    public function processEvent(TrackingContainer $container, array $data, ?string $requestId = null): array
    {
        // ── 1. Ensure stable event_id for deduplication ────────────────────────
        // Hierarchy: client-supplied event_id → transaction_id → generated UUID
        if (empty($data['event_id'])) {
            $data['event_id'] = $data['transaction_id'] 
                ?? $data['order_id'] 
                ?? $data['params']['transaction_id'] 
                ?? $data['params']['order_id'] 
                ?? (string) \Illuminate\Support\Str::uuid();
        }

        // ── 2. Normalise event_name ───────────────────────────────────────────
        // Accept both camelCase and snake_case variants
        if (empty($data['event_name']) && !empty($data['eventName'])) {
            $data['event_name'] = $data['eventName'];
        }
        $data['event_name'] = $data['event_name'] ?? 'unknown';

        // ── 3. Attach request tracing metadata ────────────────────────────────
        // X-Request-ID is propagated from the sidecar so logs can be correlated
        // across: sidecar → NGINX → Laravel → queue worker
        if ($requestId) {
            $data['_request_id'] = $requestId;
        }

        // ── 4. Attach retry count (sidecar sets X-Retry-Count on retries) ─────
        $retryCount = (int) request()->header('X-Retry-Count', 0);
        if ($retryCount > 0) {
            $data['_retry_count'] = $retryCount;
            Log::info('[Tracking] Retried event received', [
                'event_id'    => $data['event_id'],
                'retry_count' => $retryCount,
                'request_id'  => $requestId,
            ]);
        }

        // ── 5. Build DTO ──────────────────────────────────────────────────────
        $dto = TrackingEventDTO::fromRequest(
            $data,
            request()->ip(),
            request()->userAgent()
        );

        // ── 6. Delegate to Action (full pipeline) ─────────────────────────────
        try {
            // ── 6a. Identity Resolution (CDP Stitching) ──────────────────────────
            $this->identityService->resolve($container, $data);

            $result = $this->action->execute($container, $dto);

            // Normalise plain array result to structured response
            if (is_array($result) && !isset($result['status'])) {
                return [
                    'status'     => 'ok',
                    'event_id'   => $data['event_id'],
                    'event_name' => $data['event_name'],
                    'request_id' => $requestId,
                    'payload'    => $result,
                ];
            }

            return array_merge([
                'event_id'   => $data['event_id'],
                'request_id' => $requestId,
            ], (array) $result);

        } catch (\Throwable $e) {
            // Surface-level catch: never let a pipeline failure crash the HTTP response.
            // The sidecar will retry based on non-2xx status.
            Log::error('[Tracking] Pipeline exception in processEvent', [
                'event_id'     => $data['event_id'],
                'container_id' => $container->id,
                'request_id'   => $requestId,
                'error'        => $e->getMessage(),
                'trace'        => $e->getTraceAsString(),
            ]);

            return [
                'status'     => 'error',
                'event_id'   => $data['event_id'],
                'request_id' => $requestId,
                'message'    => 'Internal pipeline error. Event will be retried.',
            ];
        }
    }
}
