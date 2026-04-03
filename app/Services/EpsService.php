<?php

namespace App\Services;

use App\Models\BusinessSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EpsService
{
    protected string $baseUrl;
    protected string $username;
    protected string $password;
    protected string $storeId;
    protected string $hashKey;

    public function __construct()
    {
        $config = BusinessSetting::getByGroup('eps');

        $this->username = $config['username'] ?? '';
        $this->password = $config['password'] ?? '';
        $this->storeId  = $config['store_id'] ?? '';
        $this->hashKey  = $config['hash_key'] ?? ''; // Set this in settings if known

        $sandbox = (bool)($config['environment'] === 'sandbox' || $config['sandbox'] === '1');
        $this->baseUrl = $sandbox
            ? 'https://sandboxpgapi.eps.com.bd/v1'
            : 'https://pgapi.eps.com.bd/v1';
    }

    /**
     * Get Authorization Token
     */
    protected function getToken(): string
    {
        $payload = [
            'userName' => $this->username,
            'password' => $this->password,
        ];

        $body = json_encode($payload);
        $hash = $this->calculateHash($body);

        $response = Http::withHeaders([
            'x-hash' => $hash,
            'Content-Type' => 'application/json',
        ])->post($this->baseUrl . '/Auth/GetToken', $payload);

        if ($response->failed()) {
            throw new \Exception('EPS Token Grant Failed: ' . $response->body());
        }

        return $response->json('token');
    }

    /**
     * Initialize Payment Request
     */
    public function createPayment(array $data): array
    {
        $token = $this->getToken();
        
        $payload = [
            'storeId' => $this->storeId,
            'merchantTransactionId' => $data['merchantTransactionId'] ?? uniqid(),
            'CustomerOrderId' => $data['CustomerOrderId'] ?? 'ORD-' . time(),
            'transactionTypeId' => 10, // Regular Sale
            'financialEntityId' => 0,
            'transitionStatusId' => 0,
            'totalAmount' => (float)$data['totalAmount'],
            'ipAddress' => request()->ip() ?? '127.0.0.1',
            'version' => 'V1',
            'successUrl' => route('eps.success'),
            'failUrl' => route('eps.fail'),
            'cancelUrl' => route('eps.fail'), // Map cancel to fail or separate if needed
            'customerName' => $data['customerName'] ?? 'Customer',
            'customerEmail' => $data['customerEmail'] ?? '',
            'customerPhone' => $data['customerPhone'] ?? '',
            'customerAddress' => $data['customerAddress'] ?? '',
            'customerCity' => $data['customerCity'] ?? '',
            'customerPostcode' => $data['customerPostcode'] ?? '',
            'customerCountry' => $data['customerCountry'] ?? 'BD',
            'productName' => $data['productName'] ?? 'Order Payment',
            'productProfile' => 'General',
            'productCategory' => 'Multi',
            'ProductList' => $data['ProductList'] ?? []
        ];

        $body = json_encode($payload);
        $hash = $this->calculateHash($body);

        $response = Http::withToken($token)
            ->withHeaders([
                'x-hash' => $hash,
                'Content-Type' => 'application/json'
            ])
            ->post($this->baseUrl . '/EPSEngine/InitializeEPS', $payload);

        if ($response->failed()) {
            Log::error('EPS Payment Initialization Failed', ['body' => $response->body()]);
            throw new \Exception('EPS Payment Initiation Failed: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Check Transaction Status
     */
    public function checkStatus(string $merchantTransactionId): array
    {
        $token = $this->getToken();
        
        // Headers need hash for every request usually
        $hash = $this->calculateHash($merchantTransactionId); // Verification needed for query string hash

        $response = Http::withToken($token)
            ->withHeaders([
                'x-hash' => $hash
            ])
            ->get($this->baseUrl . '/EPSEngine/CheckMerchantTransactionStatus', [
                'merchantTransactionId' => $merchantTransactionId
            ]);

        return $response->json();
    }

    /**
     * Calculate x-hash header
     * Note: EPS Hash logic typically uses SHA-512.
     */
    protected function calculateHash(string $data): string
    {
        // Based on typical BD PG logic, it might be SHA512 of (Payload + Secret)
        // For now, if secret is empty, we just do SHA512.
        if (empty($this->hashKey)) {
             return base64_encode(hash('sha512', $data, true));
        }
        
        return base64_encode(hash_hmac('sha512', $data, $this->hashKey, true));
    }
}
