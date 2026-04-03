<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('inv_suppliers')) {
            if (!Schema::hasColumn('inv_suppliers', 'is_active')) {
                Schema::table('inv_suppliers', function (Blueprint $table) {
                    $table->boolean('is_active')->default(true)->after('currency');
                });
            }
            
            // Sync status to is_active if status exists
            if (Schema::hasColumn('inv_suppliers', 'status')) {
                DB::table('inv_suppliers')
                    ->whereIn('status', ['active', 'Active'])
                    ->update(['is_active' => true]);
                
                DB::table('inv_suppliers')
                    ->whereIn('status', ['inactive', 'Inactive', 'blacklisted'])
                    ->update(['is_active' => false]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('inv_suppliers') && Schema::hasColumn('inv_suppliers', 'is_active')) {
            Schema::table('inv_suppliers', function (Blueprint $table) {
                $table->dropColumn('is_active');
            });
        }
    }
};
