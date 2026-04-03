<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Add `source` column to tenant_modules for hybrid pricing.
     * - blueprint:    Auto-activated during onboarding (free, locked)
     * - marketplace:  Manually installed from marketplace (paid/free, removable)
     * - trial:        14-day free trial
     * - admin:        Manually activated by super-admin
     */
    public function up(): void
    {
        Schema::connection('mysql')->table('tenant_modules', function (Blueprint $table) {
            if (!Schema::connection('mysql')->hasColumn('tenant_modules', 'source')) {
                $table->enum('source', ['blueprint', 'marketplace', 'trial', 'admin'])
                      ->default('blueprint')
                      ->after('plan_level');
            }
            if (!Schema::connection('mysql')->hasColumn('tenant_modules', 'price_paid')) {
                $table->decimal('price_paid', 10, 2)->nullable()->after('source');
            }
        });

        // Backfill: all existing records are blueprint-sourced
        DB::connection('mysql')->table('tenant_modules')
            ->whereNull('source')
            ->orWhere('source', '')
            ->update(['source' => 'blueprint']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mysql')->table('tenant_modules', function (Blueprint $table) {
            $table->dropColumn(['source', 'price_paid']);
        });
    }
};
