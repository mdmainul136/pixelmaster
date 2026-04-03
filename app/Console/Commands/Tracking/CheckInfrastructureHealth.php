<?php

namespace App\Console\Commands\Tracking;

use App\Modules\Tracking\Services\DockerNodeManager;
use App\Modules\Tracking\Services\CapiDiagnosticsService;
use App\Models\Tracking\TrackingContainer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckInfrastructureHealth extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tracking:health';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Perform a global health check on all Docker nodes in the tracking pool';

    /**
     * Execute the console command.
     */
    public function handle(DockerNodeManager $nodeManager, CapiDiagnosticsService $diagnostics): int
    {
        $this->info('Starting global health check on tracking nodes...');
        
        try {
            // ── 1. Node Infrastructure Health ──
            $results = $nodeManager->healthCheckAll();
            
            $this->table(
                ['Nodes Healthy', 'Nodes Unhealthy'],
                [[$results['healthy'], $results['unhealthy']]]
            );

            // ── 2. Dataset Match Quality Health (EMQ) ──
            $this->info('Monitoring Dataset Quality (EMQ)...');
            $containers = TrackingContainer::where('is_active', true)->get();
            $qualityWarnings = 0;

            foreach ($containers as $container) {
                $emq = $diagnostics->calculateEmqScore($container);
                
                if ($emq['score'] < 5.0) {
                    $qualityWarnings++;
                    Log::warning("[Diagnostics] Poor EMQ Score detected on Container #{$container->id}", [
                        'score' => $emq['score'],
                        'rating' => $emq['rating']
                    ]);
                }
            }

            Log::info('[Infrastructure] Global health check completed', [
                'healthy_nodes'    => $results['healthy'],
                'unhealthy_nodes'  => $results['unhealthy'],
                'quality_warnings' => $qualityWarnings,
            ]);

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Health check failed: ' . $e->getMessage());
            Log::error('[Infrastructure] Global health check failed', ['error' => $e->getMessage()]);
            return Command::FAILURE;
        }
    }
}
