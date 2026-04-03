<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Enrich catalog_products with categories, tags, and variants for better
     * alignment with the Ecommerce product model.
     */
    public function up(): void
    {
        // This migration runs on the tenant connection (default)
        if (Schema::hasTable('catalog_products')) {
            Schema::table('catalog_products', function (Blueprint $table) {
                if (!Schema::hasColumn('catalog_products', 'category')) {
                    $table->string('category')->nullable()->after('brand');
                }
                if (!Schema::hasColumn('catalog_products', 'tags')) {
                    $table->json('tags')->nullable()->after('category');
                }
                if (!Schema::hasColumn('catalog_products', 'variants')) {
                    $table->json('variants')->nullable()->after('tags');
                }
                if (!Schema::hasColumn('catalog_products', 'source_url')) {
                    $table->string('source_url', 2048)->nullable()->after('variants');
                }
                if (!Schema::hasColumn('catalog_products', 'source_marketplace')) {
                    $table->string('source_marketplace')->nullable()->after('source_url');
                }
                if (!Schema::hasColumn('catalog_products', 'ec_product_id')) {
                    $table->unsignedBigInteger('ec_product_id')->nullable()->index()->after('source_marketplace');
                }
                if (!Schema::hasColumn('catalog_products', 'sync_status')) {
                    $table->string('sync_status')->default('none')->after('ec_product_id');
                }
                if (!Schema::hasColumn('catalog_products', 'last_synced_at')) {
                    $table->timestamp('last_synced_at')->nullable()->after('sync_status');
                }
                if (!Schema::hasColumn('catalog_products', 'approved_at')) {
                    $table->timestamp('approved_at')->nullable()->after('last_synced_at');
                }
                
                // Add soft deletes if missing
                if (!Schema::hasColumn('catalog_products', 'deleted_at')) {
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
        if (Schema::hasTable('catalog_products')) {
            Schema::table('catalog_products', function (Blueprint $table) {
                $table->dropColumn([
                    'category', 'tags', 'variants', 'source_url', 
                    'source_marketplace', 'ec_product_id', 
                    'sync_status', 'last_synced_at', 'approved_at'
                ]);
            });
        }
    }
};
