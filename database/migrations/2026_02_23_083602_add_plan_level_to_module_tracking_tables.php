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
        Schema::connection('mysql')->table('tenant_modules', function (Blueprint $table) {
            $table->enum('plan_level', ['basic', 'pro', 'enterprise'])->default('basic')->after('module_id');
        });

        Schema::connection('mysql')->table('module_migrations', function (Blueprint $table) {
            $table->enum('plan_level', ['basic', 'pro', 'enterprise'])->default('basic')->after('module_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mysql')->table('tenant_modules', function (Blueprint $table) {
            $table->dropColumn('plan_level');
        });

        Schema::connection('mysql')->table('module_migrations', function (Blueprint $table) {
            $table->dropColumn('plan_level');
        });
    }
};
