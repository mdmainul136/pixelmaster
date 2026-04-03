<?php

namespace App\Services;

use App\Models\BusinessSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class bKashService
{
    protected string $baseUrl;
    protected string $appKey;
    protected string $appSecret;
    protected string $username;
    protected string $password;

    public function __construct()
    {
        // Load credentials from BusinessSetting (Tenant-specific)
        // Fallback to config if not set in tenant settings
        $config = BusinessSetting::getByGroup('bkash');

        $this->appKey    = (string) ($config['app_key'] ?? config('services.bkash.app_key'));
        $this->appSecret = (string) ($config['app_secret'] ?? config('services.bkash.app_secret'));
        $this->username  = (string) ($config['username'] ?? config('services.bkash.username'));
        $this->password  = (string) ($config['password'] ?? config('services.bkash.password'));
        $sandbox         = $config['sandbox'] ?? config('services.bkash.sandbox', true);

        $this->baseUrl = $sandbox
            ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
            : 'https://tokenized.pay.bka.sh/v1.2.0-beta';
    }

    /**
     * Get Authorization Token
     */
    protected function getToken(): string
    {
        $response = Http::withHeaders([
            'username' => $this->username,
            'password' => $this->password,
        ])->post($this->baseUrl . '/tokenized/checkout/token/grant', [
            'app_key'    => $this->appKey,
            'app_secret' => $this->appSecret,
        ]);

        if ($response->failed()) {
            throw new \Exception('bKash Token Grant Failed: ' . $response->body());
        }

        return $response->json('id_token');
    }

    /**
     * Create Payment
     */
    public function createPayment(array $params): array
    {
        $token = $this->getToken();

        $response = Http::withToken($token)
            ->withHeaders(['X-App-Key' => $this->appKey])
            ->post($this->baseUrl . '/tokenized/checkout/create', [
                'intent'                => 'sale',
                'mode'                  => '0011', // Checkout
                'payerReference'        => $params['payerReference'] ?? 'MerchantOrder',
                'currency'              => 'BDT',
                'amount'                => $params['amount'],
                'callbackURL'           => route('bkash.callback'),
                'merchantInvoiceNumber' => $params['invoice_number'],
            ]);

        if ($response->failed()) {
            Log::error('bKash Create Payment Failed', ['body' => $response->body()]);
            throw new \Exception('bKash Payment Creation Failed');
        }

        return $response->json();
    }

    /**
     * Execute Payment
     */
    public function executePayment(string $paymentId): array
    {
        $token = $this->getToken();

        $response = Http::withToken($token)
            ->withHeaders(['X-App-Key' => $this->appKey])
            ->post($this->baseUrl . '/tokenized/checkout/execute', [
                'paymentID' => $paymentId,
            ]);

        return $response->json();
    }

    /**
     * Query Payment
     */
    public function queryPayment(string $paymentId): array
    {
        $token = $this->getToken();

        $response = Http::withToken($token)
            ->withHeaders(['X-App-Key' => $this->appKey])
            ->get($this->baseUrl . '/tokenized/checkout/payment/status', [
                'paymentID' => $paymentId,
            ]);

        return $response->json();
    }
}
