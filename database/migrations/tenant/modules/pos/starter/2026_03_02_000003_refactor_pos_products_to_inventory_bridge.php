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
        // 1. Add inventory_product_id to pos_products
        Schema::table('pos_products', function (Blueprint $table) {
            $table->unsignedBigInteger('inventory_product_id')->nullable()->after('id');
        });

        // 2. Data Migration: Link POS Products to Inventory Products by SKU
        $posProducts = DB::table('pos_products')->get();
        foreach ($posProducts as $product) {
            // Check if SKU already exists in inv_products (migrated from EC)
            $invProduct = DB::table('inv_products')->where('sku', $product->sku)->first();

            if (!$invProduct) {
                // If not in EC, it might be unique to POS (less likely but possible)
                $invProductId = DB::table('inv_products')->insertGetId([
                    'sku'            => $product->sku,
                    'barcode'        => $product->barcode,
                    'cost_price'     => $product->cost,
                    'stock_quantity' => $product->stock_quantity,
                    'reorder_level'  => $product->min_stock_level,
                    'created_at'     => $product->created_at,
                    'updated_at'     => $product->updated_at,
                ]);
            } else {
                $invProductId = $invProduct->id;
            }

            DB::table('pos_products')->where('id', $product->id)->update([
                'inventory_product_id' => $invProductId
            ]);
        }

        // 3. Drop redundant columns from pos_products
        Schema::table('pos_products', function (Blueprint $table) {
            $table->dropColumn(['sku', 'barcode', 'cost', 'stock_quantity', 'min_stock_level']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pos_products', function (Blueprint $table) {
            $table->string('sku')->nullable();
            $table->string('barcode')->nullable();
            $table->decimal('cost', 10, 2)->default(0.00);
            $table->integer('stock_quantity')->default(0);
            $table->integer('min_stock_level')->default(0);
            $table->dropColumn('inventory_product_id');
        });
    }
};
