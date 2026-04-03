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
        Schema::table('catalog_products', function (Blueprint $table) {
            if (!Schema::hasColumn('catalog_products', 'sub_category')) {
                $table->string('sub_category')->nullable()->after('category');
            }
            if (!Schema::hasColumn('catalog_products', 'sub_sub_category')) {
                $table->string('sub_sub_category')->nullable()->after('sub_category');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('catalog_products', function (Blueprint $table) {
            $table->dropColumn(['sub_category', 'sub_sub_category']);
        });
    }
};
