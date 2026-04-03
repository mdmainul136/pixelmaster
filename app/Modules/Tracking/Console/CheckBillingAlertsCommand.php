<?php

namespace App\Modules\Tracking\Console;

use App\Modules\Tracking\Services\BillingAlertService;
use Illuminate\Console\Command;

/**
 * CheckBillingAlertsCommand
 *
 * Artisan: php artisan tracking:check-billing-alerts
 *
 * Scheduled daily in app/Console/Kernel.php:
 *   $schedule->command('tracking:check-billing-alerts')->dailyAt('08:00');
 *
 * Also runs at month start to reset alert flags:
 *   $schedule->command('tracking:check-billing-alerts --reset')->monthlyOn(1, '00:05');
 */
class CheckBillingAlertsCommand extends Command
{
    protected $signature   = 'tracking:check-billing-alerts {--reset : Reset monthly alert flags instead of checking}';
    protected $description = 'Check per-container event usage and fire billing threshold alerts';

    public function handle(BillingAlertService $alertService): int
    {
        if ($this->option('reset')) {
            $this->resetAllAlerts($alertService);
            return self::SUCCESS;
        }

        $this->info('[BillingAlerts] Checking all active containers...');

        $alerted = $alertService->checkAllContainers();

        $this->info('[BillingAlerts] Done. Alerts fired: ' . count($alerted));

        return self::SUCCESS;
    }

    private function resetAllAlerts(BillingAlertService $alertService): void
    {
        $this->info('[BillingAlerts] Resetting monthly alert flags...');

        $containers = \App\Models\Tracking\TrackingContainer::where('is_active', true)
            ->pluck('id');

        foreach ($containers as $id) {
            $alertService->resetMonthlyAlerts($id);
        }

        $this->info("[BillingAlerts] Reset {$containers->count()} containers.");
    }
}
