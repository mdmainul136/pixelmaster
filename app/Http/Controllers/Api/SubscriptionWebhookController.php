<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\TenantSubscription;
use App\Services\FeatureFlagService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * SubscriptionWebhookController
 *
 * Handles payment gateway callbacks after a successful plan upgrade.
 * On success:
 *   1. Upgrades the tenant's plan in the DB via Tenant::upgradePlan()
 *   2. Creates/updates a TenantSubscription record
 *   3. Flushes the feature cache so the new plan takes effect immediately
 */
class SubscriptionWebhookController extends Controller
{
    public function __construct(private FeatureFlagService $featureFlags) {}

    // ──────────────────────────────────────────────────────────────────────────
    // Stripe Webhook
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Handle Stripe Checkout Webhook.
     * Events handled:
     *   - checkout.session.completed → upgrade plan
     *   - customer.subscription.updated → plan change
     *   - customer.subscription.deleted → downgrade to free
     */
    public function stripe(Request $request)
    {
        $payload = $request->all();
        $type    = $payload['type'] ?? '';

        Log::info("PixelMaster Stripe Webhook [{$type}]");

        switch ($type) {
            case 'checkout.session.completed':
                $session  = $payload['data']['object'];
                $planKey  = $session['metadata']['plan_key']  ?? null;
                $tenantId = $session['metadata']['tenant_id'] ?? null;
                $stripeCustomerId = $session['customer'] ?? null;
                $stripeSubId      = $session['subscription'] ?? null;

                if ($tenantId && $planKey) {
                    $this->applyPlanUpgrade($tenantId, $planKey, [
                        'gateway'            => 'stripe',
                        'gateway_customer_id' => $stripeCustomerId,
                        'gateway_sub_id'      => $stripeSubId,
                    ]);
                }
                break;

            case 'customer.subscription.updated':
                // Handle mid-cycle plan changes (e.g., upgrade from Pro → Business)
                $sub   = $payload['data']['object'];
                $planKey  = $sub['metadata']['plan_key']  ?? null;
                $tenantId = $sub['metadata']['tenant_id'] ?? null;
                if ($tenantId && $planKey) {
                    $this->applyPlanUpgrade($tenantId, $planKey, ['gateway' => 'stripe']);
                }
                break;

            case 'customer.subscription.deleted':
                // Subscription cancelled → downgrade to free
                $sub      = $payload['data']['object'];
                $tenantId = $sub['metadata']['tenant_id'] ?? null;
                if ($tenantId) {
                    $this->applyPlanUpgrade($tenantId, 'free', ['gateway' => 'stripe']);
                    Log::info("PixelMaster: Tenant [{$tenantId}] subscription cancelled → downgraded to free.");
                }
                break;

            case 'invoice.payment_failed':
                $tenantId = $payload['data']['object']['metadata']['tenant_id'] ?? null;
                if ($tenantId) {
                    Log::warning("PixelMaster: Payment failed for Tenant [{$tenantId}].");
                    // Optionally send notification / set status to past_due
                }
                break;

            default:
                Log::debug("PixelMaster: Unhandled Stripe event [{$type}]");
        }

        return response()->json(['received' => true]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // SSLCommerz Callback
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Handle SSLCommerz Success Callback.
     * Called after successful payment on the SSL bridge page.
     */
    public function sslcommerz(Request $request)
    {
        $status   = $request->input('status');
        $planKey  = $request->input('plan');
        $tenantId = $request->input('tenant_id');
        $tranId   = $request->input('tran_id');

        Log::info("PixelMaster SSLCommerz Webhook [{$status}] Tenant:[{$tenantId}] Plan:[{$planKey}] Tran:[{$tranId}]");

        if ($status === 'VALID' && $tenantId && $planKey) {
            $this->applyPlanUpgrade($tenantId, $planKey, [
                'gateway'      => 'sslcommerz',
                'gateway_trans_id' => $tranId,
            ]);
        } elseif ($status === 'FAILED' || $status === 'CANCELLED') {
            Log::warning("PixelMaster: SSLCommerz payment [{$status}] for Tenant [{$tenantId}] — plan not changed.");
        }

        $frontendUrl = env('FRONTEND_URL', 'https://app.pixelmasters.io');
        return redirect()->to($frontendUrl . '/billing/success?gateway=sslcommerz&status=' . strtolower($status));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Shared Logic
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Apply a plan upgrade to a tenant.
     *
     * 1. Upgrades tenant.plan column
     * 2. Creates/updates TenantSubscription record
     * 3. Flushes feature cache (so Redis/file cache reflects new plan instantly)
     *
     * @param string $tenantId
     * @param string $planKey  e.g. 'pro', 'business', 'enterprise'
     * @param array  $meta     Optional gateway metadata
     */
    protected function applyPlanUpgrade(string $tenantId, string $planKey, array $meta = []): void
    {
        try {
            $tenant = Tenant::find($tenantId);
            if (!$tenant) {
                Log::error("PixelMaster: applyPlanUpgrade — Tenant [{$tenantId}] not found.");
                return;
            }

            $oldPlan = $tenant->plan ?? 'free';

            // 1. Update tenant plan
            $tenant->upgradePlan($planKey);

            // 2. Update/create subscription record (if model exists)
            if (class_exists(TenantSubscription::class)) {
                TenantSubscription::updateOrCreate(
                    ['tenant_id' => $tenantId],
                    [
                        'plan_key'             => $planKey,
                        'status'               => 'active',
                        'gateway'              => $meta['gateway'] ?? 'manual',
                        'gateway_customer_id'  => $meta['gateway_customer_id'] ?? null,
                        'gateway_sub_id'       => $meta['gateway_sub_id'] ?? null,
                        'gateway_trans_id'     => $meta['gateway_trans_id'] ?? null,
                        'starts_at'            => now(),
                        'expires_at'           => now()->addMonth(),
                    ]
                );
            }

            // 3. Flush feature cache — ensures new features are available immediately
            $this->featureFlags->flushCache($tenantId);

            Log::info("PixelMaster: Tenant [{$tenantId}] upgraded [{$oldPlan}] → [{$planKey}] via [{$meta['gateway']}]. Cache flushed.");

        } catch (\Throwable $e) {
            Log::error("PixelMaster: applyPlanUpgrade failed for Tenant [{$tenantId}]: " . $e->getMessage());
        }
    }
}
