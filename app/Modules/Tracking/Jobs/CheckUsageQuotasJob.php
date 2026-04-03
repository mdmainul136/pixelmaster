<?php

namespace App\Modules\Tracking\Jobs;

use App\Models\Tracking\TrackingContainer;
use App\Modules\Tracking\Services\DockerOrchestratorService;
use App\Modules\Tracking\Services\TrackingUsageService;
use App\Mail\SgtmQuotaAlertMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class CheckUsageQuotasJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(TrackingUsageService $usageService)
    {
        Log::info("[sGTM Billing] Starting usage quota check for all containers.");

        $threshold = config('tracking.suspension_threshold', 1.1);
        $warningThreshold = 0.8;
        $containers = TrackingContainer::where('is_active', true)->get();

        foreach ($containers as $container) {
            /** @var TrackingContainer $container */
            try {
                // Switch to tenant context to get usage
                $tenant = $container->tenant;
                if (!$tenant) continue;
                
                $tenant->makeCurrent();

                $tier = $container->getPlanKey();
                $limit = config("tracking.tiers.{$tier}.event_limit", 10000);
                $suspensionLimit = $limit * $threshold;

                $usage = $usageService->getUsageForBilling($container->id, now()->startOfMonth()->toDateString());
                $totalReceived = $usage['events_received'] ?? 0;
                $ratio = $totalReceived / $limit;

                // Check for 80% warning
                if ($ratio >= $warningThreshold && $ratio < $threshold) {
                    $cacheKey = "sgtm_quota_warning_{$container->id}_" . date('Y_m');
                    if (!Cache::has($cacheKey)) {
                        Mail::to($tenant->email)->send(new SgtmQuotaAlertMail($tenant, 'warning', $totalReceived, $limit));
                        Cache::put($cacheKey, true, now()->addDays(32));
                        Log::info("[sGTM Billing] Warning email sent to tenant: {$tenant->id} at {$totalReceived} events.");
                    }
                }

                if ($totalReceived >= $suspensionLimit) {
                    Log::warning("[sGTM Billing] Container {$container->container_id} (Tenant: {$tenant->id}) exceeded quota: {$totalReceived} / {$suspensionLimit}. Suspending...");
                    
                    $orchestrator = $this->getOrchestrator($container);
                    $orchestrator->suspend($container);
                    
                    // TODO: Dispatch Email/Notification to user
                }
            } catch (\Exception $e) {
                Log::error("[sGTM Billing] Error checking quota for container {$container->id}: " . $e->getMessage());
            } finally {
                // Revert to central or just continue (tenancy usually handles this in loops if configured)
            }
        }

        Log::info("[sGTM Billing] Usage quota check completed.");
    }

    protected function getOrchestrator(TrackingContainer $container)
    {
        $type = $container->deployment_type ?? 'docker_vps';
        return match ($type) {
            'kubernetes' => app(\App\Modules\Tracking\Services\KubernetesOrchestratorService::class),
            default       => app(\App\Modules\Tracking\Services\DockerOrchestratorService::class),
        };
    }
}
