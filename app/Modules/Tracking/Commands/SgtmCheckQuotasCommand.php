<?php

namespace App\Modules\Tracking\Commands;

use Illuminate\Console\Command;
use App\Modules\Tracking\Jobs\CheckUsageQuotasJob;

class SgtmCheckQuotasCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sgtm:check-quotas';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manually trigger the sGTM usage quota check and auto-suspend over-limit containers.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Triggering sGTM Usage Quota Check...");
        
        // Dispatch synchronously for immediate feedback in console
        CheckUsageQuotasJob::dispatchSync();
        
        $this->info("Check completed successfully.");
    }
}
