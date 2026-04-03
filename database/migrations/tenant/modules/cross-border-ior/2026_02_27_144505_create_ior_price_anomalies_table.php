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
        
        if (!Schema::hasTable('ior_price_anomalies')) {
            Schema::create('ior_price_anomalies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('ec_products')->cascadeOnDelete();
            $table->decimal('old_price', 10, 2);
            $table->decimal('new_price', 10, 2);
            $table->decimal('difference_percentage', 8, 2);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->json('metadata')->nullable()->comment('Store source URL or provider details');
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            // Index for faster queries on the UI table
            $table->index(['status', 'created_at']);
        });
        }

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ior_price_anomalies');
    }
};
