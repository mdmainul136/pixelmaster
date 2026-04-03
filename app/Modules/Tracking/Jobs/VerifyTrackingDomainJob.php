<?php

namespace App\Modules\Tracking\Jobs;

use App\Models\TenantDomain;
use App\Models\Tracking\TrackingContainer;
use App\Modules\Tracking\Services\DockerOrchestratorService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class VerifyTrackingDomainJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job to verify pending custom tracking domains.
     */
    public function handle(DockerOrchestratorService $orchestrator): void
    {
        $pendingDomains = TenantDomain::where('purpose', 'tracking')
            ->where('status', 'pending')
            ->get();

        if ($pendingDomains->isEmpty()) {
            return;
        }

        $cnameTarget = config('tracking.cname_target', 'tracking.yoursaas.com');

        foreach ($pendingDomains as $tenantDomain) {
            /** @var TenantDomain $tenantDomain */
            $domainName = $tenantDomain->domain;
            
            Log::info("[sGTM Domain] Verifying DNS for: {$domainName}");

            if ($this->verifyDns($domainName, $cnameTarget, $tenantDomain->verification_token)) {
                $this->activateDomain($tenantDomain, $orchestrator);
            }
        }
    }

    /**
     * Perform DNS checks (CNAME and optional TXT).
     */
    private function verifyDns(string $domain, string $target, ?string $token): bool
    {
        // 1. Check CNAME record
        $records = dns_get_record($domain, DNS_CNAME);
        $cnameValid = false;

        foreach ($records as $record) {
            if (isset($record['target']) && str_contains($record['target'], $target)) {
                $cnameValid = true;
                break;
            }
        }

        if (!$cnameValid) {
            Log::debug("[sGTM Domain] CNAME invalid for {$domain}. Expected: {$target}");
            return false;
        }

        // 2. Check TXT verification token if present
        if ($token) {
            $verifyHost = '_verify.' . $domain;
            $txtRecords = dns_get_record($verifyHost, DNS_TXT);
            $txtValid = false;
            foreach ($txtRecords as $txt) {
                if (isset($txt['txt']) && $txt['txt'] === $token) {
                    $txtValid = true;
                    break;
                }
            }
            if (!$txtValid) {
                Log::debug("[sGTM Domain] TXT token invalid for {$domain}");
                return false;
            }
        }

        return true;
    }

    /**
     * Mark domain as verified and sync with infrastructure.
     */
    private function activateDomain(TenantDomain $tenantDomain, DockerOrchestratorService $orchestrator): void
    {
        $tenantDomain->update([
            'is_verified' => true,
            'status'      => 'verified',
        ]);

        // Find the container for this tenant to trigger infrastructure sync
        $container = TrackingContainer::where('tenant_id', $tenantDomain->tenant_id)->first();
        
        if ($container) {
            Log::info("[sGTM Domain] DNS Verified! Activating infrastructure for {$tenantDomain->domain}");
            $orchestrator->addTrackingDomain($container, $tenantDomain->domain);

            // Notify Tenant Admin
            try {
                $tenant = $container->tenant;
                if ($tenant && $tenant->admin_email) {
                    \Illuminate\Support\Facades\Notification::route('mail', $tenant->admin_email)
                        ->notify(new \App\Modules\Tracking\Notifications\DomainVerified($container, $tenantDomain->domain));
                }
            } catch (\Exception $e) {
                Log::error("[sGTM Domain] Failed to send verification notification: " . $e->getMessage());
            }
        } else {
            Log::warning("[sGTM Domain] Verified domain {$tenantDomain->domain} but no TrackingContainer found for Tenant #{$tenantDomain->tenant_id}");
        }
    }
}
