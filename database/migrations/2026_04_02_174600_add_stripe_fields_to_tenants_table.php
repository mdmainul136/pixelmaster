<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add Stripe billing fields to the tenants table.
     * These are used by StripeBillingService (direct Stripe PHP SDK integration).
     *
     * - stripe_customer_id: Stripe Customer object ID (cus_...)
     * - stripe_subscription_id: Active subscription ID (sub_...)
     * - stripe_price_id: The Stripe Price object linked to this tenant's plan
     * - stripe_subscription_status: 'active', 'trialing', 'past_due', 'canceled', etc.
     * - stripe_overage_item_id: The metered subscription item ID for overage billing (si_...)
     * - billing_required: Whether this tenant needs a card on file (Pro/Business+ only)
     */
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('stripe_customer_id')->nullable()->after('plan');
            $table->string('stripe_subscription_id')->nullable()->after('stripe_customer_id');
            $table->string('stripe_price_id')->nullable()->after('stripe_subscription_id');
            $table->string('stripe_subscription_status')->nullable()->after('stripe_price_id');
            $table->string('stripe_overage_item_id')->nullable()->after('stripe_subscription_status');
            $table->boolean('billing_required')->default(false)->after('stripe_overage_item_id');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'stripe_customer_id',
                'stripe_subscription_id',
                'stripe_price_id',
                'stripe_subscription_status',
                'stripe_overage_item_id',
                'billing_required',
            ]);
        });
    }
};
