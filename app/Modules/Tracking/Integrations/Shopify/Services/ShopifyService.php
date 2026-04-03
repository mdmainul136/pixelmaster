<?php

namespace App\Modules\Tracking\Integrations\Shopify\Services;

use App\Modules\Tracking\Integrations\Shopify\Models\ShopifyShop;
use App\Modules\Tracking\CatalogueManager\Services\CatalogueService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ShopifyService (Integrations Identity)
 * 
 * Handles all Shopify API interactions and product catalog synchronization.
 */
class ShopifyService
{
    public function __construct(
        private CatalogueService $catalogueService
    ) {}

    /**
     * Perform a Shopify Admin API call.
     */
    public function api(ShopifyShop $shop, string $method, string $path, array $data = [])
    {
        $url = "https://{$shop->shop_domain}{$path}";
        $response = Http::withHeaders([
            'X-Shopify-Access-Token' => $shop->access_token,
        ])->$method($url, $data);

        if (!$response->successful()) {
            Log::error("[Shopify] API Error", [
                'shop'    => $shop->shop_domain,
                'method'  => $method,
                'path'    => $path,
                'status'  => $response->status(),
                'body'    => $response->body()
            ]);
        }

        return $response;
    }

    /**
     * Install the PixelMaster tracking script.
     */
    public function installScript(ShopifyShop $shop): bool
    {
        $transportUrl = $shop->getTransportUrl();
        if (!$transportUrl) return false;

        $targetUrl = "{$transportUrl}/sdk/v1/pixelmaster.min.js";

        // Check for existing script tags
        $existing = $this->api($shop, 'GET', '/admin/api/2024-01/script_tags.json');
        if ($existing->successful()) {
            foreach ($existing->json('script_tags') as $st) {
                if ($st['src'] === $targetUrl) return true;
            }
        }

        $response = $this->api($shop, 'POST', '/admin/api/2024-01/script_tags.json', [
            'script_tag' => [
                'event' => 'onload',
                'src'   => $targetUrl,
            ]
        ]);

        if ($response->successful()) {
            $shop->update([
                'script_installed' => true,
                'script_tag_id'    => $response->json('script_tag.id')
            ]);
            return true;
        }

        return false;
    }

    /**
     * Register required webhooks.
     */
    public function registerWebhooks(ShopifyShop $shop): bool
    {
        $baseUrl = config('app.url');
        $webhookUrl = "{$baseUrl}/api/tracking/shopify/webhooks";

        $topics = [
            'orders/create',
            'orders/paid',
            'checkouts/create',
            'refunds/create',
            'app/uninstalled',
            'products/create',
            'products/update',
            'products/delete'
        ];

        foreach ($topics as $topic) {
            $this->api($shop, 'POST', '/admin/api/2024-01/webhooks.json', [
                'webhook' => [
                    'topic'    => $topic,
                    'address'  => $webhookUrl,
                    'format'   => 'json',
                ]
            ]);
        }

        $shop->update(['webhooks_registered' => true]);
        return true;
    }

    /**
     * Fetch and synchronize the full Shopify product catalog into the local ec_products table.
     */
    public function syncProducts(ShopifyShop $shop): array
    {
        Log::info('[Shopify] Starting manual product catalog sync', ['shop' => $shop->shop_domain]);

        $allProducts = [];
        $nextPageUrl = '/admin/api/2024-01/products.json?limit=250';

        // Paginated fetching
        while ($nextPageUrl) {
            $response = $this->api($shop, 'GET', $nextPageUrl);
            
            if (!$response->successful()) break;

            $allProducts = array_merge($allProducts, $response->json('products') ?? []);
            
            // Handle Link header for pagination
            $nextPageUrl = null;
            $linkHeader = $response->header('Link');
            if ($linkHeader && preg_match('/<([^>]+)>;\s*rel="next"/', $linkHeader, $matches)) {
                $fullUrl = $matches[1];
                $nextPageUrl = str_replace("https://{$shop->shop_domain}", '', $fullUrl);
            }
        }

        $syncedCount = 0;
        // Process all variants for each product and upsert into local database
        foreach ($allProducts as $sp) {
            foreach ($sp['variants'] ?? [] as $variant) {
                try {
                    $this->catalogueService->upsertProduct([
                        'sku'            => $variant['sku'] ?: "shopify_{$sp['id']}_{$variant['id']}",
                        'name'           => $sp['title'] . ($variant['title'] !== 'Default Title' ? " — {$variant['title']}" : ''),
                        'slug'           => $sp['handle'],
                        'description'    => $sp['body_html'] ?? null,
                        'category'       => $sp['product_type'] ?? null,
                        'price'          => (float) ($variant['price'] ?? 0),
                        'sale_price'     => (float) ($variant['compare_at_price'] ?? null),
                        'cost'           => 0, // Requires read_inventory scope for cost data
                        'stock_quantity' => (int) ($variant['inventory_quantity'] ?? 0),
                        'image_url'      => $sp['image']['src'] ?? null,
                        'is_active'      => $sp['status'] === 'active',
                        'source'         => 'shopify',
                        'metadata'       => ['shopify_id' => $sp['id'], 'variant_id' => $variant['id']],
                    ]);
                    $syncedCount++;
                } catch (\Exception $e) {
                    Log::error("[Shopify][Sync] Failed to upsert variant {$variant['id']} of product {$sp['id']}: " . $e->getMessage());
                }
            }
        }

        return [
            'success' => true,
            'count'   => $syncedCount
        ];
    }

    /**
     * Push tracking configuration to Shopify metafields.
     */
    public function pushConfigToMetafields(ShopifyShop $shop): bool
    {
        $metafields = [
            ['namespace' => 'pixelmaster', 'key' => 'transport_url',   'value' => $shop->getTransportUrl() ?? '', 'type' => 'single_line_text_field'],
            ['namespace' => 'pixelmaster', 'key' => 'measurement_id',  'value' => $shop->getMeasurementId() ?? '', 'type' => 'single_line_text_field'],
            ['namespace' => 'pixelmaster', 'key' => 'container_id',    'value' => $shop->getContainerId() ?? '', 'type' => 'single_line_text_field'],
        ];

        $allSuccess = true;
        foreach ($metafields as $mf) {
            $response = $this->api($shop, 'POST', '/admin/api/2024-01/metafields.json', [
                'metafield' => $mf,
            ]);

            if (!$response->successful() && !str_contains($response->body(), 'already exists')) {
                $allSuccess = false;
            }
        }

        return $allSuccess;
    }

    /**
     * Complete setup: install scripts, register webhooks, push metafields.
     */
    public function completeSetup(ShopifyShop $shop): array
    {
        return [
            'scripts'   => $this->installScript($shop),
            'webhooks'  => $this->registerWebhooks($shop),
            'metafields'=> $this->pushConfigToMetafields($shop),
        ];
    }
}
