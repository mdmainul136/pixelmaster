<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;
use App\Models\Sanctum\PersonalAccessToken;
use App\Modules\Tracking\Contracts\OrchestratorInterface;
use App\Modules\Tracking\Services\DockerOrchestratorService;
use App\Modules\Tracking\Services\KubernetesOrchestratorService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // 🏗️ ORCHESTRATOR BINDING:
        // Dynamically bind the correct deployment engine based on ENV.
        // docker = Standalone VPS (low-medium scale)
        // k8s    = AWS EKS / Kubernetes (enterprise scale)
        $this->app->singleton(OrchestratorInterface::class, function ($app) {
            $mode = env('TRACKING_ORCHESTRATOR', 'docker');
            
            if ($mode === 'k8s') {
                return $app->make(KubernetesOrchestratorService::class);
            }
            
            return $app->make(DockerOrchestratorService::class);
        });
    }

    public function boot(): void
    {
        // 🗳️ CENTRAL AUTH PROTECTION:
        // Ensure Sanctum tokens are ALWAYS stored in the central database
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);

        // 📝 GLOBAL LOGIN AUDIT:
        // Automatically inject Login audit trails into the user history schema.
        \Illuminate\Support\Facades\Event::listen(
            \Illuminate\Auth\Events\Login::class,
            \App\Listeners\LogSuccessfulLogin::class
        );

        // 🚀 GLOBAL QUEUE PROTECTION:
        // Automatically switch tenant DB context for every queued job that is TenantAware
        \Illuminate\Support\Facades\Queue::before(function (\Illuminate\Queue\Events\JobProcessing $event) {
            $job = $event->job->getRawBody();
            $data = json_decode($job, true);
            
            if (isset($data['data']['command'])) {
                $command = unserialize($data['data']['command']);
                if (method_exists($command, 'applyTenantContext')) {
                    $command->applyTenantContext();
                    \Illuminate\Support\Facades\Log::info("Global Queue Guard: Applied tenant context for job " . get_class($command));
                }
            }
        });

        // 🔐 TENANT-AWARE RATE LIMITER:
        // Hardens API by limiting requests per tenant to prevent noisy neighbors
        \Illuminate\Support\Facades\RateLimiter::for('api', function (\Illuminate\Http\Request $request) {
            $tenantId = $request->header('X-Tenant-ID') ?: 'global';
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by($tenantId . $request->ip());
        });

        // 🛡️ DDOS PROTECTION FOR KAFKA EVENT INGESTION:
        // 6000 Events per minute = 100 req/sec. Prevents botnets from crashing ClickHouse/Kafka.
        \Illuminate\Support\Facades\RateLimiter::for('tenant_tracking', function (\Illuminate\Http\Request $request) {
            $token = $request->bearerToken() ?? $request->header('X-PM-Api-Key') ?? $request->ip();
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(6000)->by($token);
        });

        // ⚙️ GLOBAL CONFIG OVERRIDES:
        // Dynamically apply settings from the database to Laravel's runtime config
        \App\Services\ConfigOverrideService::apply();
    }
}
