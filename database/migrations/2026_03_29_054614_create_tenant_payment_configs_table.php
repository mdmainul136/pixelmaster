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
        if (Schema::hasTable('tenant_payment_configs')) {
            return; // Table already exists
        }

        Schema::create('tenant_payment_configs', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('gateway_name'); // e.g., 'stripe', 'paypal'
            $table->string('mode')->default('sandbox'); // 'sandbox' or 'live'
            $table->json('credentials');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique(['tenant_id', 'gateway_name']); // One config per gateway per tenant
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_payment_configs');
    }
};
