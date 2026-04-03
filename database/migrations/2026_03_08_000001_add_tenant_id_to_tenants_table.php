<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds 'tenant_id' as an alias/duplicate of 'id' in the central tenants table.
     * This fixes 1054 "Unknown column 'tenants.tenant_id'" errors in legacy or package queries.
     */
    public function up(): void
    {
        if (Schema::connection('central')->hasTable('tenants')) {
            Schema::connection('central')->table('tenants', function (Blueprint $table) {
                if (!Schema::connection('central')->hasColumn('tenants', 'tenant_id')) {
                    // Add tenant_id after id to keep it clean
                    $table->string('tenant_id')->nullable()->after('id');
                    $table->index('tenant_id');
                }
            });

            // Sync values: tenant_id = id
            DB::connection('central')->statement("UPDATE tenants SET tenant_id = id WHERE tenant_id IS NULL");
            
            // Re-apply unique if necessary (careful with existing data)
            // But usually just sync is enough for identification.
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::connection('central')->hasTable('tenants')) {
            Schema::connection('central')->table('tenants', function (Blueprint $table) {
                if (Schema::connection('central')->hasColumn('tenants', 'tenant_id')) {
                    $table->dropColumn('tenant_id');
                }
            });
        }
    }
};
