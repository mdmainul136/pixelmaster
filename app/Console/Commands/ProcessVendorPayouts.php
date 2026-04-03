<?php

namespace App\Console\Commands;

use App\Services\VendorPayoutService;
use Illuminate\Console\Command;

class ProcessVendorPayouts extends Command
{
    protected $signature = 'theme:payout-vendors {--dry-run : Preview payouts without executing}';
    protected $description = 'Process automated weekly vendor payouts via Stripe Connect';

    public function handle(VendorPayoutService $payoutService): void
    {
        $this->info('🚀 Processing vendor payouts...');

        if ($this->option('dry-run')) {
            $this->warn('DRY RUN MODE — No transfers will be made.');
        }

        if (!$this->option('dry-run')) {
            $payoutService->processAllPayouts();
        }

        $this->info('✅ Vendor payouts processed successfully.');
    }
}
