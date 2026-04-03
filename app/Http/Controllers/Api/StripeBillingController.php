<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Services\StripeBillingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * StripeBillingController
 *
 * Handles Stripe Checkout, Billing Portal, and Webhook endpoints.
 *
 * API Routes (register in routes/api.php):
 *   POST /api/billing/checkout       → Create Checkout Session (redirect to Stripe)
 *   POST /api/billing/portal         → Create Billing Portal Session (manage card)
 *   GET  /api/billing/status          → Return current Stripe subscription status
 *   POST /api/stripe/webhook          → Stripe webhook receiver (no auth)
 */
class StripeBillingController extends Controller
{
    public function __construct(private StripeBillingService $billing) {}

    /**
     * Create a Stripe Checkout Session for upgrading to Pro/Business.
     * Returns a redirect URL to Stripe Hosted Checkout.
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'plan'     => 'required_without:plan_key|in:pro,business,enterprise',
            'plan_key' => 'required_without:plan|in:pro,business,enterprise',
        ]);

        $plan = $request->input('plan', $request->input('plan_key'));
        $request->merge(['plan' => $plan]); // Ensure 'plan' is populated for subsequent logic

        $tenant = $this->resolveTenant($request);
        if (!$tenant) {
            return response()->json(['success' => false, 'message' => 'Workspace not found'], 404);
        }

        // Only allow paid plans to trigger checkout
        if (!in_array($request->plan, ['pro', 'business', 'enterprise'])) {
            return response()->json(['success' => false, 'message' => 'Free plan does not require billing.'], 400);
        }

        try {
            $successUrl = url('/billing/success');
            $cancelUrl  = url('/billing/cancel');

            $checkoutUrl = $this->billing->createCheckoutSession(
                tenant: $tenant,
                plan: $request->plan,
                successUrl: $successUrl,
                cancelUrl: $cancelUrl,
            );

            return response()->json([
                'success'      => true,
                'checkout_url' => $checkoutUrl,
            ]);
        } catch (\Exception $e) {
            Log::error('StripeBillingController@checkout failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Generate a Stripe Billing Portal session URL.
     * Allows tenants to update their card, view invoices, cancel subscription.
     */
    public function portal(Request $request)
    {
        $tenant = $this->resolveTenant($request);
        if (!$tenant) {
            return response()->json(['success' => false, 'message' => 'Workspace not found'], 404);
        }

        if (!$tenant->stripe_customer_id) {
            return response()->json([
                'success' => false,
                'message' => 'No billing account found. Please subscribe to a paid plan first.',
            ], 422);
        }

        try {
            $returnUrl  = url('/settings/billing');
            $portalUrl  = $this->billing->createPortalSession($tenant, $returnUrl);

            return response()->json([
                'success'    => true,
                'portal_url' => $portalUrl,
            ]);
        } catch (\Exception $e) {
            Log::error('StripeBillingController@portal failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Return current Stripe subscription status for the tenant.
     */
    public function status(Request $request)
    {
        $tenant = $this->resolveTenant($request);
        if (!$tenant) {
            return response()->json(['success' => false, 'message' => 'Workspace not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'plan'                       => $tenant->plan,
                'stripe_customer_id'         => $tenant->stripe_customer_id,
                'stripe_subscription_status' => $tenant->stripe_subscription_status,
                'billing_required'           => $tenant->billing_required,
                'has_active_subscription'    => $tenant->stripe_subscription_status === 'active',
            ],
        ]);
    }

    /**
     * Handle incoming Stripe Webhook.
     * Routes: POST /api/stripe/webhook (must be excluded from CSRF + tenant auth)
     */
    public function webhook(Request $request)
    {
        $payload   = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature', '');

        try {
            $this->billing->handleWebhook($payload, $sigHeader);
            return response()->json(['received' => true]);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::error('Stripe webhook signature invalid: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        } catch (\Exception $e) {
            Log::error('Stripe webhook error: ' . $e->getMessage());
            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * Handle the post-Checkout success redirect.
     * Syncs the subscription state from the completed session.
     */
    public function checkoutSuccess(Request $request)
    {
        $sessionId = $request->query('session_id');
        if (!$sessionId) {
            return redirect('/dashboard')->with('error', 'Missing session ID.');
        }

        $tenant = $this->resolveTenant($request);
        if (!$tenant) {
            return redirect('/dashboard')->with('error', 'Tenant not found.');
        }

        try {
            $this->billing->syncSubscriptionFromSession($tenant, $sessionId);
            return redirect('/settings/billing')->with('success', 'Subscription activated successfully!');
        } catch (\Exception $e) {
            Log::error('Stripe checkout sync failed: ' . $e->getMessage());
            return redirect('/dashboard')->with('error', 'Failed to activate subscription. Please contact support.');
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private function resolveTenant(Request $request): ?Tenant
    {
        // 1. Stancl Tenancy Helper
        if (tenancy()->initialized) return tenant();

        // 2. Request Attribute (Set by IdentifyTenant middleware)
        $tenant = $request->attributes->get('tenant') ?: $request->tenant;
        if ($tenant instanceof Tenant) return $tenant;

        // 3. Auth fallback (Useful on localhost/central domain)
        foreach (['web', 'sanctum'] as $guard) {
            try {
                $user = auth($guard)->user();
                if ($user) {
                    $t = Tenant::on('central')->where('admin_email', $user->email)->first();
                    if ($t) return $t;
                }
            } catch (\Exception) {
                continue;
            }
        }

        // 4. Query/Body ID fallback
        $tenantId = $request->query('tenant_id') ?: $request->input('tenant_id') ?: $request->attributes->get('tenant_id');
        if ($tenantId) {
            return Tenant::on('central')->find($tenantId);
        }

        return null;
    }
}
