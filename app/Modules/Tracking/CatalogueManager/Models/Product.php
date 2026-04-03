<?php

namespace App\Modules\Tracking\CatalogueManager\Models;

use App\Models\TenantBaseModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Product Model (Catalogue Manager Identity)
 * 
 * Maps to catalog_products table in the tenant database.
 * This table is used for sGTM tracking (POAS, Price, Cost, Stock).
 */
class Product extends TenantBaseModel
{
    use HasFactory;

    protected $table = 'catalog_products';

    protected $fillable = [
        'name',
        'slug',
        'sku',
        'description',
        'short_description',
        'category',
        'price',
        'price_bdt',
        'cost',
        'currency',
        'stock_quantity',
        'weight',
        'thumbnail_url',
        'images',
        'brand',
        'availability',
        'status',
        'product_type',
        'attributes',
    ];

    protected $casts = [
        'price'          => 'decimal:2',
        'price_bdt'      => 'decimal:2',
        'cost'           => 'decimal:2',
        'stock_quantity' => 'integer',
        'images'         => 'array',
        'attributes'     => 'array',
        'is_active'      => 'boolean',
    ];

    /**
     * Get the margin/profit for this product.
     */
    public function getMarginAttribute()
    {
        return $this->price - $this->cost;
    }

    /**
     * Get the formatted availability for POAS feed.
     */
    public function getAvailabilityAttribute()
    {
        return $this->stock_quantity > 0 ? 'in stock' : 'out of stock';
    }
}
