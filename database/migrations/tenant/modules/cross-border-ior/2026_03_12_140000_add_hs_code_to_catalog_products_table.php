<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('catalog_products', function (Blueprint $table) {
            if (!Schema::hasColumn('catalog_products', 'hs_code')) {
                $table->string('hs_code', 20)->nullable()->index();
            }
            if (!Schema::hasColumn('catalog_products', 'hs_category')) {
                $table->string('hs_category')->nullable();
            }
            if (!Schema::hasColumn('catalog_products', 'hs_confidence')) {
                $table->decimal('hs_confidence', 3, 2)->nullable();
            }
            if (!Schema::hasColumn('catalog_products', 'hs_source')) {
                $table->string('hs_source')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('catalog_products', function (Blueprint $table) {
            $table->dropColumn(['hs_code', 'hs_category', 'hs_confidence', 'hs_source']);
        });
    }
};
