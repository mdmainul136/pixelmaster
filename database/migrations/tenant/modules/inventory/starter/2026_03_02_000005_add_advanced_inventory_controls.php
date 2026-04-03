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
        Schema::table('inv_products', function (Blueprint $table) {
            $table->boolean('allow_negative_stock')->default(false)->after('stock_quantity');
            $table->enum('tracking_type', ['none', 'batch', 'serial'])->default('none')->after('allow_negative_stock');
        });

        Schema::create('inv_stock_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('inv_products');
            $table->foreignId('warehouse_id')->constrained('inv_warehouses');
            $table->string('serial_number')->nullable()->unique();
            $table->string('batch_number')->nullable();
            $table->date('expiry_date')->nullable();
            $table->enum('status', ['in_stock', 'sold', 'returned', 'damaged', 'lost'])->default('in_stock');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['product_id', 'warehouse_id']);
            $table->index('batch_number');
        });

        Schema::create('inv_boms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('inv_products');
            $table->string('version')->default('1.0');
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('inv_bom_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bom_id')->constrained('inv_boms')->onDelete('cascade');
            $table->foreignId('component_product_id')->constrained('inv_products');
            $table->decimal('quantity', 10, 3);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inv_bom_items');
        Schema::dropIfExists('inv_boms');
        Schema::dropIfExists('inv_stock_units');
        Schema::table('inv_products', function (Blueprint $table) {
            $table->dropColumn(['allow_negative_stock', 'tracking_type']);
        });
    }
};
