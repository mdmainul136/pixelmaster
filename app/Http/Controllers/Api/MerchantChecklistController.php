<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MerchantChecklistController extends Controller
{
    /**
     * Get the dynamic status of the merchant setup checklist.
     */
    public function index(Request $request)
    {
        try {
            $tenant = $request->get('tenant');

            if (!$tenant) {
                 // Fallback: Try to find from request attributes if mid-request identification was used
                $tenantId = $request->attributes->get('tenant_id');
                if ($tenantId) {
                    $tenant = \App\Models\Tenant::find($tenantId);
                }
            }

            if (!$tenant) {
                return response()->json(['success' => false, 'message' => 'Tenant not identified'], 400);
            }

            $businessPurpose = $tenant->business_category ?? $tenant->business_type ?? 'ecommerce';

            $status = [
                'business' => $this->checkBusinessInfo($tenant),
                'store' => $this->checkStoreSetup($tenant),
                'payments' => $this->checkPaymentGateway($tenant),
                'product' => $this->checkFirstProduct($tenant),
                'shipping' => $this->checkShippingSettings($tenant),
                'domain' => $this->checkCustomDomain($tenant),
                'maroof' => !empty($tenant->cr_number),
                'address' => !empty($tenant->address),
                'marketing' => false,
                'sgtm' => false,
                'cross-border-ior' => false,
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'purpose' => $businessPurpose,
                    'status' => $status
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error("MerchantChecklist Error: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'tenant' => $tenant->id ?? 'unknown'
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to load checklist status',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal Server Error'
            ], 500);
        }
    }

    private function checkBusinessInfo(Tenant $tenant): bool
    {
        return !empty($tenant->phone) && !empty($tenant->address) && !empty($tenant->city);
    }

    private function checkStoreSetup(Tenant $tenant): bool
    {
        return !empty($tenant->tenant_name) && !empty($tenant->domain);
    }

    private function checkPaymentGateway(Tenant $tenant): bool
    {
        // 1. Check central payment methods (Cards/Stripe)
        $hasStandardPayment = DB::connection('central')
            ->table('payment_methods')
            ->where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->exists();

        if ($hasStandardPayment) return true;

        // 2. Check tenant-specific gateways (Local Bangladesh context)
        return $tenant->run(function () {
            if (!Schema::hasTable('business_settings')) return false;

            return DB::table('business_settings')
                ->whereIn('group', ['bkash', 'nagad', 'sslcommerz'])
                ->where('key', 'is_active')
                ->where('value', '1')
                ->exists();
        });
    }

    private function checkFirstProduct(Tenant $tenant): bool
    {
        return $tenant->run(function () {
            // Check if products table exists first to avoid errors
            if (!Schema::hasTable('products')) return false;
            return DB::table('products')->exists();
        });
    }

    private function checkShippingSettings(Tenant $tenant): bool
    {
        return $tenant->run(function () {
            if (!Schema::hasTable('delivery_zones')) return false;
            return DB::table('delivery_zones')->exists();
        });
    }

    private function checkCustomDomain(Tenant $tenant): bool
    {
        // Domains are stored in the central database 'tenant_domains' table
        return DB::connection('central')
            ->table('tenant_domains')
            ->where('tenant_id', $tenant->id)
            ->where('is_verified', true)
            ->where('domain', 'NOT LIKE', '%.localhost')
            ->where('domain', 'NOT LIKE', '%.zosair.com')
            ->where('domain', 'NOT LIKE', '%.ngrok-free.app')
            ->exists();
    }
}
