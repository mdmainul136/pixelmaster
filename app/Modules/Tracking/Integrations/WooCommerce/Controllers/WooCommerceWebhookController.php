<?php

namespace App\Modules\Tracking\Integrations\WooCommerce\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Tracking\Services\SgtmProxyService;
use App\Modules\Tracking\Services\SgtmContainerService;
use App\Modules\Tracking\Services\EventDeduplicationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * WooCommerceWebhookController (Integrations Identity)
 * 
 * Handles incoming webhooks from WooCommerce stores.
 */
class WooCommerceWebhookController extends Controller
{
    public function __construct(
        private SgtmProxyService $sgtm,
        private SgtmContainerService $containerService,
        private EventDeduplicationService $dedup,
        private \App\Modules\Tracking\CatalogueManager\Services\CatalogueService $catalogueService,
    ) {}

    /**
     * Handle WooCommerce webhook.
     * POST /api/tracking/woocommerce/webhooks
     */
    public function handle(Request $request)
    {
        // Verify HMAC
        $hmac = $request->header('X-WC-Webhook-Signature', '');
        if (!$this->verifyHmac($request->getContent(), $hmac)) {
            return response()->json(['error' => 'Invalid HMAC'], 401);
        }

        $topic = $request->header('X-WC-Webhook-Topic', '');
        $payload = $request->all();

        Log::info('[WooCommerce Webhook]', ['topic' => $topic]);

        // Route based on topic
        if (str_starts_with($topic, 'product.')) {
            return $this->syncProductFromWebhook($topic, $payload);
        }

        if (!in_array($topic, ['order.completed', 'order.created', 'order.refunded'])) {
            return response()->json(['status' => 'ignored']);
        }

        $orderId = $payload['id'] ?? $payload['order_number'] ?? 'unknown';
        $eventName = $topic === 'order.refunded' ? 'refund' : 'purchase';
        $eventId = (string) $orderId;

        if ($this->dedup->isDuplicate($eventId)) {
            return response()->json(['status' => 'duplicate', 'event_id' => $eventId]);
        }

        $items = [];
        foreach ($payload['line_items'] ?? [] as $item) {
            $items[] = [
                'item_id'   => $item['sku'] ?: (string) $item['product_id'],
                'item_name' => $item['name'],
                'price'     => (float) $item['price'],
                'quantity'  => (int) $item['quantity'],
            ];
        }

        $event = [
            'name'   => $eventName,
            'params' => [
                'transaction_id' => (string) $orderId,
                'value'          => (float) ($payload['total'] ?? 0),
                'tax'            => (float) ($payload['total_tax'] ?? 0),
                'shipping'       => (float) ($payload['shipping_total'] ?? 0),
                'currency'       => $payload['currency'] ?? 'USD',
                'items'          => $items,
                'event_id'       => (string) $orderId,
                '_source'        => 'woocommerce_webhook',
            ],
        ];

        return $this->forwardToSgtm($event, $payload);
    }

    private function forwardToSgtm(array $event, array $payload)
    {
        $container = $this->containerService->getPrimaryContainer();
        if (!$container) return response()->json(['error' => 'No container'], 404);

        $measurementId = $this->containerService->getMeasurementId($container);
        $apiSecret = $this->containerService->getApiSecret($container);

        $clientId = $payload['client_id'] ?? time() . '.' . rand(100000000, 999999999);
        $userId   = $payload['customer']['id'] ?? $payload['user_id'] ?? null;

        $result = $this->sgtm->sendMeasurementProtocol(
            $measurementId, $apiSecret, [$event], $clientId, $userId ? (string) $userId : null
        );

        $this->dedup->markProcessed($event['params']['event_id'] ?? '');

        return response()->json([
            'success'  => $result['success'] ?? false,
            'event_id' => $event['params']['event_id'] ?? null,
        ]);
    }

    /**
     * Keep the Catalogue Manager in sync with WooCommerce products.
     */
    private function syncProductFromWebhook(string $topic, array $payload)
    {
        if ($topic === 'product.deleted') {
            $this->catalogueService->deleteProductBySku($payload['sku'] ?: "wc_{$payload['id']}");
            return response()->json(['status' => 'deleted']);
        }

        $this->catalogueService->upsertProduct([
            'sku'            => $payload['sku'] ?: "wc_{$payload['id']}",
            'name'           => $payload['name'],
            'slug'           => $payload['slug'] ?? null,
            'description'    => $payload['description'] ?? null,
            'category'       => $payload['categories'][0]['name'] ?? null,
            'price'          => (float) ($payload['regular_price'] ?? 0),
            'sale_price'     => (float) ($payload['sale_price'] ?? null),
            'stock_quantity' => (int) ($payload['stock_quantity'] ?? 0),
            'image_url'      => $payload['images'][0]['src'] ?? null,
            'is_active'      => $payload['status'] === 'publish',
            'source'         => 'woocommerce',
            'metadata'       => ['wc_id' => $payload['id']],
        ]);

        return response()->json(['status' => 'synced']);
    }

    private function verifyHmac(string $data, string $hmac): bool
    {
        $secret = config('services.woocommerce.webhook_secret', '');
        if (!$secret) return true; // Allow for dev
        $calculatedHmac = base64_encode(hash_hmac('sha256', $data, $secret, true));
        return hash_equals($calculatedHmac, $hmac);
    }
}
