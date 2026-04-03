<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\TenantSubscription;
use App\Models\Payment;
use App\Models\Invoice;
use Illuminate\Support\Facades\Log;

/**
 * StripeTenantSubscriptionService
 * Handles recurring Stripe subscriptions for core platform plans.
 */
class StripeTenantSubscriptionService
{
    public function __construct()
    {
        $stripeSecret = \App\Models\GlobalSetting::get('sk'); 
        if (empty($stripeSecret)) {
            $stripeSecret = config('services.stripe.secret');
        }
        \Stripe\Stripe::setApiKey($stripeSecret);
    }

    /**
     * Create a Stripe Checkout Session for a recurring Tenant Plan.
     */
    public function createCheckoutSession(Tenant $tenant, string $planSlug, string $interval = 'monthly'): string
    {
        $planDetails = Tenant::$plans[$planSlug];
        $price = $planDetails['price'];
        
        if ($interval === 'annual') {
            $price = $price * 12 * 0.83; // 17% discount
        }

        $stripeCustomerId = $this->getOrCreateStripeCustomer($tenant);

        $priceData = [
            'currency' => 'usd',
            'product_data' => [
                'name' => "Platform " . ucfirst($planSlug) . " Plan",
                'description' => "Subscription to " . ucfirst($planSlug) . " plan (" . $planDetails['db_limit_gb'] . "GB Storage)",
            ],
            'unit_amount' => intval($price * 100),
            'recurring' => ['interval' => $interval === 'monthly' ? 'month' : 'year'],
        ];

        // Ensure a pending local payment record exists to track this attempt
        $payment = Payment::create([
            'tenant_id' => $tenant->id,
            'amount' => $price,
            'currency' => 'USD',
            'payment_method' => 'stripe',
            'payment_status' => 'pending',
        ]);

        $session = \Stripe\Checkout\Session::create([
            'payment_method_types' => ['card'],
            'customer' => $stripeCustomerId,
            'mode' => 'subscription',
            'line_items' => [['price_data' => $priceData, 'quantity' => 1]],
            'success_url' => "http://{$tenant->id}.localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
            'cancel_url' => "http://{$tenant->id}.localhost:3000/payment/cancel",
            'metadata' => [
                'type' => 'plan_upgrade',
                'tenant_id' => $tenant->id,
                'plan_slug' => $planSlug,
                'interval' => $interval,
                'payment_id' => $payment->id,
            ],
        ]);

        $payment->update(['stripe_session_id' => $session->id]);

        return $session->id;
    }

    /**
     * Cancel the tenant's active Stripe subscription.
     */
    public function cancelSubscription(Tenant $tenant): void
    {
        $subscription = TenantSubscription::where('tenant_id', $tenant->id)
            ->where('provider', 'stripe')
            ->where('status', 'active')
            ->first();

        if ($subscription && $subscription->provider_subscription_id) {
            try {
                \Stripe\Subscription::cancel($subscription->provider_subscription_id);
            } catch (\Exception $e) {
                Log::error("Stripe tenant subscription cancel failed: " . $e->getMessage());
            }
        }
    }

    /**
     * Get or create Stripe Customer for a tenant
     */
    protected function getOrCreateStripeCustomer(Tenant $tenant): string
    {
        $stripeId = $tenant->data['stripe_id'] ?? null;
        
        if (!$stripeId) {
            $customer = \Stripe\Customer::create([
                'email' => $tenant->admin_email,
                'name' => $tenant->company_name ?? $tenant->tenant_name,
                'metadata' => ['tenant_id' => $tenant->id]
            ]);
            $stripeId = $customer->id;
            
            $data = $tenant->data;
            $data['stripe_id'] = $stripeId;
            $tenant->data = $data;
            $tenant->save();
        }
        
        return $stripeId;
    }
}
