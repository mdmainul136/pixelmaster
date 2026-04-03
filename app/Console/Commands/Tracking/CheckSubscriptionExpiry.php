<?php

namespace App\Console\Commands\Tracking;

use Illuminate\Console\Command;
use App\Models\TenantSubscription;
use App\Models\Tenant;
use App\Modules\Tracking\Services\SubscriptionService;
use Illuminate\Support\Facades\Log;

class CheckSubscriptionExpiry extends Command
{
    /**
     * The name and signature of the console command.
     * @var string
     */
    protected $signature = 'tracking:check-subscriptions';

    /**
     * The console command description.
     * @var string
     */
    protected $description = 'Scan all tenant subscriptions for expired trials and downgrade to Free plan.';

    /**
     * Execute the console command.
     */
    public function handle(SubscriptionService $service)
    {
        $this->info('Starting global subscription expiry scan...');

        // Scan for trialing subscriptions that have expired
        $expiredTrials = TenantSubscription::where('status', 'trialing')
            ->where('trial_ends_at', '<', now())
            ->get();

        if ($expiredTrials->isEmpty()) {
            $this->info('No expired trials found today.');
            return;
        }

        $this->warn("Found " . $expiredTrials->count() . " expired trials. Processing downgrades...");

        foreach ($expiredTrials as $sub) {
            $tenant = Tenant::find($sub->tenant_id);
            if ($tenant) {
                $this->comment("Downgrading Tenant #{$tenant->id} to Free plan...");
                $service->downgradeToFree($tenant);
            }
        }

        $this->info('Global subscription scan complete.');
    }
}
