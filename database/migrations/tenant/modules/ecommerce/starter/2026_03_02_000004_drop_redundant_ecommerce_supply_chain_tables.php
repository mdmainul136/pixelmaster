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
        if (Schema::hasTable('ec_suppliers') && !Schema::hasTable('inv_suppliers')) {
            Schema::rename('ec_suppliers', 'inv_suppliers');
        }
        
        if (Schema::hasTable('ec_purchase_orders') && !Schema::hasTable('inv_purchase_orders')) {
            Schema::rename('ec_purchase_orders', 'inv_purchase_orders');
        }

        if (Schema::hasTable('ec_purchase_order_items') && !Schema::hasTable('inv_purchase_order_items')) {
            Schema::rename('ec_purchase_order_items', 'inv_purchase_order_items');
        }

        if (Schema::hasTable('ec_warehouses') && !Schema::hasTable('inv_warehouses')) {
            Schema::rename('ec_warehouses', 'inv_warehouses');
        }

        if (Schema::hasTable('ec_warehouse_inventory') && !Schema::hasTable('inv_warehouse_inventory')) {
            Schema::rename('ec_warehouse_inventory', 'inv_warehouse_inventory');
        }

        if (Schema::hasTable('ec_stock_logs') && !Schema::hasTable('inv_stock_logs')) {
            Schema::rename('ec_stock_logs', 'inv_stock_logs');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Re-creation is not handled here as this is a consolidation phase.
        // If needed, the original migrations can be re-run by removing this file.
    }
};
