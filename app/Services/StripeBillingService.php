<?php

namespace App\Services;

use App\Models\Tenant;
use Stripe\StripeClient;
use Illuminate\Support\Facades\Log;

/**
 * StripeBillingService
 *
 * Handles all Stripe interactions for the PixelMaster sGTM platform.
 * Uses the direct Stripe PHP SDK (already installed in composer.json).
 *
 * Billing Model:
 *   - Free Plan:      No Stripe customer required.
 *   - Pro/Business:   Stripe Customer + Subscription with a metered overage item.
 *
 * Metered Overage Flow:
 *   1. Tenant subscribes to plan → Stripe subscription is created.
 *   2. Each billing period, the cron `ReportStripeUsage` calculates
 *      how many events were in "overage" and reports them to the
 *      metered subscription item via Stripe Usage Records API.
 *   3. Stripe auto-bills the overage at the end of the billing period.
 */
class StripeBillingService
{
    private StripeClient $stripe;

    // Map internal plan keys → Stripe Price IDs (from config/billing.php or .env)
    private array $prices;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));

        $this->prices = [
            'pro'        => config('services.stripe.prices.pro'),
            'business'   => config('services.stripe.prices.business'),
            'enterprise' => config('services.stripe.prices.enterprise'),
        ];
    }

    /**
     * Find or create a Stripe Customer for a tenant.
     */
    public function ensureCustomer(Tenant $tenant): string
    {
        if ($tenant->stripe_customer_id) {
            return $tenant->stripe_customer_id;
        }

        $customer = $this->stripe->customers->create([
            'email'    => $tenant->admin_email,
            'name'     => $tenant->company_name ?? $tenant->tenant_name,
            'metadata' => [
                'tenant_id' => $tenant->id,
                'plan'      => $tenant->plan,
            ],
        ]);

        $tenant->update(['stripe_customer_id' => $customer->id]);

        Log::info("StripeBilling: Created customer for tenant [{$tenant->id}]", [
            'stripe_customer_id' => $customer->id,
        ]);

        return $customer->id;
    }

    /**
     * Create or retrieve a Stripe Billing Portal Session.
     * Allows Pro/Business tenants to manage their payment methods.
     */
    public function createPortalSession(Tenant $tenant, string $returnUrl): string
    {
        $customerId = $this->ensureCustomer($tenant);

        $session = $this->stripe->billingPortal->sessions->create([
            'customer'   => $customerId,
            'return_url' => $returnUrl,
        ]);

        return $session->url;
    }

    /**
     * Create a Stripe Checkout Session to upgrade a tenant to Pro/Business.
     * Uses Stripe hosted checkout — no PCI compliance issues.
     */
    public function createCheckoutSession(Tenant $tenant, string $plan, string $successUrl, string $cancelUrl): string
    {
        $customerId = $this->ensureCustomer($tenant);
        $priceId    = $this->prices[$plan] ?? null;

        if (!$priceId) {
            throw new \InvalidArgumentException("No Stripe price configured for plan: {$plan}");
        }

        $session = $this->stripe->checkout->sessions->create([
            'customer'             => $customerId,
            'mode'                 => 'subscription',
            'payment_method_types' => ['card'],
            'line_items'           => [
                [
                    'price'    => $priceId,
                    'quantity' => 1,
                ],
            ],
            'subscription_data' => [
                'metadata' => [
                    'tenant_id' => $tenant->id,
                    'plan'      => $plan,
                ],
            ],
            'success_url' => $successUrl . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url'  => $cancelUrl,
            'metadata'    => [
                'tenant_id' => $tenant->id,
                'plan'      => $plan,
            ],
        ]);

        Log::info("StripeBilling: Checkout session created for tenant [{$tenant->id}]", [
            'plan'       => $plan,
            'session_id' => $session->id,
        ]);

        return $session->url;
    }

    /**
     * After Stripe Checkout completes, synchronize the tenant's subscription
     * state from the Stripe subscription object.
     */
    public function syncSubscriptionFromSession(Tenant $tenant, string $sessionId): void
    {
        $session = $this->stripe->checkout->sessions->retrieve($sessionId, [
            'expand' => ['subscription', 'subscription.items'],
        ]);

        if (!$session->subscription) {
            Log::warning("StripeBilling: No subscription on session [{$sessionId}]");
            return;
        }

        $sub = $session->subscription;

        // Find the metered overage item (if the plan has one)
        $overageItemId = null;
        foreach ($sub->items->data as $item) {
            if ($item->price->recurring?->usage_type === 'metered') {
                $overageItemId = $item->id;
                break;
            }
        }

        $planMeta = $sub->metadata['plan'] ?? null;

        $tenant->update([
            'stripe_subscription_id'     => $sub->id,
            'stripe_price_id'            => $sub->items->data[0]->price->id,
            'stripe_subscription_status' => $sub->status,
            'stripe_overage_item_id'     => $overageItemId,
            'billing_required'           => true,
            'plan'                       => $planMeta ?? $tenant->plan,
        ]);

        // Also upgrade the plan if metadata says so
        if ($planMeta && in_array($planMeta, ['pro', 'business', 'enterprise'])) {
            $tenant->upgradePlan($planMeta);
        }

        Log::info("StripeBilling: Subscription synced for tenant [{$tenant->id}]", [
            'subscription_id' => $sub->id,
            'status'          => $sub->status,
        ]);
    }

    /**
     * Report overage events to Stripe for a tenant.
     * Called by the ReportStripeUsage cron command.
     *
     * @param int $overageCount  The number of "extra" events above the plan limit.
     */
    public function reportOverageUsage(Tenant $tenant, int $overageCount): bool
    {
        if (!$tenant->stripe_overage_item_id || $overageCount <= 0) {
            return false;
        }

        try {
            // Stripe PHP SDK v19+ — usage records are under subscriptionItems
            $this->stripe->subscriptionItems->createUsageRecord(
                $tenant->stripe_overage_item_id,
                [
                    'quantity'  => $overageCount,
                    'timestamp' => now()->timestamp,
                    'action'    => 'set',
                ]
            );

            Log::info("StripeBilling: Reported {$overageCount} overage events for tenant [{$tenant->id}]");
            return true;
        } catch (\Exception $e) {
            Log::error("StripeBilling: Failed to report overage for tenant [{$tenant->id}]: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Cancel a tenant's Stripe subscription (on plan downgrade/cancellation).
     */
    public function cancelSubscription(Tenant $tenant, bool $immediately = false): void
    {
        if (!$tenant->stripe_subscription_id) return;

        if ($immediately) {
            $this->stripe->subscriptions->cancel($tenant->stripe_subscription_id);
        } else {
            $this->stripe->subscriptions->update($tenant->stripe_subscription_id, [
                'cancel_at_period_end' => true,
            ]);
        }

        $tenant->update([
            'stripe_subscription_status' => $immediately ? 'canceled' : 'pending_cancel',
        ]);

        Log::info("StripeBilling: Subscription canceled for tenant [{$tenant->id}]", [
            'immediately' => $immediately,
        ]);
    }

    /**
     * Handle a Stripe Webhook event payload.
     * Routes to the appropriate handler based on event type.
     */
    public function handleWebhook(string $payload, string $sigHeader): void
    {
        $secret = config('services.stripe.webhook_secret');

        $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $secret);

        match ($event->type) {
            'checkout.session.completed'          => $this->onCheckoutCompleted($event->data->object),
            'invoice.payment_succeeded'           => $this->onPaymentSucceeded($event->data->object),
            'invoice.payment_failed'              => $this->onPaymentFailed($event->data->object),
            'customer.subscription.deleted'       => $this->onSubscriptionDeleted($event->data->object),
            'customer.subscription.updated'       => $this->onSubscriptionUpdated($event->data->object),
            default                               => null,
        };
    }

    // ── Webhook Handlers ────────────────────────────────────────────────────────

    private function onCheckoutCompleted(object $session): void
    {
        $tenantId = $session->metadata->tenant_id ?? null;
        if (!$tenantId) return;

        $tenant = Tenant::on('central')->find($tenantId);
        if ($tenant) {
            $this->syncSubscriptionFromSession($tenant, $session->id);
        }
    }

    private function onPaymentSucceeded(object $invoice): void
    {
        $customerId = $invoice->customer;
        $tenant = Tenant::on('central')->where('stripe_customer_id', $customerId)->first();
        if ($tenant) {
            $tenant->update([
                'stripe_subscription_status' => 'active',
                'status'                     => Tenant::STATUS_ACTIVE,
            ]);
        }
    }

    private function onPaymentFailed(object $invoice): void
    {
        $customerId = $invoice->customer;
        $tenant = Tenant::on('central')->where('stripe_customer_id', $customerId)->first();
        if ($tenant) {
            $tenant->update([
                'stripe_subscription_status' => 'past_due',
                'status'                     => Tenant::STATUS_BILLING_FAILED,
            ]);
            Log::warning("StripeBilling: Payment failed for tenant [{$tenant->id}]");
        }
    }

    private function onSubscriptionDeleted(object $subscription): void
    {
        $tenant = Tenant::on('central')->where('stripe_subscription_id', $subscription->id)->first();
        if ($tenant) {
            $tenant->update([
                'stripe_subscription_status' => 'canceled',
                'plan'                       => 'free',
                'billing_required'           => false,
            ]);
        }
    }

    private function onSubscriptionUpdated(object $subscription): void
    {
        $tenant = Tenant::on('central')->where('stripe_subscription_id', $subscription->id)->first();
        if ($tenant) {
            $tenant->update([
                'stripe_subscription_status' => $subscription->status,
            ]);
        }
    }
}
