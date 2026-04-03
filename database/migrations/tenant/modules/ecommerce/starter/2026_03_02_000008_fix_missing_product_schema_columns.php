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
        // 1. Add missing columns to ec_products
        Schema::table('ec_products', function (Blueprint $table) {
            if (!Schema::hasColumn('ec_products', 'tags')) {
                $table->json('tags')->nullable()->after('meta_description');
            }
            if (!Schema::hasColumn('ec_products', 'short_description')) {
                $table->string('short_description', 500)->nullable()->after('description');
            }
            if (!Schema::hasColumn('ec_products', 'is_physical')) {
                $table->boolean('is_physical')->default(true)->after('is_active');
            }
            if (!Schema::hasColumn('ec_products', 'product_type')) {
                $table->string('product_type')->nullable()->after('short_description');
            }
            if (!Schema::hasColumn('ec_products', 'vendor')) {
                $table->string('vendor')->nullable()->after('product_type');
            }
            if (!Schema::hasColumn('ec_products', 'collections')) {
                $table->json('collections')->nullable()->after('vendor');
            }
        });

        // 2. Add missing columns to inv_products
        Schema::table('inv_products', function (Blueprint $table) {
            if (!Schema::hasColumn('inv_products', 'name')) {
                $table->string('name')->nullable()->after('id');
            }
            if (!Schema::hasColumn('inv_products', 'weight_unit')) {
                $table->string('weight_unit', 10)->default('kg')->after('weight');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ec_products', function (Blueprint $table) {
            $table->dropColumn(['tags', 'short_description', 'is_physical', 'product_type', 'vendor', 'collections']);
        });

        Schema::table('inv_products', function (Blueprint $table) {
            $table->dropColumn(['name', 'weight_unit']);
        });
    }
};
