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
        // 1. Add inventory_product_id to ec_products
        Schema::table('ec_products', function (Blueprint $table) {
            $table->unsignedBigInteger('inventory_product_id')->nullable()->after('id');
        });

        // 2. Data Migration
        $products = DB::table('ec_products')->get();
        foreach ($products as $product) {
            $invProductId = DB::table('inv_products')->insertGetId([
                'sku'            => $product->sku,
                'cost_price'     => $product->cost,
                'weight'         => $product->weight,
                'dimensions'     => $product->dimensions,
                'stock_quantity' => $product->stock_quantity,
                'created_at'     => $product->created_at,
                'updated_at'     => $product->updated_at,
            ]);

            DB::table('ec_products')->where('id', $product->id)->update([
                'inventory_product_id' => $invProductId
            ]);

            // Update dependent tables
            DB::table('ec_warehouse_inventory')->where('product_id', $product->id)->update(['product_id' => $invProductId]);
            DB::table('ec_stock_logs')->where('product_id', $product->id)->update(['product_id' => $invProductId]);
        }

        // 3. Drop redundant columns from ec_products
        Schema::table('ec_products', function (Blueprint $table) {
            $table->dropColumn(['sku', 'cost', 'stock_quantity', 'weight', 'dimensions']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse is complex due to dropped columns, usually not recommended in architectural shifts
        // but for safety, we add the columns back (without data recovery here)
        Schema::table('ec_products', function (Blueprint $table) {
            $table->string('sku')->unique()->nullable();
            $table->decimal('cost', 15, 2)->default(0.00);
            $table->integer('stock_quantity')->default(0);
            $table->decimal('weight', 8, 2)->nullable();
            $table->string('dimensions', 100)->nullable();
            $table->dropColumn('inventory_product_id');
        });
    }
};
