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
        if (Schema::hasTable('ior_foreign_orders')) {
            Schema::table('ior_foreign_orders', function (Blueprint $table) {
                if (!Schema::hasColumn('ior_foreign_orders', 'shipment_batch_id')) {
                    $table->unsignedBigInteger('shipment_batch_id')->nullable()->after('id')->index();
                }
                if (!Schema::hasColumn('ior_foreign_orders', 'intl_tracking_number')) {
                    $table->string('intl_tracking_number')->nullable()->after('tracking_number')->index();
                }
                if (!Schema::hasColumn('ior_foreign_orders', 'intl_courier_code')) {
                    $table->string('intl_courier_code')->nullable()->after('courier_code');
                }
                if (!Schema::hasColumn('ior_foreign_orders', 'arrived_at')) {
                    $table->timestamp('arrived_at')->nullable()->after('shipped_at'); // Arrived at intl warehouse
                }
                if (!Schema::hasColumn('ior_foreign_orders', 'dispatched_at')) {
                    $table->timestamp('dispatched_at')->nullable()->after('arrived_at'); // Dispatched from hub
                }
                if (!Schema::hasColumn('ior_foreign_orders', 'customs_cleared_at')) {
                    $table->timestamp('customs_cleared_at')->nullable()->after('dispatched_at');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ior_foreign_orders', function (Blueprint $table) {
            $table->dropColumn([
                'shipment_batch_id',
                'intl_tracking_number',
                'intl_courier_code',
                'arrived_at',
                'dispatched_at',
                'customs_cleared_at'
            ]);
        });
    }
};
