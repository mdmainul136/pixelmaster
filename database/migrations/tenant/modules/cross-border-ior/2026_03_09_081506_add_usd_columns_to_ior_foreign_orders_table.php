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
        Schema::table('ior_foreign_orders', function (Blueprint $table) {
            $table->decimal('base_price_usd', 10, 2)->nullable()->after('exchange_rate');
            $table->decimal('customs_fee_usd', 10, 2)->nullable()->after('customs_fee_bdt');
            $table->decimal('shipping_cost_usd', 10, 2)->nullable()->after('shipping_cost_bdt');
            $table->decimal('profit_margin_usd', 10, 2)->nullable()->after('profit_margin_bdt');
            $table->decimal('estimated_price_usd', 10, 2)->nullable()->after('estimated_price_bdt');
            $table->decimal('final_price_usd', 10, 2)->nullable()->after('final_price_bdt');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ior_foreign_orders', function (Blueprint $table) {
            $table->dropColumn([
                'base_price_usd',
                'customs_fee_usd',
                'shipping_cost_usd',
                'profit_margin_usd',
                'estimated_price_usd',
                'final_price_usd',
            ]);
        });
    }
};
