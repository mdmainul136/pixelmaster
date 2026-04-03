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
        Schema::table('ec_customers', function (Blueprint $table) {
            $table->integer('total_pos_sales')->default(0)->after('total_orders');
            $table->decimal('total_pos_spent', 15, 2)->default(0.00)->after('total_spent');
            $table->timestamp('last_purchase_at')->nullable()->after('total_pos_spent');
            $table->string('channel_preference')->default('omni')->after('last_purchase_at'); // online, pos, omni
            $table->string('loyalty_tier')->nullable()->after('channel_preference');
        });

        Schema::create('customer_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('ec_customers')->onDelete('cascade');
            $table->string('activity_type'); // order_placed, pos_sale, points_earned, points_redeemed, cart_recovered, review_submitted
            $table->nullableMorphs('record'); // Links to PosSale, Order, review, etc.
            $table->decimal('value', 15, 2)->nullable(); // e.g., spent amount or points change
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'activity_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_activities');
        Schema::table('ec_customers', function (Blueprint $table) {
            $table->dropColumn([
                'total_pos_sales',
                'total_pos_spent',
                'last_purchase_at',
                'channel_preference',
                'loyalty_tier'
            ]);
        });
    }
};
