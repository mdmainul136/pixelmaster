<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Tenant;
use App\Models\SubscriptionPlan;
use App\Services\FeatureFlagService;

class SubscriptionController extends Controller
{
    /**
     * Get all available subscription plans
     */
    public function index()
    {
        try {
            $plans = SubscriptionPlan::orderBy('price_monthly', 'asc')->get();

            return response()->json([
                'success' => true,
                'data' => $plans
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching plans',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the tenant's current subscription status globally (used for UI gating check).
     */
    public function status(Request $request)
    {
        try {
            $tenantId = $request->attributes->get('tenant_id');
            $tenant = Tenant::find($tenantId);
            
            if (!$tenant) {
                return response()->json(['success' => false, 'message' => 'Tenant not found'], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'plan_key' => $tenant->plan ?? 'free',
                    'tier'     => $tenant->plan ?? 'free',
                    'status'   => $tenant->status ?? 'active',
                    'is_trial' => $tenant->isTrialActive(),
                    'features' => \App\Models\SubscriptionPlan::where('plan_key', $tenant->plan ?? 'free')
                                    ->value('features') ?? [],
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve subscription status',
            ], 500);
        }
    }

    /**
     * Stub for module-related calls (deprecated)
     */
    public function tenantModules(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [] // No individual modules in the new sGTM architecture
        ]);
    }

    /**
     * Update/Subscribe to a plan (Direct subscription)
     */
    public function subscribe(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plan_key' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $tenantId = $request->attributes->get('tenant_id');
            $tenant = Tenant::findOrFail($tenantId);

            $tenant->upgradePlan($request->plan_key);

            // Flush feature cache so new plan takes effect immediately
            app(FeatureFlagService::class)->flushCache($tenant->id);

            return response()->json([
                'success' => true,
                'message' => 'Successfully upgraded to ' . ucfirst($request->plan_key) . ' plan',
                'plan'    => $request->plan_key,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error upgrading subscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a secure payment session for plan upgrade.
     * Supports: 'stripe' (Stripe Checkout) and 'sslcommerz'.
     */
    public function checkout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plan_key' => 'required_without:plan|string',
            'plan'     => 'required_without:plan_key|string',
            'gateway'  => 'nullable|string|in:stripe,sslcommerz',
            'billing_cycle' => 'nullable|string|in:monthly,yearly',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $tenantId = $request->attributes->get('tenant_id');
            $tenant = Tenant::findOrFail($tenantId);
            $planKey = $request->input('plan_key', $request->input('plan'));
            $gateway = $request->input('gateway', 'stripe');
            $cycle   = $request->input('billing_cycle', 'monthly');

            // 1. Validate Plan
            $planConfig = config("plans.{$planKey}");
            if (!$planConfig) {
                return response()->json(['success' => false, 'message' => 'Invalid plan selected'], 400);
            }

            // 2. Calculate Price (Monthly/Yearly)
            $price = ($cycle === 'yearly') ? $planConfig['price_yearly'] : $planConfig['price_monthly'];
            $currency = $planConfig['currency'] ?? 'USD';

            // 3. Initiate Gateway Session
            if ($gateway === 'stripe') {
                return $this->handleStripeCheckout($tenant, $planKey, $price, $currency, $cycle);
            }

            if ($gateway === 'sslcommerz') {
                return $this->handleSSLCommerzCheckout($tenant, $planKey, $price, $currency, $cycle);
            }

            return response()->json(['success' => false, 'message' => 'Payment gateway not supported'], 400);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to initiate checkout', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Stripe Checkout Logic
     */
    protected function handleStripeCheckout($tenant, $planKey, $price, $currency, $cycle)
    {
        // For now, we return a mock success URL or real Stripe logic if installed
        // In production, instantiate \Stripe\StripeClient and create session
        
        $successUrl = url("/billing/success?session_id={CHECKOUT_SESSION_ID}&plan={$planKey}");
        $cancelUrl  = url("/billing/cancel");

        return response()->json([
            'success' => true,
            'gateway' => 'stripe',
            'checkout_url' => $successUrl, // Placeholder for actual Stripe URL
            'message' => 'Stripe Checkout initiated (Sandbox)'
        ]);
    }

    /**
     * SSLCommerz Logic
     */
    protected function handleSSLCommerzCheckout($tenant, $planKey, $price, $currency, $cycle)
    {
        return response()->json([
            'success' => true,
            'gateway' => 'sslcommerz',
            'checkout_url' => url("/billing/ssl-bridge?plan={$planKey}"),
            'message' => 'SSLCommerz session prepared (Sandbox)'
        ]);
    }

    /**
     * Check if tenant has access to a specific feature key
     */
    public function checkAccess(Request $request, $featureKey)
    {
        try {
            $tenantId = $request->attributes->get('tenant_id');
            $tenant = Tenant::find($tenantId);
            $hasAccess = $tenant ? $tenant->hasFeature($featureKey) : false;
            $requiredPlan = $tenant ? $tenant->requiredPlanFor($featureKey) : null;

            return response()->json([
                'success'       => true,
                'has_access'    => $hasAccess,
                'required_plan' => $requiredPlan,
                'current_plan'  => $tenant?->plan ?? 'free',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking access',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * List billing invoices / payment history for the tenant.
     */
    public function invoices(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $tenantId = $request->attributes->get('tenant_id');
            $history  = [];

            if (class_exists(\App\Models\BillingTimeline::class)) {
                $records = \App\Models\BillingTimeline::where('tenant_id', $tenantId)
                    ->orderByDesc('created_at')
                    ->limit(20)
                    ->get();

                $history = $records->map(fn($r) => [
                    'description' => $r->description ?? 'Subscription Payment',
                    'plan'        => $r->plan_key ?? 'unknown',
                    'amount'      => number_format($r->amount ?? 0, 2),
                    'status'      => $r->status ?? 'paid',
                    'date'        => $r->created_at?->format('M j, Y'),
                    'pdf_url'     => $r->invoice_pdf_url ?? null,
                ])->toArray();
            }

            return response()->json(['success' => true, 'data' => $history]);

        } catch (\Exception $e) {
            return response()->json(['success' => true, 'data' => []]); // Graceful fallback
        }
    }
}
