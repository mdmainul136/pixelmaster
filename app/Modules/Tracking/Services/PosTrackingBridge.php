<?php

namespace App\Modules\Tracking\Services;

use App\Models\Tracking\TrackingContainer;
use Illuminate\Support\Facades\Log;

/**
 * POS → GA4 Measurement Protocol Bridge
 *
 * Bridges offline POS sales events to GA4 via Measurement Protocol.
 * Ensures same tenant's Web + POS events appear in the same GA4 property.
 *
 * Event flow:
 *   POS sale → buildPosEvent() → sendPosEvent() → GA4 Measurement Protocol
 *   ↓
 *   Same GA4 property as Web events
 *   ↓
 *   Deduplication via event_id (pos_purchase_{order_id})
 */
class PosTrackingBridge
{
    public function __construct(
        private SgtmProxyService $sgtmProxy,
        private SgtmContainerService $containerService,
        private EventDeduplicationService $dedup
    ) {}

    /**
     * Send a POS event to GA4 via Measurement Protocol.
     *
     * @param array  $orderData  ['id', 'total', 'currency', 'items', 'customer_id', ...]
     * @param string $eventName  GA4 event name (default: 'purchase')
     */
    public function sendPosEvent(array $orderData, string $eventName = 'purchase'): array
    {
        $container = $this->containerService->getPrimaryContainer();
        if (!$container) {
            return ['success' => false, 'error' => 'No active tracking container'];
        }

        $measurementId = $this->containerService->getMeasurementId($container);
        $apiSecret     = $this->containerService->getApiSecret($container);

        if (!$measurementId || !$apiSecret) {
            return ['success' => false, 'error' => 'Measurement ID or API secret not configured'];
        }

        // Build the GA4 event
        $event = $this->buildPosEvent($orderData, $eventName);

        // Deduplication check
        $eventId = $event['params']['event_id'] ?? null;
        if ($eventId && $this->dedup->isDuplicate($eventId)) {
            Log::info("[POS Bridge] Duplicate event skipped: {$eventId}");
            return ['success' => true, 'skipped' => true, 'reason' => 'duplicate'];
        }

        // Generate client_id from customer_id or POS terminal
        $clientId = $this->generatePosClientId($orderData);
        $userId   = $orderData['customer_id'] ?? null;

        // Send via Measurement Protocol
        $result = $this->sgtmProxy->sendMeasurementProtocol(
            $measurementId,
            $apiSecret,
            [$event],
            $clientId,
            $userId
        );

        // Mark as processed for dedup
        if ($eventId && ($result['success'] ?? false)) {
            $this->dedup->markProcessed($eventId, 'pos');
        }

        Log::info("[POS Bridge] Event sent: {$eventName}", [
            'order_id' => $orderData['id'] ?? null,
            'success'  => $result['success'] ?? false,
        ]);

        return $result;
    }

    /**
     * Build a GA4 Measurement Protocol event from POS order data.
     */
    public function buildPosEvent(array $orderData, string $eventName = 'purchase'): array
    {
        $orderId = $orderData['id'] ?? uniqid('pos_');

        $event = [
            'name'   => $eventName,
            'params' => [
                'transaction_id' => (string) $orderId,
                'value'          => (float) ($orderData['total'] ?? 0),
                'currency'       => $orderData['currency'] ?? 'BDT',
                'tax'            => (float) ($orderData['tax'] ?? 0),
                'shipping'       => (float) ($orderData['shipping'] ?? 0),

                // Source identification
                'source'         => 'pos',
                'event_id'       => "pos_{$eventName}_{$orderId}",  // Dedup key

                // POS-specific
                'pos_terminal'   => $orderData['terminal_id'] ?? null,
                'pos_operator'   => $orderData['operator_id'] ?? null,
                'payment_method' => $orderData['payment_method'] ?? 'cash',

                // Custom dimensions
                'store_name'     => $orderData['store_name'] ?? null,
                'store_location' => $orderData['store_location'] ?? null,
            ],
        ];

        // Map order items to GA4 items format
        if (!empty($orderData['items'])) {
            $event['params']['items'] = $this->mapItems($orderData['items']);
        }

        return $event;
    }

    /**
     * Map POS order items to GA4 items format.
     */
    private function mapItems(array $items): array
    {
        return array_map(function ($item) {
            return [
                'item_id'       => (string) ($item['product_id'] ?? $item['id'] ?? ''),
                'item_name'     => $item['name'] ?? 'Unknown',
                'quantity'      => (int) ($item['quantity'] ?? 1),
                'price'         => (float) ($item['price'] ?? 0),
                'item_category' => $item['category'] ?? null,
                'item_variant'  => $item['variant'] ?? null,
                'discount'      => (float) ($item['discount'] ?? 0),
            ];
        }, $items);
    }

    /**
     * Generate client_id for POS events.
     * Uses customer_id if available, otherwise POS terminal ID.
     */
    private function generatePosClientId(array $orderData): string
    {
        if (!empty($orderData['customer_id'])) {
            // Use customer_id hash for cross-device attribution
            return substr(md5('pos_customer_' . $orderData['customer_id']), 0, 10)
                . '.' . time();
        }

        // Fallback: POS terminal-based client ID
        $terminalId = $orderData['terminal_id'] ?? 'default';
        return substr(md5('pos_terminal_' . $terminalId), 0, 10)
            . '.' . time();
    }
}
