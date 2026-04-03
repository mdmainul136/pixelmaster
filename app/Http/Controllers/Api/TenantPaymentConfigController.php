<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TenantPaymentConfigController extends Controller
{
    /**
     * GET /api/tenant/payments/config
     */
    public function index(Request $request)
    {
        $gateways = ['bkash', 'nagad', 'sslcommerz', 'eps', 'cod'];
        $data = [];

        foreach ($gateways as $gw) {
            $settings = BusinessSetting::getByGroup($gw);
            $data[$gw] = $this->maskSensitiveSettings($settings);
        }

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * POST /api/tenant/payments/config
     */
    public function update(Request $request)
    {
        $request->validate([
            'gateway' => 'required|in:bkash,nagad,sslcommerz,eps,cod',
            'settings' => 'required|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $gateway = $request->gateway;
        $settings = $request->settings;

        try {
            // Update settings
            foreach ($settings as $key => $value) {
                // Skip sensitive keys if they are masked (********)
                if ($this->isSensitiveKey($key) && $value === '********') {
                    continue;
                }
                BusinessSetting::set($key, $value, $gateway);
            }

            // Update status 
            if ($request->has('is_active')) {
                BusinessSetting::set('is_active', $request->is_active ? '1' : '0', $gateway);
            }

            return response()->json([
                'success' => true,
                'message' => ucfirst($gateway) . ' configuration updated successfully.'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update payment gateway config: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update configuration.'
            ], 500);
        }
    }

    /**
     * Mask sensitive settings
     */
    private function maskSensitiveSettings($settings)
    {
        $masked = [];
        foreach ($settings as $key => $value) {
            if ($this->isSensitiveKey($key) && !empty($value)) {
                $masked[$key] = '********';
                $masked[$key . '_is_set'] = true;
            } else {
                $masked[$key] = $value;
                if ($this->isSensitiveKey($key)) {
                    $masked[$key . '_is_set'] = false;
                }
            }
        }
        return $masked;
    }

    /**
     * Check if a key is sensitive
     */
    private function isSensitiveKey($key)
    {
        $sensitiveKeys = [
            'secretKey', 
            'merchantNumber', 
            'storePassword', 
            'password', 
            'webhookSecret',
            'app_secret',
            'password'
        ];
        return in_array($key, $sensitiveKeys);
    }
}
