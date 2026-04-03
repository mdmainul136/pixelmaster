<?php

namespace App\Modules\Tracking\Jobs;

use App\Models\Tracking\TrackingContainer;
use App\Modules\Tracking\Services\DockerOrchestratorService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RequestSslJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [300, 600, 1200]; // Retry after 5m, 10m, 20m for DNS propagation

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected int $containerId,
        protected string $domain
    ) {}

    /**
     * Execute the job.
     */
    public function handle(DockerOrchestratorService $orchestrator): void
    {
        $container = TrackingContainer::find($this->containerId);
        if (!$container) return;

        Log::info("[sGTM SSL] Requesting SSL for {$this->domain} (Container #{$this->containerId})");

        $result = $orchestrator->requestSsl($this->domain);

        if ($result['ssl'] === 'issued') {
            $settings = $container->settings ?? [];
            $settings['ssl_status'] = 'issued';
            $settings['ssl_issued_at'] = now()->toDateTimeString();
            
            $container->update(['settings' => $settings]);
            
            Log::info("[sGTM SSL] Successfully issued SSL for {$this->domain}");
        } else {
            Log::warning("[sGTM SSL] SSL issuance failed for {$this->domain}. Retrying if possible...");
            
            // Log the error for the user in settings
            $settings = $container->settings ?? [];
            $settings['ssl_status'] = 'failed';
            $settings['ssl_last_error'] = 'Certbot verification failed. Ensure DNS (A record) points to this server.';
            $container->update(['settings' => $settings]);

            throw new \RuntimeException("Certbot failed for domain: {$this->domain}");
        }
    }
}
