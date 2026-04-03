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
        // Add parent_id to ior_inventory_categories
        if (Schema::hasTable('ior_inventory_categories')) {
            Schema::table('ior_inventory_categories', function (Blueprint $table) {
                if (!Schema::hasColumn('ior_inventory_categories', 'parent_id')) {
                    $table->unsignedBigInteger('parent_id')->nullable()->after('id');
                    $table->foreign('parent_id')->references('id')->on('ior_inventory_categories')->onDelete('cascade');
                }
            });
        }

        // Add category_id to inv_products
        if (Schema::hasTable('inv_products')) {
            Schema::table('inv_products', function (Blueprint $table) {
                if (!Schema::hasColumn('inv_products', 'category_id')) {
                    $table->unsignedBigInteger('category_id')->nullable()->after('id');
                    $table->foreign('category_id')->references('id')->on('ior_inventory_categories')->onDelete('set null');
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
                $table->dropForeign(['category_id']);
                $table->dropColumn('category_id');
            });
        }

        if (Schema::hasTable('ior_inventory_categories')) {
            Schema::table('ior_inventory_categories', function (Blueprint $table) {
                $table->dropForeign(['parent_id']);
                $table->dropColumn('parent_id');
            });
        }
    }
};
