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
        if (Schema::hasTable('inv_products')) {
            Schema::table('inv_products', function (Blueprint $table) {
                if (!Schema::hasColumn('inv_products', 'name')) {
                    $table->string('name')->nullable()->after('id');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('inv_products')) {
            Schema::table('inv_products', function (Blueprint $table) {
                if (Schema::hasColumn('inv_products', 'name')) {
                    $table->dropColumn('name');
                }
            });
        }
    }
};
