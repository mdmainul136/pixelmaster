<?php

namespace App\Modules\Tracking\CatalogueManager\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Tracking\CatalogueManager\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

/**
 * ProductSyncController (Catalogue Manager Identity)
 * 
 * Central API for syncing product catalogues from external sources.
 */
class ProductSyncController extends Controller
{
    /**
     * Batch Sync Products.
     * POST /api/tracking/products/sync
     */
    public function sync(Request $request)
    {
        $request->validate([
            'products' => 'required|array|min:1',
            'products.*.sku'   => 'required|string',
            'products.*.name'  => 'required|string',
            'products.*.price' => 'numeric',
            'products.*.cost'  => 'numeric|nullable',
        ]);

        $products = $request->input('products');
        $syncedCount = 0;

        foreach ($products as $item) {
            try {
                Product::updateOrCreate(
                    ['sku' => $item['sku']],
                    [
                        'name'              => $item['name'],
                        'slug'              => $item['slug'] ?? Str::slug($item['name']),
                        'description'       => $item['description'] ?? null,
                        'category'          => $item['category'] ?? null,
                        'price'             => (float) ($item['price'] ?? 0),
                        'sale_price'        => (float) ($item['sale_price'] ?? null),
                        'cost'              => (float) ($item['cost'] ?? 0),
                        'stock_quantity'    => (int) ($item['stock_quantity'] ?? 100),
                        'image_url'         => $item['image_url'] ?? null,
                        'is_active'         => true,
                    ]
                );
                $syncedCount++;
            } catch (\Exception $e) {
                Log::error("[CatalogueManager][Batch] Failed to sync SKU: " . ($item['sku'] ?? 'N/A'), [
                    'error' => $e->getMessage()
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully synced {$syncedCount} products to Catalogue Manager",
            'count'   => $syncedCount
        ]);
    }

    /**
     * Get Catalogue Overview (Admin).
     * GET /api/tracking/products
     */
    public function index(Request $request)
    {
        $products = Product::orderBy('name')
            ->paginate($request->get('limit', 50));

        return response()->json([
            'success' => true,
            'data'    => $products
        ]);
    }
}
