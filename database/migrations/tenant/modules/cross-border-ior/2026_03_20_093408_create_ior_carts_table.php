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
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('ior_carts');
        Schema::enableForeignKeyConstraints();
        
        Schema::create('ior_carts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->nullable()->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('session_id')->nullable()->index();
            $table->string('currency')->default('BDT');
            $table->integer('total_items')->default(0);
            
            // Financial Aggregates
            $table->decimal('total_base_price_usd', 12, 2)->default(0);
            $table->decimal('total_base_price_bdt', 12, 2)->default(0);
            $table->decimal('total_customs_fee_bdt', 12, 2)->default(0);
            $table->decimal('total_shipping_cost_bdt', 12, 2)->default(0);
            $table->decimal('total_profit_margin_bdt', 12, 2)->default(0);
            $table->decimal('final_total_bdt', 12, 2)->default(0);
            $table->decimal('advance_amount_required', 12, 2)->default(0);
            
            $table->string('status')->default('active'); // active, abandoned, ordered
            $table->string('recovery_token', 64)->nullable()->index();
            $table->timestamp('notified_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ior_carts');
    }
};
