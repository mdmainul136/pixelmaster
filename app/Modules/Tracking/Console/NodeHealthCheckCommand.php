<?php

namespace App\Modules\Tracking\Console;

use App\Modules\Tracking\Services\DockerNodeManager;
use Illuminate\Console\Command;

/**
 * Health check all Docker nodes in the pool.
 *
 * Usage:
 *   php artisan tracking:node-health
 *
 * Schedule (in Kernel.php):
 *   $schedule->command('tracking:node-health')->everyFiveMinutes();
 */
class NodeHealthCheckCommand extends Command
{
    protected $signature = 'tracking:node-health
        {--node= : Check a specific node by ID (optional, defaults to all)}';

    protected $description = 'Run health check on all Docker tracking nodes';

    public function handle(DockerNodeManager $nodeManager): int
    {
        $this->info('Running node health checks...');
        $this->newLine();

        $results = $nodeManager->healthCheckAll();

        if (empty($results['details'])) {
            $this->warn('No nodes found in the pool. Use tracking:register-node to add nodes.');
            return Command::SUCCESS;
        }

        $rows = collect($results['details'])->map(function ($detail) {
            return [
                $detail['node_id'],
                $detail['name'],
                $detail['host'],
                $detail['healthy'] ? '✔ Healthy' : '✖ Unhealthy',
                $detail['status'],
                "{$detail['containers']}/{$detail['max_containers']}",
                number_format($detail['cpu_percent'], 1) . '%',
                number_format($detail['memory_percent'], 1) . '%',
                number_format($detail['disk_percent'], 1) . '%',
            ];
        })->toArray();

        $this->table(
            ['ID', 'Name', 'Host', 'Health', 'Status', 'Containers', 'CPU', 'Memory', 'Disk'],
            $rows
        );

        $this->newLine();
        $this->info("Summary: {$results['healthy']} healthy, {$results['unhealthy']} unhealthy");

        return $results['unhealthy'] > 0 ? Command::FAILURE : Command::SUCCESS;
    }
}
