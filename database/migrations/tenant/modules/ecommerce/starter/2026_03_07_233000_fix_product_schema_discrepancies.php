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
        // 1. Fix ec_products missing deleted_at
        if (Schema::hasTable('ec_products')) {
            Schema::table('ec_products', function (Blueprint $table) {
                if (!Schema::hasColumn('ec_products', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }

        // 2. Ensure inv_products has name and deleted_at
        if (Schema::hasTable('inv_products')) {
            Schema::table('inv_products', function (Blueprint $table) {
                if (!Schema::hasColumn('inv_products', 'name')) {
                    $table->string('name')->nullable()->after('id');
                }
                if (!Schema::hasColumn('inv_products', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('ec_products')) {
            Schema::table('ec_products', function (Blueprint $table) {
                if (Schema::hasColumn('ec_products', 'deleted_at')) {
                    $table->dropColumn('deleted_at');
                }
            });
        }
        
        if (Schema::hasTable('inv_products')) {
            Schema::table('inv_products', function (Blueprint $table) {
                $table->dropColumn(['name', 'deleted_at']);
            });
        }
    }
};
