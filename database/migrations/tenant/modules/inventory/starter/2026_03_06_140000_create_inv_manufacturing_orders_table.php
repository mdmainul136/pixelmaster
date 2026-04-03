<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Guard: only create if the inventory module tables exist
        if (!Schema::hasTable('inv_products') || !Schema::hasTable('inv_boms') || !Schema::hasTable('inv_warehouses')) {
            return; // Inventory module not yet migrated — skip silently
        }

        if (Schema::hasTable('inv_manufacturing_orders')) {
            return; // Already exists
        }

        Schema::create('inv_manufacturing_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('bom_id');
            $table->unsignedBigInteger('warehouse_id');
            
            $table->decimal('target_quantity', 15, 3);
            $table->decimal('produced_quantity', 15, 3)->default(0);
            
            $table->enum('status', ['draft', 'planned', 'in_progress', 'completed', 'cancelled'])->default('draft');
            
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            
            $table->timestamps();
            $table->softDeletes();

            // Soft references — no hard FK constraints across module boundaries
            $table->index('product_id');
            $table->index('bom_id');
            $table->index('warehouse_id');
            $table->index('user_id');
            $table->index(['product_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inv_manufacturing_orders');
    }
};
