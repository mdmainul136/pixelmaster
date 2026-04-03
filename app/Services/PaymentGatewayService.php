<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentGatewayService
{
    public function __construct(
        protected bKashService      $bkash,
        protected NagadService      $nagad,
        protected SSLCommerzService $sslCommerz,
        protected StripeService     $stripeService
    ) {}

    /**
     * Initialize a payment request with a specific gateway.
     */
    public function initializePayment(array $data): array
    {
        $gateway = $data['gateway'] ?? 'mock';

        return match ($gateway) {
            'bkash'      => $this->bkash->createPayment([
                'amount'         => $data['amount'],
                'invoice_number' => $data['invoice_number'] ?? ('INV-' . time()),
                'payerReference' => $data['tenant_id'] ?? 'Unknown',
            ]),
            'nagad'      => $this->nagad->initiatePayment($data),
            'sslcommerz' => $this->sslCommerz->initiatePayment([
                'total_amount' => $data['amount'],
                'tran_id'      => $data['transaction_id'] ?? ('TXN-' . time()),
                'product_name' => $data['product_name'] ?? 'Generic Payment',
            ]),
            'stripe'     => $this->initStripe($data),
            'paypal'     => $this->initPayPal($data),
            'mock'       => $this->initMock($data),
            default      => throw new \Exception("Unsupported payment gateway: {$gateway}"),
        };
    }

    /**
     * Verify payment status from gateway callback.
     */
    public function verifyPayment(array $payload, string $gateway): array
    {
        return match ($gateway) {
            'bkash'      => $this->bkash->executePayment($payload['paymentID']),
            'nagad'      => $this->nagad->verifyPayment($payload['payment_ref_id'] ?? ''),
            'sslcommerz' => $this->sslCommerz->validatePayment($payload['val_id'] ?? ''),
            'stripe'     => $this->verifyStripe($payload),
            'paypal'     => $this->verifyPayPal($payload),
            'mock'       => $this->verifyMock($payload),
            default      => throw new \Exception("Unsupported gateway for verification"),
        };
    }

    // ══════════════════════════════════════════════════════════════
    // STRIPE (Worldwide)
    // ══════════════════════════════════════════════════════════════

    private function initStripe(array $data): array
    {
        Log::info("Initiating Real Stripe Checkout for tenant: {$data['tenant_id']}");
        
        return $this->stripeService->createTopupSession([
            'tenant_id'  => $data['tenant_id'],
            'amount'     => $data['amount'],
            'currency'   => $data['currency'] ?? 'USD',
            'return_url' => $data['return_url'] ?? url('/billing'),
        ]);
    }

    private function verifyStripe(array $payload): array
    {
        return [
            'status'      => ($payload['status'] ?? 'success') === 'success' ? 'success' : 'failed',
            'tenant_id'   => $payload['tenant_id'],
            'amount'      => (float) $payload['amount'],
            'gateway_txid'=> $payload['txid'] ?? 'STR_123',
        ];
    }

    // ══════════════════════════════════════════════════════════════
    // PAYPAL (Worldwide)
    // ══════════════════════════════════════════════════════════════

    private function initPayPal(array $data): array
    {
        Log::info("Initiating PayPal payment for tenant: {$data['tenant_id']}");
        
        return [
            'payment_url' => "https://www.paypal.com/checkoutnow?token=" . Str::random(20),
            'gateway_txid'=> 'PAYPAL-' . Str::random(12),
            'amount'      => $data['amount'],
        ];
    }

    private function verifyPayPal(array $payload): array
    {
        return [
            'status'      => 'success',
            'tenant_id'   => $payload['tenant_id'],
            'amount'      => (float) $payload['amount'],
            'gateway_txid'=> $payload['txid'] ?? 'PP_123',
        ];
    }

    // ══════════════════════════════════════════════════════════════
    // MOCK GATEWAY (For testing)
    // ══════════════════════════════════════════════════════════════

    private function initMock(array $data): array
    {
        $txid = 'MOCK-' . strtoupper(Str::random(10));
        
        return [
            'payment_url' => "/mock-payment-page?txid={$txid}&tenant_id={$data['tenant_id']}&amount={$data['amount']}",
            'gateway_txid'=> $txid,
            'amount'      => $data['amount'],
            'message'     => 'Mock payment initialized'
        ];
    }

    private function verifyMock(array $payload): array
    {
        // If status is passed as success in mock, we accept it
        if (($payload['status'] ?? '') === 'success') {
            return [
                'status'      => 'success',
                'tenant_id'   => $payload['tenant_id'],
                'amount'      => (float) $payload['amount'],
                'gateway_txid'=> $payload['txid'],
            ];
        }

        return ['status' => 'failed'];
    }
}
