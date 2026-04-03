<?php

namespace App\Services;

use App\Models\ThemeSubscription;
use App\Models\MarketplaceTheme;
use App\Models\Tenant;
use App\Models\PaddleTransaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * PaddleService
 * Handles global tax-compliant billing via Paddle Billing.
 * Paddle manages all VAT/GST automatically per country.
 */
class PaddleService
{
    private string $apiKey;
    private string $baseUrl;
    private string $vendorId;

    public function __construct()
    {
        $this->apiKey  = config('services.paddle.api_key');
        $this->vendorId = config('services.paddle.vendor_id');
        $this->baseUrl = config('services.paddle.sandbox', true)
            ? 'https://sandbox-api.paddle.com'
            : 'https://api.paddle.com';
    }

    /**
     * Create a Paddle checkout link for a one-time theme purchase.
     */
    public function createCheckoutUrl(Tenant $tenant, MarketplaceTheme $theme): string
    {
        $response = Http::withToken($this->apiKey)
            ->post("{$this->baseUrl}/transactions", [
                'items' => [[
                    'price' => [
                        'description' => $theme->theme->name,
                        'unit_price' => [
                            'amount' => (string) intval($theme->price * 100),
                            'currency_code' => 'USD',
                        ],
                        'tax_mode' => 'account_setting',
                        'product' => ['name' => $theme->theme->name],
                    ],
                    'quantity' => 1,
                ]],
                'customer' => ['email' => $tenant->email ?? 'tenant@example.com'],
                'custom_data' => [
                    'tenant_id' => $tenant->id,
                    'marketplace_theme_id' => $theme->id,
                    'vendor_id' => $theme->vendor_id,
                ],
                'checkout' => [
                    'url' => config('app.url') . "/marketplace/success?provider=paddle&theme={$theme->id}",
                ],
            ]);

        if ($response->failed()) {
            Log::error("Paddle checkout creation failed", $response->json());
            throw new \Exception("Paddle checkout failed: " . $response->body());
        }

        return $response->json()['data']['checkout']['url'];
    }

    /**
     * Create a recurring Paddle subscription for a theme.
     */
    public function createSubscription(Tenant $tenant, MarketplaceTheme $theme, string $interval = 'monthly'): ThemeSubscription
    {
        $response = Http::withToken($this->apiKey)
            ->post("{$this->baseUrl}/subscriptions", [
                'items' => [[
                    'price_id' => $theme->paddle_price_id ?? null, // pre-configured in Paddle
                    'quantity' => 1,
                ]],
                'custom_data' => [
                    'tenant_id' => $tenant->id,
                    'marketplace_theme_id' => $theme->id,
                ],
            ]);

        if ($response->failed()) {
            throw new \Exception("Paddle subscription failed: " . $response->body());
        }

        $data = $response->json()['data'];

        return ThemeSubscription::create([
            'tenant_id' => $tenant->id,
            'marketplace_theme_id' => $theme->id,
            'vendor_id' => $theme->vendor_id,
            'provider' => 'paddle',
            'provider_subscription_id' => $data['id'],
            'provider_customer_id' => $data['customer_id'] ?? null,
            'status' => $data['status'],
            'amount' => $theme->subscription_monthly,
            'currency' => 'USD',
            'interval' => $interval,
            'current_period_start' => $data['current_billing_period']['starts_at'] ?? now(),
            'current_period_end' => $data['current_billing_period']['ends_at'] ?? now()->addMonth(),
        ]);
    }

    /**
     * Handle incoming Paddle webhook events.
     */
    public function handleWebhook(array $payload): void
    {
        $event = $payload['event_type'] ?? null;

        match ($event) {
            'transaction.completed'    => $this->onTransactionCompleted($payload),
            'subscription.activated'   => $this->onSubscriptionActivated($payload),
            'subscription.cancelled'   => $this->onSubscriptionCancelled($payload),
            'subscription.past_due'    => $this->onSubscriptionPastDue($payload),
            default => Log::info("Paddle unhandled event: {$event}"),
        };
    }

    private function onTransactionCompleted(array $payload): void
    {
        $data = $payload['data'];
        $custom = $data['custom_data'] ?? [];

        \App\Models\PaddleTransaction::create([
            'tenant_id' => $custom['tenant_id'],
            'paddle_transaction_id' => $data['id'],
            'amount' => $data['details']['totals']['total'] / 100,
            'tax' => $data['details']['totals']['tax'] / 100,
            'currency' => $data['currency_code'],
            'status' => 'completed',
            'payload' => $data,
        ]);

        if (!empty($custom['marketplace_theme_id'])) {
            $theme = MarketplaceTheme::find($custom['marketplace_theme_id']);
            if ($theme) {
                \App\Jobs\ProcessThemeInstallation::dispatch(
                    $custom['tenant_id'],
                    $theme->theme_id
                );
                $theme->increment('downloads');
            }
        }
    }

    private function onSubscriptionActivated(array $payload): void
    {
        $sub = $payload['data'];
        ThemeSubscription::where('provider_subscription_id', $sub['id'])
            ->update(['status' => 'active', 'current_period_end' => $sub['current_billing_period']['ends_at'] ?? null]);
    }

    private function onSubscriptionCancelled(array $payload): void
    {
        ThemeSubscription::where('provider_subscription_id', $payload['data']['id'])
            ->update(['status' => 'cancelled', 'cancelled_at' => now()]);
    }

    private function onSubscriptionPastDue(array $payload): void
    {
        ThemeSubscription::where('provider_subscription_id', $payload['data']['id'])
            ->update(['status' => 'past_due']);
    }
}
