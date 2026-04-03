<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use App\Models\TenantSubscription;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckSubscriptionStatus extends Command
{
    protected $signature = 'subscriptions:check {--dry-run : Log changes without saving}';
    protected $description = 'Automated subscription lifecycle: expire trials, flag past-due, clean canceled.';

    public function handle(): void
    {
        $dryRun = $this->option('dry-run');

        $this->info('Starting subscription status check...');

        // ── 1. Expire finished trials ─────────────────────────────────────────
        $expiredTrials = TenantSubscription::where('status', 'trialing')
            ->where('trial_ends_at', '<', now())
            ->get();

        foreach ($expiredTrials as $sub) {
            $this->line("  [TRIAL EXPIRED] Tenant: {$sub->tenant_id} | sub: {$sub->id}");
            if (!$dryRun) {
                $sub->update([
                    'status' => 'expired',
                    'trial'  => false,
                ]);
                $this->auditLog($sub->tenant_id, "Trial expired — subscription #{$sub->id} moved to 'expired'.");
            }
        }
        $this->info("Expired trials processed: {$expiredTrials->count()}");

        // ── 2. Flag active subscriptions as past_due ──────────────────────────
        $pastDue = TenantSubscription::where('status', 'active')
            ->where('auto_renew', true)
            ->where('renews_at', '<', now())
            ->get();

        foreach ($pastDue as $sub) {
            $this->line("  [PAST DUE] Tenant: {$sub->tenant_id} | sub: {$sub->id} | renews_at: {$sub->renews_at}");
            if (!$dryRun) {
                $sub->update([
                    'status'           => 'past_due',
                    'dunning_attempts' => $sub->dunning_attempts + 1,
                ]);
                $this->auditLog($sub->tenant_id, "Subscription #{$sub->id} is past due (attempt #{$sub->dunning_attempts}).");
            }
        }
        $this->info("Past-due subscriptions flagged: {$pastDue->count()}");

        // ── 3. Fully expire canceled subscriptions past their ends_at ─────────
        $hardExpired = TenantSubscription::where('status', 'canceled')
            ->whereNotNull('ends_at')
            ->where('ends_at', '<', now())
            ->get();

        foreach ($hardExpired as $sub) {
            $this->line("  [HARD EXPIRE] Tenant: {$sub->tenant_id} | sub: {$sub->id}");
            if (!$dryRun) {
                $sub->update(['status' => 'expired']);
                $this->auditLog($sub->tenant_id, "Canceled subscription #{$sub->id} fully expired (ends_at passed).");
            }
        }
        $this->info("Hard-expired canceled subscriptions: {$hardExpired->count()}");

        $this->info('Subscription check complete.');
    }

    private function auditLog(string $tenantId, string $action): void
    {
        try {
            AuditLog::create([
                'tenant_id'  => $tenantId,
                'event_type' => 'subscription_lifecycle',
                'action'     => $action,
                'ip_address' => '::system',
            ]);
        } catch (\Exception $e) {
            Log::warning('Failed to write subscription audit log: ' . $e->getMessage());
        }
    }
}
