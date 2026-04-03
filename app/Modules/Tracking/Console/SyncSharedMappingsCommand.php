<?php

namespace App\Modules\Tracking\Console;

use App\Models\Tracking\TrackingContainer;
use App\Modules\Tracking\Services\DockerOrchestratorService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class SyncSharedMappingsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sgtm:sync-mappings {--force : Force overwrite even if file exists}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize sGTM shared domain mappings from database to mappings.json';

    /**
     * Execute the console command.
     */
    public function handle(DockerOrchestratorService $orchestrator): int
    {
        $this->info('Starting sGTM Shared Mapping Sync...');

        $path = config('tracking.docker.mappings_path', '/etc/sgtm/mappings.json');
        
        // 1. Get all containers that qualify for shared infrastructure
        // We look for deployment_type = 'shared' OR containers on a free plan
        $containers = TrackingContainer::where('is_active', true)
            ->get()
            ->filter(function ($container) use ($orchestrator) {
                // Use the orchestrator's logic to determine if it should be in the shared mapping
                return $container->deployment_type === 'shared' || $orchestrator->isSharedInfra($container);
            });

        $this->info("Found {$containers->count()} shared containers.");

        $mappings = [];
        foreach ($containers as $container) {
            if (!$container->domain) {
                $this->warn("Skipping container #{$container->id} (No domain configured)");
                continue;
            }

            $mappings[$container->domain] = [
                'tenant_id'    => (int) $container->tenant_id,
                'container_id' => $container->container_id,
                'plan'         => $container->tenant?->plan_key ?? 'free',
            ];
            
            $this->log("Mapped: {$container->domain} -> [Tenant: {$container->tenant_id}]", 'info');
        }

        // 2. Ensure directory exists
        $dir = dirname($path);
        if (!File::exists($dir)) {
            $this->info("Creating directory: {$dir}");
            File::makeDirectory($dir, 0755, true);
        }

        // 3. Write mappings.json
        try {
            $json = json_encode($mappings, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            File::put($path, $json);
            
            $this->info("Successfully synchronized " . count($mappings) . " domains to {$path}");
            Log::info("[sGTM] Shared mappings synchronized via Artisan Command", ['path' => $path, 'count' => count($mappings)]);
            
            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $this->error("Failed to write mapping file: " . $e->getMessage());
            Log::error("[sGTM] Shared mapping sync failed", ['error' => $e->getMessage()]);
            return Command::FAILURE;
        }
    }

    private function log($msg, $level = 'info')
    {
        $this->line("<$level>$msg</$level>");
    }
}

