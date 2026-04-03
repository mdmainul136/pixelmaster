<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Final decoupling of IOR from Ecommerce.
     * Replaces dependencies on `ec_products` with `catalog_products`.
     */
    public function up(): void
    {
        // Disable foreign key checks for the process
        Schema::disableForeignKeyConstraints();

        // 1. Rename existing price history table to ior_price_history_logs (to distinguish from ior_price_history)
        if (Schema::hasTable('ec_product_price_history')) {
            Schema::rename('ec_product_price_history', 'ior_price_history_logs');
        }

        $tablesToRenameColumn = [
            'ior_product_sources',
            'ior_product_variants',
            'ior_competitor_sources',
            'ior_price_history',
            'ior_price_history_logs', // Re-named above
        ];

        foreach ($tablesToRenameColumn as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $tableObj) use ($table) {
                    // Drop foreign key if it exists (MySQL style)
                    // We use DB::statement because column and constraint names can vary
                    try {
                        // Standard Laravel name: ior_product_sources_product_id_foreign
                        // But we'll try a generic approach
                        DB::statement("ALTER TABLE `{$table}` DROP FOREIGN KEY IF EXISTS `{$table}_product_id_foreign` ");
                    } catch (\Exception $e) {}

                    // Drop unique index if it exists (ior_product_sources had one)
                    try {
                        DB::statement("ALTER TABLE `{$table}` DROP INDEX IF EXISTS `{$table}_product_id_unique` ");
                    } catch (\Exception $e) {}

                    // Rename product_id to catalog_product_id if it exists
                    if (Schema::hasColumn($table, 'product_id') && !Schema::hasColumn($table, 'catalog_product_id')) {
                        $tableObj->renameColumn('product_id', 'catalog_product_id');
                    }
                });
            }
        }

        // 2. Add indexing/constraints to the new catalog_product_id columns
        foreach ($tablesToRenameColumn as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'catalog_product_id')) {
                Schema::table($table, function (Blueprint $tableObj) use ($table) {
                    $tableObj->index('catalog_product_id');
                });
            }
        }

        // 3. ior_foreign_orders: Add direct link to catalog_product_id if missing
        if (Schema::hasTable('ior_foreign_orders') && !Schema::hasColumn('ior_foreign_orders', 'catalog_product_id')) {
            Schema::table('ior_foreign_orders', function (Blueprint $table) {
                $table->unsignedBigInteger('catalog_product_id')->nullable()->after('product_url')->index();
            });
        }

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        // Reversal is complex, so we'll leave the columns
    }
};
