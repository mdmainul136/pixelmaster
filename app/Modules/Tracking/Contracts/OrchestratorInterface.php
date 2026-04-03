<?php

namespace App\Modules\Tracking\Contracts;

use App\Models\Tracking\TrackingContainer;

/**
 * Orchestrator Interface — Abstracting the deployment engine.
 *
 * This allows multiple engines (Docker on VPS vs Kubernetes Pods) 
 * to handle container lifecycle management.
 */
interface OrchestratorInterface
{
    /**
     * Deploy a container with the given engine.
     */
    public function deploy(TrackingContainer $container, ?string $customDomain = null, ?string $preferredRegion = null): array;

    /**
     * Stop and remove a container.
     */
    public function stop(TrackingContainer $container): array;

    /**
     * Check health of the container.
     */
    public function healthCheck(TrackingContainer $container): array;

    /**
     * Update the primary domain for a container.
     */
    public function updateDomain(TrackingContainer $container, string $newDomain): array;

    /**
     * Add an extra tracking domain.
     */
    public function addTrackingDomain(TrackingContainer $container, string $newDomain): array;

    /**
     * Temporarily suspend a container (billing/quota).
     */
    public function suspend(TrackingContainer $container): array;

    /**
     * Resume a suspended container.
     */
    public function resume(TrackingContainer $container): array;

    /**
     * Check global health of the shared infrastructure nodes.
     */
    public function checkSharedInfraHealth(): array;
}
