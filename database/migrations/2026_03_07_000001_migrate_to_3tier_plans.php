<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Migrate existing tenants from 4-tier (starter/pro/business/enterprise)
 * to 3-tier (starter/growth/pro) plan architecture.
 *
 * Mapping:
 *   starter     → starter (no change)
 *   pro         → growth
 *   business    → pro
 *   professional→ pro
 *   enterprise  → pro
 */
return new class extends Migration
{
    public function up(): void
    {
        // ─── Step 1: Alter tenant_modules ENUM to include new values ───
        DB::connection('mysql')->statement(
            "ALTER TABLE tenant_modules MODIFY COLUMN plan_level ENUM('core','basic','pro','enterprise','starter','growth') NOT NULL DEFAULT 'starter'"
        );

        // ─── Step 2: Migrate tenants plan column ───
        $mappings = [
            'pro'          => 'growth',
            'business'     => 'pro',
            'professional' => 'pro',
            'enterprise'   => 'pro',
        ];

        foreach ($mappings as $oldPlan => $newPlan) {
            $affected = DB::table('tenants')
                ->where('plan', $oldPlan)
                ->update([
                    'plan' => $newPlan,
                    'updated_at' => now(),
                ]);

            if ($affected > 0) {
                Log::info("3-Tier Migration: Migrated {$affected} tenants from '{$oldPlan}' → '{$newPlan}'");
            }
        }

        // ─── Step 3: Update db_limit_gb to match new plan limits ───
        $planLimits = [
            'starter' => 2,
            'growth'  => 10,
            'pro'     => 50,
        ];

        foreach ($planLimits as $plan => $limit) {
            DB::table('tenants')
                ->where('plan', $plan)
                ->update(['db_limit_gb' => $limit]);
        }

        // ─── Step 4: Update tenant_modules plan_level values ───
        $moduleMappings = [
            'core'       => 'starter',
            'basic'      => 'starter',
            'enterprise' => 'pro',
        ];

        foreach ($moduleMappings as $oldLevel => $newLevel) {
            $affected = DB::table('tenant_modules')
                ->where('plan_level', $oldLevel)
                ->update(['plan_level' => $newLevel]);

            if ($affected > 0) {
                Log::info("3-Tier Migration: Updated {$affected} module records from '{$oldLevel}' → '{$newLevel}'");
            }
        }

        // ─── Step 5: Finalize ENUM — remove old values ───
        DB::connection('mysql')->statement(
            "ALTER TABLE tenant_modules MODIFY COLUMN plan_level ENUM('starter','growth','pro') NOT NULL DEFAULT 'starter'"
        );

        // ─── Step 6: Update module_migrations table if exists ───
        try {
            DB::connection('mysql')->table('module_migrations')
                ->where('plan_level', 'core')
                ->update(['plan_level' => 'starter']);
            DB::connection('mysql')->table('module_migrations')
                ->where('plan_level', 'enterprise')
                ->update(['plan_level' => 'pro']);
        } catch (\Exception $e) {
            Log::info('module_migrations update skipped: ' . $e->getMessage());
        }

        Log::info('3-Tier Plan Migration completed successfully.');
    }

    public function down(): void
    {
        // Restore old ENUM with all values
        DB::connection('mysql')->statement(
            "ALTER TABLE tenant_modules MODIFY COLUMN plan_level ENUM('core','basic','pro','enterprise','starter','growth') NOT NULL DEFAULT 'core'"
        );

        // Reverse tenant_modules plan_level
        DB::table('tenant_modules')->where('plan_level', 'starter')->update(['plan_level' => 'core']);
        DB::table('tenant_modules')->where('plan_level', 'growth')->update(['plan_level' => 'pro']);

        // Remove new values from ENUM
        DB::connection('mysql')->statement(
            "ALTER TABLE tenant_modules MODIFY COLUMN plan_level ENUM('core','pro','enterprise') NOT NULL DEFAULT 'core'"
        );

        // Reverse tenant plan names
        DB::table('tenants')->where('plan', 'growth')->update(['plan' => 'pro', 'updated_at' => now()]);

        // Restore old plan limits
        DB::table('tenants')->where('plan', 'starter')->update(['db_limit_gb' => 5]);
        DB::table('tenants')->where('plan', 'pro')->update(['db_limit_gb' => 10]);

        Log::info('3-Tier Plan Migration rolled back.');
    }
};
