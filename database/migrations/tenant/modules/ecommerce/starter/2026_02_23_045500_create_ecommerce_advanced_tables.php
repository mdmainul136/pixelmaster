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
        // 1. Flash Sales
        Schema::create('ec_flash_sales', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->dateTime('start_at');
            $table->dateTime('end_at');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('ec_flash_sale_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flash_sale_id')->constrained('ec_flash_sales')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('ec_products')->onDelete('cascade');
            $table->decimal('discount_price', 15, 2);
            $table->integer('stock_limit')->default(0);
            $table->integer('sold_count')->default(0);
            $table->timestamps();
        });

        // 2. Tiered Pricing
        Schema::create('ec_tier_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('ec_products')->onDelete('cascade');
            $table->integer('min_quantity');
            $table->decimal('price', 15, 2);
            $table->string('customer_group')->nullable(); // e.g., 'retail', 'wholesale'
            $table->timestamps();
        });

        // 3. Cart Recovery
        Schema::create('ec_cart_recoveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained('ec_carts')->onDelete('cascade');
            $table->foreignId('customer_id')->nullable()->constrained('ec_customers')->onDelete('set null');
            $table->string('token')->unique();
            $table->enum('status', ['pending', 'recovered', 'expired'])->default('pending');
            $table->dateTime('last_notified_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ec_cart_recoveries');
        Schema::dropIfExists('ec_tier_prices');
        Schema::dropIfExists('ec_flash_sale_products');
        Schema::dropIfExists('ec_flash_sales');
    }
};
