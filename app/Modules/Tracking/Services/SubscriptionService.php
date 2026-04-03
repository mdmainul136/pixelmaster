<?php

namespace App\Modules\Tracking\Services;

use App\Models\Tenant;
use App\Models\SubscriptionPlan;
use App\Models\TenantSubscription;
use App\Services\PlanManager;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SubscriptionService
{
    public function __construct(
        private readonly PlanManager $planManager
    ) {}

    /**
     * Start a 7-day Pro trial for a new tenant.
     */
    public function startTrial(Tenant $tenant): TenantSubscription
    {
        $proPlan = SubscriptionPlan::where('plan_key', 'pro')->first();

        return TenantSubscription::updateOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'subscription_plan_id' => $proPlan->id,
                'status'               => 'trialing',
                'trial'                => true,
                'trial_started_at'     => now(),
                'trial_ends_at'        => now()->addDays(7),
                'billing_cycle'        => 'monthly',
                'auto_renew'           => true
            ]
        );
    }

    /**
     * Resolve the local PPP price for a plan.
     */
    public function getLocalPrice(SubscriptionPlan $plan, string $currency = 'USD'): array
    {
        $prices = $plan->prices_ppp ?? [];
        $price = $prices[$currency] ?? $plan->price_monthly;

        return [
            'amount'   => $price,
            'currency' => $currency,
            'is_ppp'   => isset($prices[$currency]) && $currency !== 'USD'
        ];
    }

    /**
     * Downgrade a tenant to the Free plan (usually after trial expiry).
     */
    public function downgradeToFree(Tenant $tenant): void
    {
        $freePlan = SubscriptionPlan::where('plan_key', 'free')->first();
        
        $subscription = TenantSubscription::where('tenant_id', $tenant->id)->first();
        
        if ($subscription) {
            $subscription->update([
                'subscription_plan_id' => $freePlan->id,
                'status'               => 'active', // Free is always active
                'trial'                => false,
                'trial_ends_at'        => null,
                'provider_subscription_id' => null,
            ]);
            
            Log::info("Tenant #{$tenant->id} downgraded to Free plan due to trial expiry.");
        }
    }

    /**
     * Check if a tenant has exceeded their monthly event quota.
     */
    public function checkQuota(Tenant $tenant): bool
    {
        $limit = $this->planManager->getRequestLimit();
        
        // Actual implementation would query cached monthly events from ClickHouse
        return true; 
    }
}
