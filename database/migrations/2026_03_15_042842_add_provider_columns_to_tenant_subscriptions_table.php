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
        Schema::table('tenant_subscriptions', function (Blueprint $table) {
            $table->string('provider')->nullable()->after('auto_renew');
            $table->string('provider_subscription_id')->nullable()->after('provider');
            $table->string('provider_customer_id')->nullable()->after('provider_subscription_id');
            $table->timestamp('current_period_start')->nullable()->after('provider_customer_id');
            $table->timestamp('current_period_end')->nullable()->after('current_period_start');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenant_subscriptions', function (Blueprint $table) {
            $table->dropColumn([
                'provider',
                'provider_subscription_id',
                'provider_customer_id',
                'current_period_start',
                'current_period_end'
            ]);
        });
    }
};
