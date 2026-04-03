<?php

namespace App\Modules\Tracking\Console;

use App\Modules\Tracking\Services\DockerNodeManager;
use Illuminate\Console\Command;

/**
 * Register a new AWS EC2 node into the Docker node pool.
 *
 * Usage:
 *   php artisan tracking:register-node 1.2.3.4 --name=aws-node-01 --region=us-east-1
 */
class NodeRegisterCommand extends Command
{
    protected $signature = 'tracking:register-node
        {host : IP address or hostname of the EC2 instance}
        {--name= : Friendly name for the node (default: auto-generated)}
        {--region=us-east-1 : AWS region}
        {--ssh-port=22 : SSH port}
        {--max=50 : Maximum containers on this node}
        {--cpu-cores= : Number of CPU cores}
        {--memory-gb= : Memory in GB}';

    protected $description = 'Register a new AWS EC2 node into the Docker tracking node pool';

    public function handle(DockerNodeManager $nodeManager): int
    {
        $host   = $this->argument('host');
        $name   = $this->option('name') ?? 'node-' . substr(md5($host), 0, 6);
        $region = $this->option('region');

        $this->info("Registering node {$name} ({$host}) in {$region}...");

        try {
            $node = $nodeManager->registerNode($name, $host, [
                'region'         => $region,
                'ssh_port'       => (int) $this->option('ssh-port'),
                'max_containers' => (int) $this->option('max'),
                'cpu_cores'      => $this->option('cpu-cores') ? (int) $this->option('cpu-cores') : null,
                'memory_gb'      => $this->option('memory-gb') ? (int) $this->option('memory-gb') : null,
            ]);

            $this->table(
                ['ID', 'Name', 'Host', 'Region', 'Status', 'Max Containers'],
                [[$node->id, $node->name, $node->host, $node->region, $node->status, $node->max_containers]]
            );

            if ($node->status === 'offline') {
                $this->warn("⚠ Node registered but SSH connection failed — status set to 'offline'");
            } else {
                $this->info("✔ Node registered successfully");
            }

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Failed to register node: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }
}
