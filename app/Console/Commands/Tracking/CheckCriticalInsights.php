<?php

namespace App\Console\Commands\Tracking;

use Illuminate\Console\Command;
use App\Models\Tracking\TrackingContainer;
use App\Modules\Tracking\Services\AiAdvisorService;
use App\Notifications\CriticalInsightNotification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class CheckCriticalInsights extends Command
{
    /**
     * The name and signature of the console command.
     * @var string
     */
    protected $signature = 'tracking:check-insights';

    /**
     * The console command description.
     * @var string
     */
    protected $description = 'Scan all tracking containers for critical AI insights and notify owners.';

    /**
     * Execute the console command.
     */
    public function handle(AiAdvisorService $advisor)
    {
        $this->info('Starting global tracking insight scan...');

        // In a multi-tenant setup, we usually iterate through tenants.
        // For this implementation, we get all active containers across all tenants.
        $containers = TrackingContainer::all();

        foreach ($containers as $container) {
            $this->comment("Checking Container #{$container->id} ({$container->name})...");

            try {
                $insights = $advisor->getInsights($container);
                $criticalList = array_filter($insights, fn($i) => $i['severity'] === 'Critical');

                if (!empty($criticalList)) {
                    $this->warn("Found " . count($criticalList) . " critical issues for {$container->name}. Notify owner...");
                    
                    // Identify the owner (tenant admin)
                    $owner = User::where('tenant_id', $container->tenant_id)
                        ->where('role', 'admin')
                        ->first();

                    if ($owner) {
                        foreach ($criticalList as $insight) {
                            $owner->notify(new CriticalInsightNotification($insight, $container->name));
                        }
                        $this->info("Notifications sent to {$owner->email}.");
                    } else {
                        $this->error("No admin found for Tenant #{$container->tenant_id}. Skipping notification.");
                    }
                }
            } catch (\Exception $e) {
                $this->error("Failed to process Container #{$container->id}: " . $e->getMessage());
                Log::error("[AI Advisor] Scheduled check failed for Container #{$container->id}", ['error' => $e->getMessage()]);
            }
        }

        $this->info('Global scan complete.');
    }
}
