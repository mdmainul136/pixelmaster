<?php

namespace App\Modules\Tracking\Jobs;

use App\Models\Tracking\TrackingContainer;
use App\Modules\Tracking\Services\MetabaseDashboardService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * ProvisionMetabaseDashboardJob
 *
 * Calls MetabaseDashboardService::provision() to auto-create a tenant dashboard.
 * Wrapped in tenancy()->run() to ensure it finds the correct container record.
 *
 * Queue: 'tracking-infra'
 * Retries: 5 (with increasing backoff)
 */
class ProvisionMetabaseDashboardJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int   $tries   = 5;
    public array $backoff = [30, 60, 120, 300, 600];
    public int   $timeout = 60;

    public function __construct(
        private readonly int $containerId, 
        private readonly string $tenantId
    ) {
        $this->onQueue('tracking-infra');
    }

    public function handle(MetabaseDashboardService $metabase): void
    {
        // 1. Initialize Tenancy for this background job
        $tenant = \App\Models\Tenant::find($this->tenantId);

        if (!$tenant) {
            Log::error('[Metabase] Tenant not found, skipping provisioning', [
                'tenant_id'    => $this->tenantId,
                'container_id' => $this->containerId,
            ]);
            return;
        }

        // 2. Run provisioning within the tenant context
        $tenant->run(function () use ($metabase) {
            $container = TrackingContainer::find($this->containerId);

            if (!$container) {
                Log::warning('[Metabase] Container not found in tenant database, skipping provisioning', [
                    'tenant_id'    => $this->tenantId,
                    'container_id' => $this->containerId,
                ]);
                return;
            }

            $success = $metabase->provision($container);

            if (!$success) {
                // Will trigger retry via backoff
                throw new \RuntimeException("Metabase provisioning failed for container {$this->containerId} in tenant {$this->tenantId}");
            }
        });
    }

    public function failed(\Throwable $e): void
    {
        Log::error('[Metabase] Provisioning permanently failed after all retries', [
            'tenant_id'    => $this->tenantId,
            'container_id' => $this->containerId,
            'error'        => $e->getMessage(),
        ]);
    }
}
