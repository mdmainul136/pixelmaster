<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Refactor central tenants table to remove legacy/redundant columns.
     */
    public function up(): void
    {
        Schema::connection('central')->table('tenants', function (Blueprint $table) {
            // 1. Remove redundancy
            if (Schema::connection('central')->hasColumn('tenants', 'region')) {
                $table->dropColumn('region');
            }
            if (Schema::connection('central')->hasColumn('tenants', 'temp_password')) {
                $table->dropColumn('temp_password');
            }
            if (Schema::connection('central')->hasColumn('tenants', 'subscription_tier')) {
                $table->dropColumn('subscription_tier');
            }

            // 2. Add defaults/cleanup
            $table->string('primary_color', 20)->default('#3b82f6')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('central')->table('tenants', function (Blueprint $table) {
            $table->string('region')->nullable();
            $table->string('temp_password')->nullable();
            $table->enum('subscription_tier', ['free', 'pro', 'enterprise'])->default('free')->nullable();
        });
    }
};
