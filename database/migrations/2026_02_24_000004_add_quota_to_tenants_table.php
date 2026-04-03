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
        Schema::connection('central')->table('tenants', function (Blueprint $table) {
            // Plan & Quota
            if (!Schema::connection('central')->hasColumn('tenants', 'plan')) {
                $table->string('plan')->default('starter')->after('id');
            }
            
            if (!Schema::connection('central')->hasColumn('tenants', 'db_limit_gb')) {
                $table->decimal('db_limit_gb', 8, 3)->default(5.000)->after('plan');
            }

            if (!Schema::connection('central')->hasColumn('tenants', 'trial_ends_at')) {
                $table->timestamp('trial_ends_at')->nullable()->after('db_limit_gb');
            }
            
            // Note: status already exists, we leave it as is to avoid change() issues
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('central')->table('tenants', function (Blueprint $table) {
            $table->dropColumn(['plan', 'db_limit_gb', 'trial_ends_at']);
            // status remains but we don't necessarily revert the enum change to string as it's complex
        });
    }
};
