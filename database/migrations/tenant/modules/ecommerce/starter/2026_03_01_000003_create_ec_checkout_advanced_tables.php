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
        // 1. Shipping Rule Engine
        Schema::create('ec_shipping_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type')->default('flat'); // flat, weight_based, price_based
            $table->decimal('min_value', 15, 2)->default(0);
            $table->decimal('max_value', 15, 2)->nullable();
            $table->decimal('shipping_cost', 15, 2);
            $table->string('country_code')->default('*');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Fraud Check Scoring
        Schema::create('ec_fraud_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('ec_orders')->onDelete('cascade');
            $table->integer('fraud_score')->default(0); // 0-100
            $table->json('flagged_reasons')->nullable(); // ['new_ip', 'large_amount', 'address_mismatch']
            $table->string('status')->default('clean'); // clean, suspicious, high_risk
            $table->timestamps();
        });

        // 3. Add fraud_score to ec_orders for quick filtering
        Schema::table('ec_orders', function (Blueprint $table) {
            $table->integer('fraud_score')->default(0)->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ec_orders', function (Blueprint $table) {
            $table->dropColumn('fraud_score');
        });
        Schema::dropIfExists('ec_fraud_checks');
        Schema::dropIfExists('ec_shipping_rules');
    }
};
