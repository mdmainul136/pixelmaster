<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Fix plan_level enum to include 'core' tier.
     * The module engine uses core/pro/enterprise but the enum only had basic/pro/enterprise.
     */
    public function up(): void
    {
        // Step 1: Convert existing 'basic' to 'core'
        DB::connection('mysql')->statement(
            "ALTER TABLE tenant_modules MODIFY COLUMN plan_level ENUM('core','basic','pro','enterprise') NOT NULL DEFAULT 'core'"
        );

        // Step 2: Migrate existing 'basic' records to 'core'
        DB::connection('mysql')->table('tenant_modules')
            ->where('plan_level', 'basic')
            ->update(['plan_level' => 'core']);

        // Step 3: Remove 'basic' from enum (now safe since all records are 'core')
        DB::connection('mysql')->statement(
            "ALTER TABLE tenant_modules MODIFY COLUMN plan_level ENUM('core','pro','enterprise') NOT NULL DEFAULT 'core'"
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::connection('mysql')->statement(
            "ALTER TABLE tenant_modules MODIFY COLUMN plan_level ENUM('basic','core','pro','enterprise') NOT NULL DEFAULT 'basic'"
        );

        DB::connection('mysql')->table('tenant_modules')
            ->where('plan_level', 'core')
            ->update(['plan_level' => 'basic']);

        DB::connection('mysql')->statement(
            "ALTER TABLE tenant_modules MODIFY COLUMN plan_level ENUM('basic','pro','enterprise') NOT NULL DEFAULT 'basic'"
        );
    }
};
