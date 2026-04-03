<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ProcessSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenant:process-subscriptions';
    protected $description = 'Process expiring tenant module subscriptions and handle automated renewals.';

    public function handle(BillingService $billingService)
    {
        $this->info("Starting subscription processing...");

        $dueSubscriptions = TenantModule::dueForRenewal()->get();

        if ($dueSubscriptions->isEmpty()) {
            $this->info("No subscriptions due for renewal.");
            return;
        }

        $this->info("Found " . $dueSubscriptions->count() . " subscriptions due for renewal.");

        foreach ($dueSubscriptions as $subscription) {
            $tenant = $subscription->tenant;
            $module = $subscription->module;

            $this->info("Processing renewal for Tenant: {$tenant->tenant_id}, Module: {$module->name}");

            $result = $billingService->renewSubscription($subscription);

            if ($result['success']) {
                $this->info("SUCCESS: Subscription renewed for {$tenant->tenant_id}. New expiry: {$result['expiry']}");
                
                $subscription->update([
                    'retry_count' => 0,
                    'last_failed_at' => null,
                ]);
            } else {
                $this->error("FAILED: Renewal failed for {$tenant->tenant_id}: {$result['message']}");
                
                $subscription->increment('retry_count');
                $subscription->update([
                    'last_failed_at' => now(),
                ]);

                // notification logic here (e.g. Email to tenant admin)
                // Log::channel('billing')->error("Billing failure for {$tenant->tenant_id} module {$module->slug}: {$result['message']}");
            }
        }

        $this->info("Subscription processing completed.");
    }
}
