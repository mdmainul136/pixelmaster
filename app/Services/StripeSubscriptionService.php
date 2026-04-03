<?php

namespace App\Services;

use App\Models\ThemeSubscription;
use App\Models\MarketplaceTheme;
use App\Models\Tenant;
use Illuminate\Support\Facades\Log;

/**
 * StripeSubscriptionService
 * Handles recurring Stripe subscriptions for premium themes.
 */
class StripeSubscriptionService
{
    public function __construct()
    {
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create a Stripe Checkout Session in 'subscription' mode.
     */
    public function createCheckoutSession(Tenant $tenant, MarketplaceTheme $theme, string $interval = 'monthly'): string
    {
        $priceData = [
            'currency' => 'usd',
            'product_data' => ['name' => "{$theme->theme->name} – {$interval} plan"],
            'unit_amount' => intval(($interval === 'monthly' ? $theme->subscription_monthly : $theme->subscription_monthly * 10) * 100),
            'recurring' => ['interval' => $interval === 'monthly' ? 'month' : 'year'],
        ];

        $session = \Stripe\Checkout\Session::create([
            'payment_method_types' => ['card'],
            'mode' => 'subscription',
            'line_items' => [['price_data' => $priceData, 'quantity' => 1]],
            'success_url' => config('app.url') . "/marketplace/success?sub=1&theme={$theme->id}",
            'cancel_url' => config('app.url') . "/marketplace/themes/{$theme->id}",
            'metadata' => [
                'tenant_id' => $tenant->id,
                'marketplace_theme_id' => $theme->id,
                'vendor_id' => $theme->vendor_id,
                'interval' => $interval,
            ],
        ]);

        return $session->url;
    }

    /**
     * Cancel a subscription immediately.
     */
    public function cancelSubscription(ThemeSubscription $subscription): void
    {
        try {
            \Stripe\Subscription::cancel($subscription->provider_subscription_id);
        } catch (\Exception $e) {
            Log::error("Stripe sub cancel failed: " . $e->getMessage());
        }
        $subscription->update(['status' => 'cancelled', 'cancelled_at' => now()]);
    }

    /**
     * Handle Stripe subscription webhook events.
     */
    public function handleWebhook(\Stripe\Event $event): void
    {
        match ($event->type) {
            'customer.subscription.created',
            'customer.subscription.updated' => $this->syncSubscription($event->data->object),
            'customer.subscription.deleted' => $this->onDeleted($event->data->object),
            'invoice.payment_failed'        => $this->onPaymentFailed($event->data->object),
            default => null,
        };
    }

    private function syncSubscription(\Stripe\Subscription $stripeSub): void
    {
        $meta = $stripeSub->metadata->toArray();
        ThemeSubscription::updateOrCreate(
            ['provider_subscription_id' => $stripeSub->id],
            [
                'tenant_id' => $meta['tenant_id'] ?? null,
                'marketplace_theme_id' => $meta['marketplace_theme_id'] ?? null,
                'vendor_id' => $meta['vendor_id'] ?? null,
                'provider' => 'stripe',
                'provider_customer_id' => $stripeSub->customer,
                'status' => $stripeSub->status,
                'current_period_start' => \Carbon\Carbon::createFromTimestamp($stripeSub->current_period_start),
                'current_period_end' => \Carbon\Carbon::createFromTimestamp($stripeSub->current_period_end),
            ]
        );
    }

    private function onDeleted(\Stripe\Subscription $stripeSub): void
    {
        ThemeSubscription::where('provider_subscription_id', $stripeSub->id)
            ->update(['status' => 'cancelled', 'cancelled_at' => now()]);
    }

    private function onPaymentFailed(\Stripe\Invoice $invoice): void
    {
        ThemeSubscription::where('provider_subscription_id', $invoice->subscription)
            ->update(['status' => 'past_due']);
        Log::warning("Stripe payment failed for subscription: " . $invoice->subscription);
    }
}
