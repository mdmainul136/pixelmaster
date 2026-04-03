<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('ec_orders', 'paid_amount')) {
            Schema::table('ec_orders', function (Blueprint $table) {
                $table->decimal('paid_amount', 15, 2)->default(0.00)->after('total');
            });
        }

        if (!Schema::hasColumn('ec_order_items', 'batch_number')) {
            Schema::table('ec_order_items', function (Blueprint $table) {
                $table->string('batch_number')->nullable()->after('sku');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('ec_order_items', 'batch_number')) {
            Schema::table('ec_order_items', function (Blueprint $table) {
                $table->dropColumn('batch_number');
            });
        }

        if (Schema::hasColumn('ec_orders', 'paid_amount')) {
            Schema::table('ec_orders', function (Blueprint $table) {
                $table->dropColumn('paid_amount');
            });
        }
    }
};
