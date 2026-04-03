<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class StripeService
{
    protected string $secretKey;

    public function __construct()
    {
        $this->secretKey = config('services.stripe.secret');
    }

    /**
     * Create a Stripe Checkout Session for wallet topup.
     *
     * @param array $data ['tenant_id', 'amount', 'currency', 'return_url']
     * @return array
     */
    public function createTopupSession(array $data): array
    {
        $tenantId  = $data['tenant_id'];
        $amount    = $data['amount'];
        $currency  = strtolower($data['currency'] ?? 'usd');
        
        // Build tenant-specific frontend URL for redirect after payment
        $frontendBaseUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

        if ($tenantId) {
            // Build subdomain URL: http://{tenant}.localhost:3000
            $parsed = parse_url($frontendBaseUrl);
            $scheme = $parsed['scheme'] ?? 'http';
            $host   = $parsed['host']   ?? 'localhost';
            $port   = isset($parsed['port']) ? ':' . $parsed['port'] : '';
            $returnUrl = "{$scheme}://{$tenantId}.{$host}{$port}/ior/billing";
        } else {
            $returnUrl = $frontendBaseUrl . '/ior/billing';
        }

        // Stripe amount is in cents
        $amountCents = (int) round($amount * 100);

        // Route success/cancel through backend so we can verify + credit wallet before redirecting
        $backendSuccessUrl = url('/api/ior/payment/billing/stripe-success')
            . '?session_id={CHECKOUT_SESSION_ID}'
            . '&tenant_id=' . $tenantId
            . '&amount=' . $amount;

        $backendCancelUrl = url('/api/ior/payment/billing/stripe-cancel')
            . '?tenant_id=' . $tenantId;

        Log::info("Creating Stripe Topup Session for tenant: {$tenantId}, amount: {$amount} {$currency}");

        $payload = [
            'mode'                       => 'payment',
            'payment_method_types'       => ['card'],
            'success_url'                => $backendSuccessUrl,
            'cancel_url'                 => $backendCancelUrl,
            'client_reference_id'        => $tenantId,
            'metadata[tenant_id]'        => $tenantId,
            'metadata[type]'             => 'wallet_topup',
            'line_items[0][quantity]'    => 1,
            'line_items[0][price_data][currency]'               => $currency,
            'line_items[0][price_data][unit_amount]'            => $amountCents,
            'line_items[0][price_data][product_data][name]'     => 'Wallet Top-up Credits',
            'line_items[0][price_data][product_data][description]' => 'Platform credits to use across services.',
        ];

        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->asForm()
                ->timeout(20)
                ->post('https://api.stripe.com/v1/checkout/sessions', $payload);

            if ($response->failed()) {
                $err = $response->json('error.message', $response->body());
                Log::error("[Stripe Service] Session creation failed: " . $err);
                throw new \Exception("Stripe error: " . $err);
            }

            $session = $response->json();

            return [
                'payment_url'  => $session['url'],
                'gateway_txid' => $session['id'],
                'amount'       => $amount,
                'currency'     => $currency,
            ];
        } catch (\Exception $e) {
            Log::error("[Stripe Service] Exception: " . $e->getMessage());
            throw $e;
        }
    }
}
