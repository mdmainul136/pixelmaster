<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class Fix3TierPlanLevels extends Command
{
    protected $signature = 'plans:fix-3tier';
    protected $description = 'Fix plan_level values in tenant_modules for 3-tier architecture';

    public function handle(): int
    {
        $this->info('Fixing plan_level values for 3-tier architecture...');

        $mappings = [
            'core'       => 'starter',
            'basic'      => 'starter',
            'free'       => 'starter',
            'business'   => 'pro',
            'enterprise' => 'pro',
        ];

        foreach ($mappings as $old => $new) {
            $affected = DB::table('tenant_modules')
                ->where('plan_level', $old)
                ->update(['plan_level' => $new]);

            if ($affected > 0) {
                $this->line("  ✓ tenant_modules: {$affected} rows: {$old} → {$new}");
            }
        }

        // Fix module_migrations table
        try {
            $a1 = DB::table('module_migrations')->where('plan_level', 'core')->update(['plan_level' => 'starter']);
            $a2 = DB::table('module_migrations')->where('plan_level', 'enterprise')->update(['plan_level' => 'pro']);
            if ($a1 > 0) $this->line("  ✓ module_migrations: {$a1} rows: core → starter");
            if ($a2 > 0) $this->line("  ✓ module_migrations: {$a2} rows: enterprise → pro");
        } catch (\Exception $e) {
            $this->warn("  Skipped module_migrations: " . $e->getMessage());
        }

        // Show final state
        $this->newLine();
        $this->info('Final plan_level distribution:');
        
        $result = DB::table('tenant_modules')
            ->select('plan_level', DB::raw('count(*) as cnt'))
            ->groupBy('plan_level')
            ->get();

        foreach ($result as $row) {
            $this->line("  {$row->plan_level}: {$row->cnt} modules");
        }

        $this->newLine();
        $this->info('✅ 3-Tier plan levels fixed successfully!');

        return Command::SUCCESS;
    }
}
