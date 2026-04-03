<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

/**
 * Artisan command: php artisan tenants:check-quotas
 * 
 * Scans all active tenants, calculates live DB usage,
 * and triggers tiered alerts based on quota thresholds:
 *   - 80-89%: Log warning
 *   - 90-99%: Send email warning to tenant admin
 *   - 100%+:  Mark tenant as quota-blocked, send critical alert
 * 
 * Should be scheduled hourly in console.php:
 *   $schedule->command('tenants:check-quotas')->hourly();
 */
class CheckQuotasCommand extends Command
{
    protected $signature = 'tenants:check-quotas 
                            {--dry-run : Only report, do not send emails}
                            {--tenant= : Check a specific tenant ID only}';

    protected $description = 'Scan all active tenants and enforce database quota alerts';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $specificTenant = $this->option('tenant');

        $this->info($dryRun ? '🔍 DRY RUN — no emails will be sent' : '📊 Scanning tenant database quotas...');

        // Build query
        $query = Tenant::where('status', 'active');
        if ($specificTenant) {
            $query->where('id', $specificTenant);
        }

        $tenants = $query->get();
        $this->info("Found {$tenants->count()} active tenant(s) to check.");

        $stats = ['normal' => 0, 'warning' => 0, 'critical' => 0, 'blocked' => 0, 'errors' => 0];

        $this->withProgressBar($tenants, function (Tenant $tenant) use ($dryRun, &$stats) {
            try {
                $usagePercent = $tenant->dbUsagePercent();
                $usageGb = round($tenant->currentDbUsageGb(), 3);
                $limitGb = $tenant->dbLimitGb();

                if ($usagePercent >= 100) {
                    // ── BLOCKED: 100%+ ──
                    $stats['blocked']++;
                    $this->newLine();
                    $this->error("  🚫 {$tenant->id}: {$usageGb}GB / {$limitGb}GB ({$usagePercent}%) — WRITE BLOCKED");

                    if (!$dryRun) {
                        $this->sendQuotaEmail($tenant, 'blocked', $usagePercent, $usageGb, $limitGb);
                    }

                } elseif ($usagePercent >= 90) {
                    // ── CRITICAL: 90-99% ──
                    $stats['critical']++;
                    $this->newLine();
                    $this->warn("  ⚠️  {$tenant->id}: {$usageGb}GB / {$limitGb}GB ({$usagePercent}%) — CRITICAL");

                    if (!$dryRun) {
                        $this->sendQuotaEmail($tenant, 'critical', $usagePercent, $usageGb, $limitGb);
                    }

                } elseif ($usagePercent >= 80) {
                    // ── WARNING: 80-89% ──
                    $stats['warning']++;
                    $this->newLine();
                    $this->warn("  ⚡ {$tenant->id}: {$usageGb}GB / {$limitGb}GB ({$usagePercent}%) — Approaching limit");

                } else {
                    // ── NORMAL: <80% ──
                    $stats['normal']++;
                }

            } catch (\Exception $e) {
                $stats['errors']++;
                $this->newLine();
                $this->error("  ❌ {$tenant->id}: Failed — " . $e->getMessage());
            }
        });

        $this->newLine(2);
        $this->table(
            ['Status', 'Count'],
            [
                ['✅ Normal (<80%)', $stats['normal']],
                ['⚡ Warning (80-89%)', $stats['warning']],
                ['⚠️  Critical (90-99%)', $stats['critical']],
                ['🚫 Blocked (100%+)', $stats['blocked']],
                ['❌ Errors', $stats['errors']],
            ]
        );

        return $stats['errors'] > 0 ? self::FAILURE : self::SUCCESS;
    }

    protected function sendQuotaEmail(Tenant $tenant, string $level, float $percent, float $usageGb, float $limitGb): void
    {
        try {
            Mail::to($tenant->admin_email)->send(
                new \App\Mail\QuotaWarningMail($tenant, $level, $percent, $usageGb, $limitGb)
            );
            \Log::info("Quota {$level} email sent to {$tenant->admin_email} for tenant {$tenant->id}");
        } catch (\Exception $e) {
            \Log::error("Failed to send quota email for tenant {$tenant->id}: " . $e->getMessage());
        }
    }
}
