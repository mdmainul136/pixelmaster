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
        // 1. Pricing Rules (The brain for "Rule-based pricing")
        Schema::create('ec_pricing_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('rule_type'); // fixed_discount, percentage_discount, buy_x_get_y, shipping_discount
            $table->json('conditions'); // {min_qty: 5, customer_group: 'wholesale', product_ids: [1,2]}
            $table->json('actions'); // {discount_amount: 10, free_product_id: 3}
            $table->integer('priority')->default(0);
            $table->boolean('is_active')->default(true);
            $table->dateTime('start_at')->nullable();
            $table->dateTime('end_at')->nullable();
            $table->timestamps();
        });

        // 2. Geographic Pricing (Geo pricing)
        Schema::create('ec_geo_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('ec_products')->onDelete('cascade');
            $table->foreignId('variant_id')->nullable()->constrained('ec_product_variants')->onDelete('cascade');
            $table->string('country_code', 2); // ISO code
            $table->string('currency_code', 3);
            $table->decimal('price', 15, 2);
            $table->decimal('sale_price', 15, 2)->nullable();
            $table->timestamps();

            $table->unique(['product_id', 'variant_id', 'country_code'], 'product_geo_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ec_geo_prices');
        Schema::dropIfExists('ec_pricing_rules');
    }
};
