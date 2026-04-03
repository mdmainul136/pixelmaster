<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add inventory_product_id to ec_product_variants
        Schema::table('ec_product_variants', function (Blueprint $table) {
            $table->unsignedBigInteger('inventory_product_id')->nullable()->after('product_id');
        });

        // 2. Data Migration: Move existing variant SKU and stock to inv_products
        $variants = DB::table('ec_product_variants')->get();
        foreach ($variants as $variant) {
            // Check if inventory record already exists for this SKU
            $exists = DB::table('inv_products')->where('sku', $variant->sku)->first();
            
            if ($exists) {
                $invProductId = $exists->id;
            } else {
                $invProductId = DB::table('inv_products')->insertGetId([
                    'sku'            => $variant->sku,
                    'cost_price'     => 0, // Fallback
                    'stock_quantity' => $variant->stock_quantity,
                    'is_active'       => $variant->is_active,
                    'created_at'     => $variant->created_at,
                    'updated_at'     => $variant->updated_at,
                ]);
            }

            DB::table('ec_product_variants')->where('id', $variant->id)->update([
                'inventory_product_id' => $invProductId
            ]);
        }

        // 3. Drop redundant columns from ec_product_variants
        Schema::table('ec_product_variants', function (Blueprint $table) {
            // Note: We keep SKU for storefront reference usually, 
            // but in this high-end architecture, we proxy it.
            // For now, let's keep SKU but drop stock_quantity from Ecommerce side.
            $table->dropColumn(['stock_quantity']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ec_product_variants', function (Blueprint $table) {
            $table->integer('stock_quantity')->default(0);
            $table->dropColumn('inventory_product_id');
        });
    }
};
