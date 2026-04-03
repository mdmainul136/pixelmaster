<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('ior_cart_items');
        Schema::create('ior_cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ior_cart_id')->constrained('ior_carts')->onDelete('cascade');
            $table->unsignedBigInteger('catalog_product_id')->nullable()->index();
            
            $table->string('product_url', 2000)->nullable();
            $table->string('product_name', 500);
            $table->string('product_image_url', 2000)->nullable();
            $table->string('source_marketplace')->nullable();
            
            $table->integer('quantity')->default(1);
            $table->string('product_variant')->nullable();
            $table->decimal('weight_kg', 8, 3)->default(0.500);
            $table->string('shipping_method')->default('air');
            
            // Cached matrix from ProductPricingCalculator
            $table->json('pricing_breakdown')->nullable();
            $table->decimal('row_total_bdt', 12, 2)->default(0);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ior_cart_items');
    }
};
