<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CleanupOrphanedDatabases extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenant:cleanup-orphans {--dry-run} {--force}';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run') ?? false;
        $force = $this->option('force') ?? false;

        $this->info("Starting orphaned database cleanup...");
        if ($dryRun) $this->warn("DRY RUN MODE: No databases will be deleted.");

        $regionServers = config('tenant.region_servers', []);
        $knownDatabases = \App\Models\Tenant::pluck('database_name')->toArray();
        $systemDatabases = ['information_schema', 'mysql', 'performance_schema', 'sys', 'tenant_master', 'laravel_multi_tenant'];
        
        $orphansFound = 0;

        foreach ($regionServers as $region => $config) {
            $this->comment("Scanning region: {$region} ({$config['host']})...");

            try {
                // Dynamically configure a connection for this region
                config([
                    'database.connections.region_temp' => [
                        'driver' => 'mysql',
                        'host' => $config['host'],
                        'port' => $config['port'],
                        'database' => $systemDatabases[0], // Connect to a system DB initially
                        'username' => $config['username'],
                        'password' => $config['password'],
                        'charset' => 'utf8mb4',
                        'collation' => 'utf8mb4_unicode_ci',
                    ]
                ]);

                $databases = \Illuminate\Support\Facades\DB::connection('region_temp')->select('SHOW DATABASES');
                
                foreach ($databases as $db) {
                    $dbName = $db->Database;

                    // Skip system databases
                    if (in_array($dbName, $systemDatabases)) continue;

                    // Skip non-tenant databases (must start with tenant_ prefix)
                    $prefix = config('tenant.database_prefix', 'tenant_');
                    if (!str_starts_with($dbName, $prefix)) continue;

                    // Check if database is known in Master DB
                    if (!in_array($dbName, $knownDatabases)) {
                        $this->warn("ORPHANED: {$dbName} found in {$region}!");
                        $orphansFound++;

                        if (!$dryRun) {
                            if ($force || $this->confirm("Do you want to delete database {$dbName}?")) {
                                \Illuminate\Support\Facades\DB::connection('region_temp')->statement("DROP DATABASE `{$dbName}`");
                                $this->info("DELETED: {$dbName}");
                            }
                        }
                    }
                }

                \Illuminate\Support\Facades\DB::disconnect('region_temp');

            } catch (\Exception $e) {
                $this->error("Failed to scan region {$region}: " . $e->getMessage());
            }
        }

        $this->info("Cleanup finished. Total orphans found: {$orphansFound}");
    }
}
