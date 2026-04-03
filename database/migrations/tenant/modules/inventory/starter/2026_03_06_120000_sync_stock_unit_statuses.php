<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('inv_stock_units')) {
            if (DB::getDriverName() === 'mysql') {
                DB::statement("ALTER TABLE inv_stock_units MODIFY COLUMN status ENUM('in_stock', 'allocated', 'sold', 'shipped', 'returned', 'damaged', 'lost', 'in_transit') DEFAULT 'in_stock'");
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('inv_stock_units')) {
            if (DB::getDriverName() === 'mysql') {
                DB::statement("ALTER TABLE inv_stock_units MODIFY COLUMN status ENUM('in_stock', 'sold', 'returned', 'damaged', 'lost', 'in_transit') DEFAULT 'in_stock'");
            }
        }
    }
};
