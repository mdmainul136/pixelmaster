<?php

namespace App\Services;

use App\Models\BusinessSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class NagadService
{
    protected string $baseUrl;
    protected string $merchantId;
    protected string $merchantNumber;
    protected string $publicKey;
    protected string $privateKey;

    public function __construct()
    {
        $config = BusinessSetting::getByGroup('nagad');

        $this->merchantId     = (string) ($config['merchant_id'] ?? config('services.nagad.merchant_id'));
        $this->merchantNumber = (string) ($config['merchant_number'] ?? config('services.nagad.merchant_number'));
        $this->publicKey      = (string) ($config['public_key'] ?? config('services.nagad.public_key'));
        $this->privateKey     = (string) ($config['private_key'] ?? config('services.nagad.private_key'));
        $sandbox              = $config['sandbox'] ?? config('services.nagad.sandbox', true);

        $this->baseUrl = $sandbox
            ? 'https://sandbox.mynagad.com:10080/api/dfs'
            : 'https://api.mynagad.com/api/dfs';
    }

    /**
     * Step 1: Initialize Payment (Handshake)
     */
    public function initiatePayment(array $params): array
    {
        $dateTime = now()->format('YmdHis');
        $orderId  = $params['order_id'] ?? Str::random(12);
        
        // Nagad requires a complex RSA encryption flow
        // 1. Generate multi-step JSON payload
        // 2. Encrypt sensitive parts with Nagad's Public Key
        // 3. Sign the payload with Merchant's Private Key
        
        Log::info("Initiating Nagad payment for Order: {$orderId}");

        try {
            // Placeholder for the actual API call to /check-out/initialize/{merchantId}/{orderId}
            // For now, we simulate success and return a payment URL
            
            $txid = 'NGD-' . strtoupper(Str::random(12));
            
            return [
                'success'      => true,
                'payment_url'  => $this->baseUrl . "/check-out/" . Str::random(32),
                'gateway_txid' => $txid,
                'merchant_id'  => $this->merchantId,
                'order_id'     => $orderId,
            ];
        } catch (\Exception $e) {
            Log::error("Nagad Initialization Failed: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Step 2: Verify Payment Status
     */
    public function verifyPayment(string $paymentReference): array
    {
        Log::info("Verifying Nagad payment: {$paymentReference}");

        // Placeholder for call to /check-out/verify/{paymentReference}
        
        return [
            'status'       => 'success',
            'amount'       => 0, // In real flow, fetch from Nagad API
            'gateway_txid' => $paymentReference,
            'verified_at'  => now(),
        ];
    }

    /**
     * RSA Encryption logic (Internal helper)
     */
    protected function encryptWithPublicKey(string $data): string
    {
        // openssl_public_encrypt logic would go here
        return base64_encode($data); 
    }

    /**
     * RSA Signing logic (Internal helper)
     */
    protected function signWithPrivateKey(string $data): string
    {
        // openssl_sign logic would go here
        return base64_encode($data);
    }
}
