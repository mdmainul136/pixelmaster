<?php

namespace App\Modules\Tracking\Integrations\Shopify\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Tracking\Integrations\Shopify\Models\ShopifyShop;
use App\Modules\Tracking\Integrations\Shopify\Services\ShopifyService;
use App\Modules\Tracking\Services\SgtmProxyService;
use App\Modules\Tracking\Services\SgtmContainerService;
use App\Modules\Tracking\Services\EventDeduplicationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * ShopifyWebhookController (Integrations Identity)
 * 
 * Handles all incoming Shopify webhooks (orders, checkouts, refunds, privacy).
 */
class ShopifyWebhookController extends Controller
{
    public function __construct(
        private ShopifyService $shopifyService,
        private SgtmProxyService $sgtm,
        private SgtmContainerService $containerService,
        private EventDeduplicationService $dedup,
        private \App\Modules\Tracking\CatalogueManager\Services\CatalogueService $catalogueService,
    ) {}

    /**
     * Main webhook handler.
     * POST /api/tracking/shopify/webhooks
     */
    public function handle(Request $request)
    {
        // Verify HMAC
        $hmac = $request->header('X-Shopify-Hmac-Sha256', '');
        if (!$this->verifyHmac($request->getContent(), $hmac)) {
            return response()->json(['error' => 'Invalid HMAC'], 401);
        }

        $topic      = $request->header('X-Shopify-Topic');
        $shopDomain = $request->header('X-Shopify-Shop-Domain');
        $payload    = $request->all();

        Log::info('[Shopify Webhook]', ['topic' => $topic, 'shop' => $shopDomain]);

        $shop = ShopifyShop::where('shop_domain', $shopDomain)->first();

        return match ($topic) {
            'orders/create', 'orders/paid' => $this->handleOrder($payload, $shop),
            'orders/updated'               => $this->handleOrderUpdate($payload, $shop),
            'refunds/create'               => $this->handleRefund($payload, $shop),
            'checkouts/create'             => $this->handleCheckout($payload, $shop),
            'products/create', 'products/update' => $this->syncProductFromWebhook($payload, $shop),
            'products/delete'              => $this->deleteProductFromWebhook($payload, $shop),
            'app/uninstalled'              => $this->handleUninstall($shopDomain),
            default                        => response()->json(['status' => 'ignored', 'topic' => $topic]),
        };
    }

    /**
     * Keep the Catalogue Manager in sync when products are updated in Shopify.
     */
    private function syncProductFromWebhook(array $payload, ?ShopifyShop $shop)
    {
        Log::info('[Shopify Webhook] Product Sync', ['id' => $payload['id']]);

        foreach ($payload['variants'] ?? [] as $variant) {
            $this->catalogueService->upsertProduct([
                'sku'            => $variant['sku'] ?: "shopify_{$payload['id']}_{$variant['id']}",
                'name'           => $payload['title'] . ($variant['title'] !== 'Default Title' ? " - {$variant['title']}" : ''),
                'slug'           => $payload['handle'],
                'category'       => $payload['product_type'] ?? null,
                'price'          => (float) ($variant['price'] ?? 0),
                'sale_price'     => (float) ($variant['compare_at_price'] ?? null),
                'stock_quantity' => (int) ($variant['inventory_quantity'] ?? 0),
                'image_url'      => $payload['image']['src'] ?? null,
                'is_active'      => $payload['status'] === 'active',
                'source'         => 'shopify',
                'metadata'       => ['shopify_id' => $payload['id'], 'variant_id' => $variant['id']],
            ]);
        }

        return response()->json(['status' => 'synced']);
    }

    /**
     * Remove products from Catalogue Manager when deleted in Shopify.
     */
    private function deleteProductFromWebhook(array $payload, ?ShopifyShop $shop)
    {
        Log::info('[Shopify Webhook] Product Delete', ['id' => $payload['id']]);

        $this->catalogueService->deleteProductsBySkuPrefix("shopify_{$payload['id']}");

        return response()->json(['status' => 'deleted']);
    }

    private function handleOrder(array $payload, ?ShopifyShop $shop)
    {
        $orderId = $payload['order_number'] ?? $payload['id'] ?? 'unknown';
        $eventId = (string) $orderId; // Standardized to raw ID for better deduplication

        if ($this->dedup->isDuplicate($eventId)) {
            return response()->json(['status' => 'duplicate', 'event_id' => $eventId]);
        }

        $items = $this->extractLineItems($payload);

        $event = [
            'name'   => 'purchase',
            'params' => [
                'transaction_id' => (string) $orderId,
                'value'          => (float) ($payload['total_price'] ?? 0),
                'tax'            => (float) ($payload['total_tax'] ?? 0),
                'shipping'       => $this->extractShipping($payload),
                'currency'       => $payload['currency'] ?? 'USD',
                'coupon'         => $this->extractCoupon($payload),
                'items'          => $items,
                'event_id'       => $eventId,
                '_source'        => 'shopify_webhook',
                'user_data'      => $this->extractUserData($payload),
                'new_customer'   => $payload['buyer_accepts_marketing'] ?? false,
            ],
        ];

        return $this->forwardEvent($event, $shop, $payload);
    }

    private function handleOrderUpdate(array $payload, ?ShopifyShop $shop)
    {
        $financialStatus = $payload['financial_status'] ?? '';
        if ($financialStatus !== 'paid') {
            return response()->json(['status' => 'ignored', 'reason' => 'not_paid']);
        }
        return $this->handleOrder($payload, $shop);
    }

