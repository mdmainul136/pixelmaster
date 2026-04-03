<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add variant_options JSON column to ec_products.
     * Stores option definitions including colorMap for color swatches.
     * Example: [{"name":"Color","values":["Red","Blue"],"colorMap":{"Red":"#EF4444","Blue":"#3B82F6"}},{"name":"Size","values":["S","M","L"]}]
     */
    public function up(): void
    {
        Schema::table('ec_products', function (Blueprint $table) {
            if (!Schema::hasColumn('ec_products', 'variant_options')) {
                $table->json('variant_options')->nullable()->after('collections');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ec_products', function (Blueprint $table) {
            $table->dropColumn('variant_options');
        });
    }
};
