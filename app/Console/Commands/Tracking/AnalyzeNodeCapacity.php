<?php

namespace App\Console\Commands\Tracking;

use Illuminate\Console\Command;
use App\Models\Tracking\DockerNode;
use Illuminate\Support\Facades\Log;

class AnalyzeNodeCapacity extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tracking:monitor-nodes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Analyze Docker Node capacity per region and trigger Auto-Scaling if needed';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting Docker Node capacity analysis...');

        $threshold = \App\Models\GlobalSetting::get('tracking_auto_scale_threshold', 85);

        // Group active nodes by region
        $nodesByRegion = DockerNode::where('status', 'active')
            ->get()
            ->groupBy('region');

        if ($nodesByRegion->isEmpty()) {
            $this->warn('No active nodes found in the pool.');
            return;
        }

        foreach ($nodesByRegion as $region => $nodes) {
            $totalCapacity = $nodes->sum('max_containers');
            $currentUsage = $nodes->sum('current_containers');
            
            if ($totalCapacity == 0) continue;

            $utilization = ($currentUsage / $totalCapacity) * 100;
            
            $this->line("Region: {$region} | Nodes: {$nodes->count()} | Limit: {$totalCapacity} | In Use: {$currentUsage} | Utilization: " . round($utilization, 1) . "%");

            if ($utilization >= $threshold) {
                $this->warn("Region {$region} has crossed the {$threshold}% utilization threshold!");
                
                // Prevent duplicate scale-ups if we're already provisioning one in this region
                if (!$this->isProvisioningInProgress($region)) {
                    $this->triggerScaleUp($region, $utilization);
                } else {
                    $this->line("A scale-up is already in progress for {$region}. Skipping.");
                }
            }
        }

        $this->info('Analysis complete.');
    }

    private function isProvisioningInProgress(string $region): bool
    {
        // Check if there is already a node in this region stuck in 'pending' or 'provisioning'
        return DockerNode::where('region', $region)
            ->whereIn('status', ['provisioning', 'pending'])
            ->exists();
    }

    private function triggerScaleUp(string $region, float $utilization): void
    {
        $this->info("Dispatching ScaleUpRegionJob for region: {$region}");
        
        Log::warning("[AutoScaler] Triggering Scale Up for {$region} at {$utilization}% capacity.");
        
        // Dispatch the job that hits the AWS SDK / Webhook
        \App\Jobs\Tracking\ScaleUpRegionJob::dispatch($region);
    }
}
