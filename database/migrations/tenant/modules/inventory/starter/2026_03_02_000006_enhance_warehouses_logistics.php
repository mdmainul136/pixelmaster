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
        Schema::table('inv_warehouses', function (Blueprint $table) {
            $table->integer('priority')->default(0)->after('is_default');
            $table->decimal('latitude', 10, 8)->nullable()->after('location');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            $table->string('fulfillment_region')->nullable()->after('longitude');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inv_warehouses', function (Blueprint $table) {
            $table->dropColumn(['priority', 'latitude', 'longitude', 'fulfillment_region']);
        });
    }
};
