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
        Schema::create('mkp_reviews', function (Blueprint $table) {
            $table->id();
            $table->morphs('reviewable'); // Links to Product OR Vendor
            $table->foreignId('customer_id')->constrained('ec_customers')->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained('ec_orders')->onDelete('set null');
            $table->foreignId('booking_id')->nullable()->constrained('mkp_bookings')->onDelete('set null');
            
            $table->integer('rating'); // 1-5
            $table->string('title')->nullable();
            $table->text('comment')->nullable();
            
            $table->boolean('is_verified_purchase')->default(false);
            $table->boolean('is_approved')->default(true); // Default can be changed based on tenant settings
            
            $table->timestamps();
            $table->softDeletes();

            $table->index(['reviewable_type', 'reviewable_id', 'is_approved'], 'mkp_reviews_polymorphic_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mkp_reviews');
    }
};
