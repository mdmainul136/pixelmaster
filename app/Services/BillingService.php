<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\PaymentMethod;
use App\Models\Payment;
use App\Models\Invoice;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class BillingService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Attempt to renew a subscription (TenantModule).
     */
    public function renewSubscription(TenantModule $subscription): array
    {
        $tenant = $subscription->tenant;
        $module = $subscription->module;

        if (!$subscription->auto_renew) {
            return ['success' => false, 'message' => 'Auto-renew is disabled for this subscription.'];
        }

        // 1. Get Default Payment Method
        $paymentMethod = PaymentMethod::where('tenant_id', $tenant->id)
            ->where('is_default', true)
            ->where('is_active', true)
            ->first();

        if (!$paymentMethod) {
            Log::warning("Renewal failed for tenant {$tenant->id}: No default payment method found.");
            return ['success' => false, 'message' => 'No default payment method found.'];
        }

        $amount = (float) ($subscription->price_paid ?? $module->price);
        $amountCents = (int) ($amount * 100);

        try {
            // 2. Create Payment Intent and Confirm (Off-Session)
            $intent = PaymentIntent::create([
                'amount' => $amountCents,
                'currency' => 'usd',
                'customer' => $tenant->stripe_id, // Assuming tenant has a stripe_id
                'payment_method' => $paymentMethod->stripe_payment_method_id,
                'off_session' => true,
                'confirm' => true,
                'metadata' => [
                    'tenant_id' => $tenant->id,
                    'module_id' => $module->id,
                    'type' => 'subscription_renewal',
                ],
            ]);

            if ($intent->status === 'succeeded') {
                return $this->handleSuccess($subscription, $intent, $amount);
            }

            return ['success' => false, 'message' => "Payment failed with status: {$intent->status}"];

        } catch (\Stripe\Exception\CardException $e) {
            // Card was declined
            $message = $e->getError()->message;
            Log::error("Renewal Card Error for tenant {$tenant->id}: " . $message);
            return ['success' => false, 'message' => $message];
        } catch (\Exception $e) {
            Log::error("Renewal Unexpected Error for tenant {$tenant->id}: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    protected function handleSuccess(TenantModule $subscription, PaymentIntent $intent, float $amount): array
    {
        return DB::transaction(function () use ($subscription, $intent, $amount) {
            $tenant = $subscription->tenant;

            // 1. Create Payment Record
            $payment = Payment::create([
                'tenant_id' => $tenant->id,
                'module_id' => $subscription->module_id,
                'amount' => $amount,
                'currency' => 'USD',
                'payment_method' => 'stripe',
                'payment_status' => 'completed',
                'stripe_payment_intent_id' => $intent->id,
                'paid_at' => now(),
            ]);

            // 2. Update Subscription
            $type = $subscription->subscription_type;
            $newExpiry = match ($type) {
                'monthly' => now()->addMonth(),
                'yearly'  => now()->addYear(),
                default   => $subscription->expires_at ? \Carbon\Carbon::parse($subscription->expires_at)->addMonth() : now()->addMonth(),
            };

            $subscription->update([
                'status' => 'active',
                'expires_at' => $newExpiry,
                'last_renewed_at' => now(),
                'payment_id' => $intent->id, // Store stripe ID as reference
            ]);

            // 3. Create Invoice
            $invoiceNumber = Invoice::generateInvoiceNumber();
            Invoice::create([
                'tenant_id' => $tenant->id,
                'payment_id' => $payment->id,
                'module_id' => $subscription->module_id,
                'invoice_number' => $invoiceNumber,
                'invoice_date' => now(),
                'due_date' => now(),
                'subscription_type' => $type,
                'subtotal' => $amount,
                'tax' => 0,
                'discount' => 0,
                'total' => $amount,
                'status' => 'paid',
                'notes' => "Automatic renewal: {$subscription->module->name}",
            ]);

            return [
                'success' => true,
                'message' => 'Subscription renewed successfully.',
                'expiry' => $newExpiry,
            ];
        });
    }
}