    private function handleRefund(array $payload, ?ShopifyShop $shop)
    {
        $refundId = $payload['id'] ?? 'unknown';
        $orderId  = $payload['order_id'] ?? 'unknown';
        $eventId  = (string) $refundId;

        if ($this->dedup->isDuplicate($eventId)) {
            return response()->json(['status' => 'duplicate']);
        }

        $refundAmount = 0;
        $refundItems  = [];
        foreach ($payload['refund_line_items'] ?? [] as $refundItem) {
            $lineItem = $refundItem['line_item'] ?? [];
            $refundAmount += (float) ($refundItem['subtotal'] ?? 0);
            $refundItems[] = [
                'item_id'   => $lineItem['sku'] ?? (string) ($lineItem['product_id'] ?? ''),
                'item_name' => $lineItem['title'] ?? '',
                'price'     => (float) ($lineItem['price'] ?? 0),
                'quantity'  => $refundItem['quantity'] ?? 1,
            ];
        }

        $event = [
            'name'   => 'refund',
            'params' => [
                'transaction_id' => (string) $orderId,
                'value'          => $refundAmount,
                'currency'       => $payload['currency'] ?? 'USD',
                'items'          => $refundItems,
                'event_id'       => $eventId,
                '_source'        => 'shopify_webhook',
            ],
        ];

        return $this->forwardEvent($event, $shop, $payload);
    }

    private function handleCheckout(array $payload, ?ShopifyShop $shop)
    {
        $checkoutId = $payload['id'] ?? $payload['token'] ?? 'unknown';
        $eventId    = (string) $checkoutId;

        $event = [
            'name'   => 'begin_checkout',
            'params' => [
                'value'    => (float) ($payload['total_price'] ?? 0),
                'currency' => $payload['currency'] ?? 'USD',
                'items'    => $this->extractLineItems($payload),
                'event_id' => $eventId,
                '_source'  => 'shopify_webhook',
            ],
        ];

        return $this->forwardEvent($event, $shop, $payload);
    }

    private function handleUninstall(?ShopifyShop $shop)
    {
        if ($shop) {
            $shop->markUninstalled();
        }
        return response()->json(['status' => 'uninstalled']);
    }

    private function forwardEvent(array $event, ?ShopifyShop $shop, array $payload)
    {
        $container = $shop?->container ?? $this->containerService->getPrimaryContainer();
        if (!$container) return response()->json(['error' => 'No container'], 404);

        $measurementId = $shop?->getMeasurementId() ?? $this->containerService->getMeasurementId($container);
        $apiSecret     = $this->containerService->getApiSecret($container);

        $clientId = $this->resolveClientId($payload);
        $userId   = isset($payload['customer']['id']) ? (string) $payload['customer']['id'] : null;

        $result = $this->sgtm->sendMeasurementProtocol(
            $measurementId, $apiSecret, [$event], $clientId, $userId
        );

        $this->dedup->markProcessed($event['params']['event_id'] ?? '');

        return response()->json([
            'success'  => $result['success'] ?? false,
            'event_id' => $event['params']['event_id'] ?? null,
        ]);
    }

    private function extractLineItems(array $payload): array
    {
        $items = [];
        foreach ($payload['line_items'] ?? [] as $item) {
            $items[] = [
                'item_id'       => $item['sku'] ?: (string) ($item['product_id'] ?? ''),
                'item_name'     => $item['title'] ?? '',
                'price'         => (float) ($item['price'] ?? 0),
                'quantity'      => (int) ($item['quantity'] ?? 1),
                'item_variant'  => $item['variant_title'] ?? '',
                'item_brand'    => $item['vendor'] ?? '',
            ];
        }
        return $items;
    }

    private function extractShipping(array $payload): float
    {
        return (float) ($payload['total_shipping_price_set']['shop_money']['amount']
            ?? $payload['shipping_lines'][0]['price'] ?? 0);
    }

    private function extractCoupon(array $payload): ?string
    {
        $codes = array_column($payload['discount_codes'] ?? [], 'code');
        return !empty($codes) ? implode(',', $codes) : null;
    }

    private function extractUserData(array $payload): array
    {
        $billing = $payload['billing_address'] ?? $payload['shipping_address'] ?? [];
        return [
            'sha256_email_address' => isset($payload['email']) ? hash('sha256', strtolower(trim($payload['email']))) : null,
            'address' => [
                'first_name'  => $billing['first_name'] ?? '',
                'last_name'   => $billing['last_name'] ?? '',
                'city'        => $billing['city'] ?? '',
                'country'     => $billing['country_code'] ?? '',
            ],
        ];
    }

    private function resolveClientId(array $payload): string
    {
        foreach ($payload['note_attributes'] ?? [] as $attr) {
            if ($attr['name'] === '_pm_client_id' && !empty($attr['value'])) {
                return $attr['value'];
            }
        }
        return time() . '.' . rand(100000000, 999999999);
    }

    private function verifyHmac(string $data, string $hmac): bool
    {
        $secret = config('services.shopify.webhook_secret', '');
        if (!$secret) return true; // Allow in dev
        $calculatedHmac = base64_encode(hash_hmac('sha256', $data, $secret, true));
        return hash_equals($calculatedHmac, $hmac);
    }

    /**
     * Handle Shopify privacy compliance webhooks.
     * POST /api/tracking/shopify/privacy
     */
    public function privacy(Request $request)
    {
        $hmac = $request->header('X-Shopify-Hmac-Sha256', '');
        if (!$this->verifyHmac($request->getContent(), $hmac)) {
            return response()->json(['error' => 'Invalid HMAC'], 401);
        }
        return response()->json(['status' => 'acknowledged']);
    }
}
