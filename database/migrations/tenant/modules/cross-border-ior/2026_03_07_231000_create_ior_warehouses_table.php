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
        // 1. Warehouse registry for IOR (Source, Transit, Destination)
        if (!Schema::hasTable('ior_warehouses')) {
            Schema::create('ior_warehouses', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('location_type')->default('source'); // source, transit, destination
                $table->string('address', 500);
                $table->string('contact_person')->nullable();
                $table->string('contact_phone')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 2. Link orders to their current location
        Schema::table('ior_foreign_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('ior_foreign_orders', 'current_warehouse_id')) {
                $table->unsignedBigInteger('current_warehouse_id')->nullable()->after('courier_code');
                $table->foreign('current_warehouse_id')->references('id')->on('ior_warehouses')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ior_foreign_orders', function (Blueprint $table) {
            $table->dropForeign(['current_warehouse_id']);
            $table->dropColumn('current_warehouse_id');
        });
        Schema::dropIfExists('ior_warehouses');
    }
};
