<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Services\DatabaseManager;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class TenantsMigrate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:tenants-migrate 
                            {--tenant= : Run for a specific tenant ID} 
                            {--module= : Run migrations only for a specific module}
                            {--fresh : Wipe and re-migrate} 
                            {--seed : Seed after migration} 
                            {--path= : Custom migration path}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run migrations for all tenant databases or a specific one, including active modules.';

    protected DatabaseManager $databaseManager;

    /**
     * Create a new command instance.
     */
    public function __construct(DatabaseManager $databaseManager)
    {
        parent::__construct();
        $this->databaseManager = $databaseManager;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tenantId = $this->option('tenant');
        $moduleKey = $this->option('module');
        
        if ($tenantId) {
            $tenants = Tenant::where('id', $tenantId)->get();
            if ($tenants->isEmpty()) {
                $this->error("Tenant '{$tenantId}' not found.");
                return 1;
            }
        } else {
            $tenants = Tenant::where('status', 'active')->get();
        }

        if ($tenants->isEmpty()) {
            $this->info('No active tenants found to migrate.');
            return 0;
        }

        $this->info("Found {$tenants->count()} tenant(s). Starting migration engine...");

        foreach ($tenants as $tenant) {
            $this->line("\n=========================================");
            $this->info("⚙️ Processing Tenant: {$tenant->id}");
            $this->line("Database: {$tenant->database_name}");
            $this->line("=========================================");

            try {
                // 1. Run Base Migrations (Standard Tenant Tables)
                if (!$moduleKey) {
                    $this->info("Running Base Tenant Migrations...");
                    $this->databaseManager->switchToTenantDatabase($tenant->id);
                    
                    $basePaths = ['database/migrations/tenant'];
                    if ($this->option('path')) {
                        $basePaths = [$this->option('path')];
                    }

                    $command = $this->option('fresh') ? 'migrate:fresh' : 'migrate';
                    
                    Artisan::call($command, [
                        '--database' => 'tenant_dynamic',
                        '--path' => $basePaths,
                        '--force' => true,
                    ]);

                    $this->line(Artisan::output());
                    $this->info("✓ Base migrations completed.");
                }


                // 3. Seeding (Optional)
                if ($this->option('seed')) {
                    $this->info("Seeding tenant data...");
                    $this->databaseManager->switchToTenantDatabase($tenant->id);
                    Artisan::call('db:seed', [
                        '--database' => 'tenant_dynamic',
                        '--class' => 'Database\Seeders\TenantDatabaseSeeder',
                        '--force' => true,
                    ]);
                    $this->line(Artisan::output());
                }

            } catch (\Exception $e) {
                $this->error("✗ General Error for tenant {$tenant->id}: " . $e->getMessage());
                Log::error("Tenant migration error ({$tenant->id}): " . $e->getMessage());
            }
        }

        $this->line("\n-----------------------------------------");
        $this->info("🚀 All tenant migrations and module seeds processed.");
        $this->line("-----------------------------------------");

        return 0;
    }

}


