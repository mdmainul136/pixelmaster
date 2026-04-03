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
        Schema::create('mkp_bookings', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->foreignId('vendor_id')->constrained('mkp_vendors')->onDelete('cascade');
            $blueprint->foreignId('customer_id')->constrained('ec_customers')->onDelete('cascade');
            $blueprint->foreignId('product_id')->constrained('ec_products')->onDelete('cascade'); // The "Service"
            $blueprint->dateTime('start_time');
            $blueprint->dateTime('end_time');
            $blueprint->string('status')->default('pending'); // pending, confirmed, cancelled, completed
            $blueprint->text('notes')->nullable();
            $blueprint->decimal('price', 15, 2);
            $blueprint->string('payment_status')->default('pending');
            $blueprint->timestamps();
            $blueprint->softDeletes();
            
            $blueprint->index(['vendor_id', 'start_time', 'end_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mkp_bookings');
    }
};
