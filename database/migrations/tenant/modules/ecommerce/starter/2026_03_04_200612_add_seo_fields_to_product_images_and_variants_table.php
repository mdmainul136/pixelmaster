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
        Schema::table('ec_product_images', function (Blueprint $table) {
            if (!Schema::hasColumn('ec_product_images', 'seo_filename')) {
                $table->string('seo_filename')->nullable()->after('title');
            }
        });

        Schema::table('ec_product_variants', function (Blueprint $table) {
            if (!Schema::hasColumn('ec_product_variants', 'image_seo')) {
                $table->json('image_seo')->nullable()->after('image');
            }
            if (!Schema::hasColumn('ec_product_variants', 'schema_org')) {
                $table->json('schema_org')->nullable()->after('image_seo');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ec_product_images', function (Blueprint $table) {
            $table->dropColumn('seo_filename');
        });

        Schema::table('ec_product_variants', function (Blueprint $table) {
            $table->dropColumn(['image_seo', 'schema_org']);
        });
    }
};
