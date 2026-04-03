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
        // 1. Riders Table (Internal Fulfillment)
        Schema::create('log_riders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('vehicle_type')->nullable(); // cycle, bike, van
            $table->string('license_number')->nullable();
            $table->string('status')->default('available'); // available, busy, offline
            $table->decimal('current_lat', 10, 8)->nullable();
            $table->decimal('current_lng', 11, 8)->nullable();
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Shipments Table
        Schema::create('log_shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('ec_orders')->onDelete('cascade');
            $table->foreignId('warehouse_id')->nullable()->constrained('inv_warehouses')->onDelete('set null');
            $table->foreignId('rider_id')->nullable()->constrained('log_riders')->onDelete('set null');
            
            $table->string('courier_provider')->nullable(); // pathao, redx, internal
            $table->string('tracking_number')->nullable()->unique();
            $table->string('status')->default('pending'); // pending, picked_up, out_for_delivery, delivered, cancelled
            
            $table->decimal('shipping_cost', 15, 2)->default(0.00);
            $table->dateTime('estimated_delivery_at')->nullable();
            $table->dateTime('delivered_at')->nullable();
            
            // Geolocation for real-time tracking
            $table->decimal('last_known_lat', 10, 8)->nullable();
            $table->decimal('last_known_lng', 11, 8)->nullable();
            
            $table->json('tracking_history')->nullable(); // Status changes
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('tracking_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log_shipments');
        Schema::dropIfExists('log_riders');
    }
};
