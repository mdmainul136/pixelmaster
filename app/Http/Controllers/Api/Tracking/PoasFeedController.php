<?php

namespace App\Http\Controllers\Api\Tracking;

use App\Http\Controllers\Controller;
use App\Models\Tracking\TrackingContainer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * PoasFeedController
 * 
 * Proxied securely via the Node.js Sidecar (poas_data_feed powerup).
 * This endpoint calculates Profit On Ad Spend per container if they
 * have their product margins registered in the PixelMaster catalog.
 */
class PoasFeedController extends Controller
{
    /**
     * Generate the Profit On Ad Spend XML feed.
     */
    public function generate(Request $request, string $containerId)
    {
        $container = TrackingContainer::where('container_id', $containerId)->firstOrFail();

        // 1. Authorization: Only the Sidecar cluster or a valid UI auth can hit this Endpoint
        $secret = $request->header('X-Container-Secret');
        if ($secret !== ($container->settings['x_container_secret'] ?? '')) {
            return response()->json(['error' => 'Unauthorized POAS feed request'], 401);
        }

        // 2. Mock Margin Calculator (To be connected to E-commerce Catalog syncing)
        // Since we don't have the Tenant's Product Catalog DB yet, we mock a feed
        // that assigns arbitrary profit margins to items to show the Sidecar logic operating
        
        $products = [
            ['id' => 'SKU-001', 'margin' => 45.50, 'currency' => 'USD', 'in_stock' => true],
            ['id' => 'SKU-002', 'margin' => 12.00, 'currency' => 'USD', 'in_stock' => false],
            ['id' => 'SKU-003', 'margin' => 99.99, 'currency' => 'USD', 'in_stock' => true],
        ];

        // 3. Generate Valid Google/Meta XML Feed Format
        $xml = new \SimpleXMLElement('<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0"></rss>');
        $channel = $xml->addChild('channel');
        $channel->addChild('title', "POAS Margin Feed - {$container->container_id}");
        $channel->addChild('description', 'Live Profit On Ad Spend Data computed by PixelMaster.');

        foreach ($products as $product) {
            $item = $channel->addChild('item');
            $item->addChild('g:id', $product['id'], 'http://base.google.com/ns/1.0');
            $item->addChild('g:custom_label_0', "margin_{$product['margin']}", 'http://base.google.com/ns/1.0');
            $item->addChild('g:availability', $product['in_stock'] ? 'in stock' : 'out of stock', 'http://base.google.com/ns/1.0');
        }

        return response($xml->asXML(), 200)
            ->header('Content-Type', 'text/xml');
    }
}
