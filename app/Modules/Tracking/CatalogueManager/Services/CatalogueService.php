<?php

namespace App\Modules\Tracking\CatalogueManager\Services;

use App\Modules\Tracking\CatalogueManager\Models\Product;
use Illuminate\Support\Facades\Log;

/**
 * CatalogueService (Integrations Identity)
 * 
 * Unified service for managing the product catalogue across different integrations (Shopify, WooCommerce, etc.).
 */
class CatalogueService
{
    /**
     * Upsert a product into the local catalogue.
     */
    public function upsertProduct(array $data): Product
    {
        return Product::updateOrCreate(
            ['sku' => $data['sku']],
            [
                'name'              => $data['name'],
                'slug'              => $data['slug'] ?? null,
                'description'       => $data['description'] ?? null,
                'category'          => $data['category'] ?? null,
                'price'             => (float) ($data['price'] ?? 0),
                'sale_price'        => (float) ($data['sale_price'] ?? null),
                'cost'              => (float) ($data['cost'] ?? 0),
                'stock_quantity'    => (int) ($data['stock_quantity'] ?? 0),
                'image_url'         => $data['image_url'] ?? null,
                'is_active'         => $data['is_active'] ?? true,
                'metadata'          => array_merge($data['metadata'] ?? [], [
                    '_last_sync_source' => $data['source'] ?? 'unknown',
                    '_last_sync_at'     => now()->toRfc3339String(),
                ]),
            ]
        );
    }

    /**
     * Remove a product from the local catalogue by SKU.
     */
    public function deleteProductBySku(string $sku): bool
    {
        return Product::where('sku', $sku)->delete() > 0;
    }

    /**
     * Remove products by a SKU prefix (useful for Shopify variants).
     */
    public function deleteProductsBySkuPrefix(string $prefix): bool
    {
        return Product::where('sku', 'LIKE', "{$prefix}%")->delete() > 0;
    }
}
