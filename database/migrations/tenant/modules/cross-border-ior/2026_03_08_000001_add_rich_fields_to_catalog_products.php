<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Enrich catalog_products for the IOR → Ecommerce pipeline.
 * Adds category, tags, variants, source tracking, and ecommerce linkage.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('catalog_products')) {
            return; // Table doesn't exist for this tenant (non-IOR)
        }

        Schema::table('catalog_products', function (Blueprint $table) {
            // Rich product data from scraping
            if (!Schema::hasColumn('catalog_products', 'category')) {
                $table->string('category')->nullable()->after('product_type');
            }
            if (!Schema::hasColumn('catalog_products', 'tags')) {
                $table->json('tags')->nullable()->after('category');
            }
            if (!Schema::hasColumn('catalog_products', 'variants')) {
                $table->json('variants')->nullable()->after('tags');
            }

            // Source tracking
            if (!Schema::hasColumn('catalog_products', 'source_url')) {
                $table->string('source_url', 2000)->nullable()->after('attributes');
            }
            if (!Schema::hasColumn('catalog_products', 'source_marketplace')) {
                $table->string('source_marketplace', 50)->nullable()->after('source_url');
            }

            // Ecommerce linkage
            if (!Schema::hasColumn('catalog_products', 'ec_product_id')) {
                $table->unsignedBigInteger('ec_product_id')->nullable()->after('source_marketplace');
                $table->index('ec_product_id');
            }

            // Sync management
            if (!Schema::hasColumn('catalog_products', 'sync_status')) {
                $table->string('sync_status', 20)->default('none')->after('ec_product_id'); // none | active | paused
            }
            if (!Schema::hasColumn('catalog_products', 'last_synced_at')) {
                $table->timestamp('last_synced_at')->nullable()->after('sync_status');
            }
            if (!Schema::hasColumn('catalog_products', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('last_synced_at');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('catalog_products')) {
            return;
        }

        Schema::table('catalog_products', function (Blueprint $table) {
            $cols = ['category', 'tags', 'variants', 'source_url', 'source_marketplace',
                     'ec_product_id', 'sync_status', 'last_synced_at', 'approved_at'];
            $table->dropColumn(array_filter($cols, fn($c) => Schema::hasColumn('catalog_products', $c)));
        });
    }
};
