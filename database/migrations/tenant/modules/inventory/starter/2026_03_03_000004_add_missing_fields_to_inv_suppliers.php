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
        Schema::table('inv_suppliers', function (Blueprint $table) {
            if (!Schema::hasColumn('inv_suppliers', 'tax_id')) {
                $table->string('tax_id')->nullable()->after('address');
            }
            if (!Schema::hasColumn('inv_suppliers', 'trade_license')) {
                $table->string('trade_license')->nullable()->after('tax_id');
            }
            if (!Schema::hasColumn('inv_suppliers', 'currency')) {
                $table->string('currency', 10)->nullable()->after('trade_license');
            }
            if (!Schema::hasColumn('inv_suppliers', 'website')) {
                $table->string('website')->nullable()->after('phone');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inv_suppliers', function (Blueprint $table) {
            $table->dropColumn(['tax_id', 'trade_license', 'currency', 'website']);
        });
    }
};
