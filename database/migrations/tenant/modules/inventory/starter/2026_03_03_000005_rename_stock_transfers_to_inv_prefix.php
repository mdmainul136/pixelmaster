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
        if (Schema::hasTable('ec_stock_transfers') && !Schema::hasTable('inv_stock_transfers')) {
            Schema::rename('ec_stock_transfers', 'inv_stock_transfers');
        }
        
        if (Schema::hasTable('ec_stock_transfer_items') && !Schema::hasTable('inv_stock_transfer_items')) {
            Schema::rename('ec_stock_transfer_items', 'inv_stock_transfer_items');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('inv_stock_transfers') && !Schema::hasTable('ec_stock_transfers')) {
            Schema::rename('inv_stock_transfers', 'ec_stock_transfers');
        }
        
        if (Schema::hasTable('inv_stock_transfer_items') && !Schema::hasTable('ec_stock_transfer_items')) {
            Schema::rename('inv_stock_transfer_items', 'ec_stock_transfer_items');
        }
    }
};
