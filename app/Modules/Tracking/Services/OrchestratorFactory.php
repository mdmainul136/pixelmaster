<?php

namespace App\Modules\Tracking\Services;

use Illuminate\Support\Facades\Log;
use App\Models\Tracking\TrackingContainer;

/**
 * OrchestratorFactory
 *
 * Returns the correct orchestrator service based on the
 * TRACKING_ORCHESTRATOR env variable.
 *
 * Usage in TrackingController:
 *   $orchestrator = OrchestratorFactory::make();
 *   $orchestrator->deploy($container);
 *
 * Switch modes in .env:
 *   TRACKING_ORCHESTRATOR=docker   → DockerOrchestratorService (< 500 tenants)
 *   TRACKING_ORCHESTRATOR=k8s      → KubernetesOrchestratorService (10K+ tenants)
 *
 * Zero code changes in controllers — just flip the env var.
 */
class OrchestratorFactory
{
    /**
     * Returns the correct orchestrator service based on the container type.
     */
    public static function make(TrackingContainer $container): DockerOrchestratorService|KubernetesOrchestratorService
    {
        // 1. Check if the specific container is explicitly marked for Kubernetes
        if ($container->deployment_type === 'kubernetes') {
            return app(KubernetesOrchestratorService::class);
        }

        // 2. Global fallback mode via ENV (for backward compatibility or global overrides)
        $mode = env('TRACKING_ORCHESTRATOR', 'docker');

        if ($mode === 'k8s') {
            return app(KubernetesOrchestratorService::class);
        }

        // 3. Default to Docker VPS
        return app(DockerOrchestratorService::class);
    }
}
