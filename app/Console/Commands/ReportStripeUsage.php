<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Modules\Tracking\Services\TrackingUsageService;
use App\Services\StripeBillingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * ReportStripeUsage
 *
 * Artisan cron command that runs hourly/daily to report overage
 * events to Stripe for all tenants currently in "overage" status.
 *
 * Schedule: hourly in app/Console/Kernel.php (or routes/console.php)
 * Command:  php artisan billing:report-stripe-usage
 */
class ReportStripeUsage extends Command
{
    protected $signature   = 'billing:report-stripe-usage {--dry-run : Simulate without actually reporting to Stripe}';
    protected $description = 'Report tracking event overage counts to Stripe metered billing.';

    public function __construct(
        private TrackingUsageService $usageService,
        private StripeBillingService $billingService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');

        // Only process tenants with an active Stripe subscription on paid plans
        /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\Tenant> $tenants */
        $tenants = Tenant::on('central')
            ->whereNotNull('stripe_overage_item_id')
            ->where('stripe_subscription_status', 'active')
            ->whereIn('plan', ['pro', 'business', 'enterprise'])
            ->get();

        $this->info("Processing {$tenants->count()} tenant(s) for overage reporting...");

        $reported = 0;
        $skipped  = 0;
        $errors   = 0;

        foreach ($tenants as $tenant) {
            try {
                // Initialize tenant DB connection using the Tenant model directly
                tenancy()->initialize($tenant->getTenantKey());

                // Get the container (first/primary one)
                $container = \Illuminate\Support\Facades\DB::connection('tenant_dynamic')
                    ->table('ec_tracking_containers')
                    ->first();

                if (!$container) {
                    $this->warn("  [{$tenant->id}] No container found, skipping.");
                    $skipped++;
                    continue;
                }

                // Calculate quota status
                $quota = $this->usageService->getQuotaStatus($container->id, $tenant->plan);

                if ($quota['status'] === 'ok') {
                    $this->line("  [{$tenant->id}] OK — no overage. Usage: {$quota['usage']}/{$quota['limit']}");
                    $skipped++;
                    continue;
                }

                // Calculate exact overage count
                $overageCount = max(0, (int)$quota['usage'] - (int)$quota['limit']);

                $this->info("  [{$tenant->id}] {$quota['status']} — reporting {$overageCount} overage events.");

                if (!$isDryRun) {
                    $success = $this->billingService->reportOverageUsage($tenant, $overageCount);
                    if ($success) {
                        $reported++;
                    } else {
                        $errors++;
                    }
                } else {
                    $this->line("  [DRY-RUN] Would report {$overageCount} events for tenant [{$tenant->id}]");
                    $reported++;
                }

            } catch (\Exception $e) {
                Log::error("ReportStripeUsage: Failed for tenant [{$tenant->id}]: " . $e->getMessage());
                $this->error("  [{$tenant->id}] ERROR: " . $e->getMessage());
                $errors++;
            } finally {
                tenancy()->end();
            }
        }

        $this->newLine();
        $this->table(
            ['Reported', 'Skipped', 'Errors'],
            [[$reported, $skipped, $errors]]
        );

        return $errors > 0 ? self::FAILURE : self::SUCCESS;
    }
}
