<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add batch_number to transfer items
        if (Schema::hasTable('inv_stock_transfer_items')) {
            if (!Schema::hasColumn('inv_stock_transfer_items', 'batch_number')) {
                Schema::table('inv_stock_transfer_items', function (Blueprint $table) {
                    $table->string('batch_number')->nullable()->after('product_id');
                });
            }
        }

        // Add in_transit to stock units status enum (MySQL requires re-defining the enum)
        if (Schema::hasTable('inv_stock_units')) {
            if (DB::getDriverName() === 'mysql') {
                DB::statement("ALTER TABLE inv_stock_units MODIFY COLUMN status ENUM('in_stock', 'sold', 'returned', 'damaged', 'lost', 'in_transit') DEFAULT 'in_stock'");
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('inv_stock_transfer_items') && Schema::hasColumn('inv_stock_transfer_items', 'batch_number')) {
            Schema::table('inv_stock_transfer_items', function (Blueprint $table) {
                $table->dropColumn('batch_number');
            });
        }

        if (Schema::hasTable('inv_stock_units')) {
            if (DB::getDriverName() === 'mysql') {
                DB::statement("ALTER TABLE inv_stock_units MODIFY COLUMN status ENUM('in_stock', 'sold', 'returned', 'damaged', 'lost') DEFAULT 'in_stock'");
            }
        }
    }
};
