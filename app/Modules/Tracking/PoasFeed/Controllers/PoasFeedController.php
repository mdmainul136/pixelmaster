<?php

namespace App\Modules\Tracking\PoasFeed\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Tracking\CatalogueManager\Models\Product;
use App\Models\Tracking\TrackingContainer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Cache;

/**
 * PoasFeedController (POAS Feed Identity)
 * 
 * Generates dynamic Profit On Ad Spend (POAS) data feeds.
 */
class PoasFeedController extends Controller
{
    /**
     * Generate the POAS XML Feed for a specific container.
     * GET /tracking/feeds/poas/{containerId}
     */
    public function generate(Request $request, string $containerId)
    {
        $container = TrackingContainer::where('container_id', $containerId)->firstOrFail();

        // ── Cache Logic (1 Hour TTL) ──────────────────────────────────────────
        // Include tenant_id in cache key to prevent cross-tenant cache pollution
        $tenantId = $container->tenant_id;
        $cacheKey = "tracking:poas:feed:{$tenantId}:{$containerId}";

        $xmlContent = Cache::remember($cacheKey, 3600, function () use ($container, $tenantId) {
            // Scope products to this container's tenant to prevent cross-tenant data leaks
            $products = Product::where('is_active', true)
                ->where('price', '>', 0)
                ->when($tenantId, fn($q) => $q->where('tenant_id', $tenantId))
                ->get();

            $xml = new \SimpleXMLElement('<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0" xmlns:pixelmaster="https://pixelmaster.net/poas"/>');
            $channel = $xml->addChild('channel');
            $channel->addChild('title', "PixelMaster POAS Feed - {$container->name}");
            $channel->addChild('link', url()->to('/'));
            $channel->addChild('description', "Dynamic Profit on Ad Spend margins for server-side optimization.");
            $channel->addChild('lastBuildDate', now()->toRfc2822String());

            foreach ($products as $product) {
                $item = $channel->addChild('item');

                // Google Merchant Standard Fields
                $item->addChild('id', $product->sku, 'http://base.google.com/ns/1.0');
                $item->addChild('title', htmlspecialchars($product->name));
                $item->addChild('link', url()->to("/products/{$product->slug}"));
                $item->addChild('price', "{$product->price} " . ($container->settings['currency'] ?? 'USD'), 'http://base.google.com/ns/1.0');
                $item->addChild('availability', $product->availability, 'http://base.google.com/ns/1.0');

                if ($product->image_url) {
                    $item->addChild('image_link', $product->image_url, 'http://base.google.com/ns/1.0');
                }

                // PixelMaster POAS Fields (Namespaced)
                // margin = gross margin PERCENTAGE (e.g., 42.5 = 42.5%)
                // profit = absolute profit per unit in store currency
                $absoluteProfit = $product->price - $product->cost;
                $marginPercent  = $product->price > 0
                    ? round(($absoluteProfit / $product->price) * 100, 2)
                    : 0;

                $item->addChild('margin', $marginPercent, 'https://pixelmaster.net/poas');
                $item->addChild('profit', $absoluteProfit, 'https://pixelmaster.net/poas');
                $item->addChild('cost_of_goods', $product->cost, 'https://pixelmaster.net/poas');
                $item->addChild('currency', $container->settings['currency'] ?? 'USD', 'https://pixelmaster.net/poas');
                $item->addChild('updated_at', $product->updated_at->toRfc3339String(), 'https://pixelmaster.net/poas');
            }

            return $xml->asXML();
        });

        return Response::make($xmlContent, 200, [
            'Content-Type'  => 'application/xml',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
