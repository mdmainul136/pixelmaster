<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add detailed product specifications to catalog_products table.
     */
    public function up(): void
    {
        if (Schema::hasTable('catalog_products')) {
            Schema::table('catalog_products', function (Blueprint $table) {
                // Technical Identifiers
                $table->string('asin', 50)->nullable()->after('sku')->index();
                $table->string('upc', 50)->nullable()->after('asin');
                $table->string('gtin', 50)->nullable()->after('upc');
                
                // Detailed Specs (Beauty / General)
                $table->string('brand_name')->nullable()->after('brand');
                $table->string('manufacturer')->nullable()->after('brand_name');
                $table->string('item_form')->nullable()->after('manufacturer');
                $table->string('color')->nullable()->after('item_form');
                $table->string('finish_type')->nullable()->after('color');
                $table->text('product_benefits')->nullable()->after('finish_type');
                $table->string('skin_type')->nullable()->after('product_benefits');
                $table->string('specialty')->nullable()->after('skin_type');
                $table->string('coverage')->nullable()->after('specialty');
                $table->string('container_type')->nullable()->after('coverage');
                $table->string('country_as_labeled')->nullable()->after('container_type');
                $table->string('collection_name')->nullable()->after('country_as_labeled');
                $table->string('skin_tone')->nullable()->after('collection_name');
                $table->string('age_range_description')->nullable()->after('skin_tone');
                $table->integer('num_items')->nullable()->after('age_range_description');
                
                // Ranking & Reviews
                $table->text('best_sellers_rank')->nullable()->after('num_items');
                $table->json('full_specs')->nullable()->after('best_sellers_rank'); // Catch-all for dynamic Amazon specs
                
                $table->decimal('rating', 3, 2)->nullable()->default(0.00)->after('full_specs');
                $table->integer('review_count')->nullable()->default(0)->after('rating');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('catalog_products')) {
            Schema::table('catalog_products', function (Blueprint $table) {
                $table->dropColumn([
                    'asin', 'upc', 'gtin', 'brand_name', 'manufacturer',
                    'item_form', 'color', 'finish_type', 'product_benefits',
                    'skin_type', 'specialty', 'coverage', 'container_type',
                    'country_as_labeled', 'collection_name', 'skin_tone',
                    'age_range_description', 'num_items',
                    'best_sellers_rank', 'rating', 'review_count'
                ]);
            });
        }
    }
};
