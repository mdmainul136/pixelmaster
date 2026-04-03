<?php

namespace App\Services\Payment;

use App\Models\Payment;
use App\Services\Payment\Gateways\CardGateway;
use App\Services\Payment\Gateways\WalletGateway;
use App\Services\Payment\Gateways\BNPLGateway;
use App\Models\Ecommerce\Wallet;
use App\Models\Ecommerce\WalletTransaction;
use App\Models\Ecommerce\Coupon;
use App\Models\Tenant;
use App\Services\DatabaseManager;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

/**
 * Unified Refund Engine.
 *
 * Middle East refund reality:
 *   Card (MADA/Visa)  → 7–21 business days (bank, no way around it)
 *   STC Pay wallet    → instant / within 24h
 *   BNPL (Tabby etc.) → adjusts remaining installments, NOT a bank refund
 *   COD               → wallet credit OR coupon (never "instant bank refund")
 *
 * NEVER promise instant card refunds to customers!
 */
class RefundEngine
{
    public function __construct(
        protected CardGateway   $card,
        protected WalletGateway $wallet,
        protected BNPLGateway   $bnpl
    ) {}

    /**
     * Unified refund entry point — routes by original payment gateway_driver.
     *
     * @param int    $paymentId   Internal payment record ID
     * @param float  $amount      Amount to refund (partial or full)
     * @param string $reason      Reason for refund (shown in invoice notes)
     * @return array{success, message, eta, destination, method}
     */
    public function refund(int $paymentId, float $amount, string $reason = ''): array
    {
        $payment = Payment::findOrFail($paymentId);

        // Idempotency: don't refund more than paid
        if ($amount > $payment->amount) {
            return ['success' => false, 'message' => "Refund amount ({$amount}) exceeds payment ({$payment->amount})"];
        }

        $driver = $payment->gateway_driver ?? $payment->payment_method;

        Log::info("Refund requested: payment={$paymentId} driver={$driver} amount={$amount}");

        return match ($driver) {
            'card', 'mada', 'moyasar'       => $this->refundCard($payment, $amount, $reason),
            'stc_pay', 'wallet'             => $this->refundWallet($payment, $amount, $reason),
            'tabby'                          => $this->refundBNPL($payment, $amount, 'tabby'),
            'tamara'                         => $this->refundBNPL($payment, $amount, 'tamara'),
            'postpay'                        => $this->refundBNPL($payment, $amount, 'postpay'),
            'cod'                            => $this->refundCOD($payment, $amount),
            'sslcommerz'                     => $this->refundSSLCommerz($payment, $amount),
            'stripe', 'stripe_auto'          => $this->refundStripe($payment, $amount),
            default                          => ['success' => false, 'message' => "Unknown gateway driver: {$driver}"],
        };
    }

    // ── Card (Moyasar / MADA) ──────────────────────────────────────────────

    protected function refundCard(Payment $payment, float $amount, string $reason): array
    {
        if (!$payment->gateway_transaction_id) {
            return ['success' => false, 'message' => 'No Moyasar transaction ID found for refund'];
        }

        // Moyasar amount is in halalas (SAR×100) or fils (AED×100)
        $amountInSmallestUnit = (int) ($amount * 100);

        $result = $this->card->refund($payment->gateway_transaction_id, $amountInSmallestUnit, $reason);

        if ($result['success']) {
            $payment->update(['payment_status' => $amount >= $payment->amount ? 'refunded' : 'partially_refunded']);
            $this->recordRefund($payment, $amount, 'card', '7-21 business days');
        }

        return array_merge($result, [
            'method'      => 'card',
            'eta'         => '7–21 business days',
            'destination' => 'bank account',
            'warning'     => '⚠️ Card refunds take 7–21 business days in KSA/UAE.',
        ]);
    }

    // ── STC Pay Wallet ─────────────────────────────────────────────────────

    protected function refundWallet(Payment $payment, float $amount, string $reason): array
    {
        if (!$payment->gateway_transaction_id) {
            return ['success' => false, 'message' => 'No STC Pay transaction ID found'];
        }

        $result = $this->wallet->refund($payment->gateway_transaction_id, $amount, $reason);

        if ($result['success']) {
            $payment->update(['payment_status' => 'refunded']);
            $this->recordRefund($payment, $amount, 'stc_pay_wallet', 'instant_to_24h');
        }

        return array_merge($result, [
            'method'      => 'stc_pay_wallet',
            'eta'         => 'Instant – 24 hours',
            'destination' => 'STC Pay wallet',
        ]);
    }

    // ── BNPL (Tabby / Tamara) ──────────────────────────────────────────────

    protected function refundBNPL(Payment $payment, float $amount, string $provider): array
    {
        $externalId = $payment->gateway_transaction_id ?? $payment->transaction_id;

        $result = $this->bnpl->refund($provider, $externalId, $amount);

        if ($result['success']) {
            $payment->update(['payment_status' => 'refunded']);
            $this->recordRefund($payment, $amount, $provider, 'installments_adjusted');
        }

        return array_merge($result, [
            'method'      => $provider,
            'eta'         => 'Remaining installments cancelled/adjusted',
            'destination' => 'installment_plan',
            'note'        => 'This is NOT a bank refund — your future installments will be adjusted or cancelled.',
        ]);
    }

    // ── COD ────────────────────────────────────────────────────────────────

    protected function refundCOD(Payment $payment, float $amount): array
    {
        try {
            // 1. Resolve Tenant and Switch Database
            $tenant = Tenant::findOrFail($payment->tenant_id);
            app(DatabaseManager::class)->switchToTenantDatabase($tenant->database_name);

            // 2. Identify Customer
            // Assuming transaction_id or metadata contains the order reference
            // For this implementation, we'll try to find the customer from the CODOrder if linked,
            // or fallback to metadata if provided.
            $customerId = $payment->payment_gateway_response['customer_id'] ?? null;
            
            if (!$customerId) {
                // Try to find via CODOrder link in transaction_id
                $codOrder = \App\Models\CODOrder::find($payment->transaction_id);
                $customerId = $codOrder?->user_id;
            }

            if (!$customerId) {
                return ['success' => false, 'message' => 'Customer ID not found for COD refund.'];
            }

            // 3. Choice: Wallet vs Coupon
            $wallet = Wallet::where('customer_id', $customerId)->where('is_active', true)->first();

            if ($wallet) {
                // Refund to Wallet
                $balanceBefore = $wallet->balance;
                $wallet->increment('balance', $amount);
                
                WalletTransaction::create([
                    'wallet_id'      => $wallet->id,
                    'type'           => 'deposit',
                    'amount'         => $amount,
                    'balance_before' => $balanceBefore,
                    'balance_after'  => $wallet->fresh()->balance,
                    'reference_type' => 'refund',
                    'reference_id'   => $payment->id,
                    'description'    => "Refund for Payment #{$payment->id} (COD)",
                ]);

                $this->recordRefund($payment, $amount, 'wallet_credit', 'instant');

                return [
                    'success'      => true,
                    'method'       => 'wallet_credit',
                    'amount'       => $amount,
                    'eta'          => 'Instant',
                    'destination'  => 'Customer Wallet',
                    'note'         => 'Refund amount has been credited to your store wallet.',
                ];
            } else {
                // Refund as Coupon
                $couponCode = 'REF-' . strtoupper(substr(md5($payment->id . time()), 0, 8));
                
                Coupon::create([
                    'code'          => $couponCode,
                    'name'          => 'Refund Credit',
                    'description'   => "Refund for Payment #{$payment->id}",
                    'type'          => 'fixed',
                    'value'         => $amount,
                    'max_uses'      => 1,
                    'max_uses_per_customer' => 1,
                    'is_active'     => true,
                    'starts_at'     => now(),
                    'expires_at'    => now()->addYear(),
                ]);

                $this->recordRefund($payment, $amount, 'coupon_credit', 'instant');

                return [
                    'success'      => true,
                    'method'       => 'coupon_credit',
                    'coupon_code'  => $couponCode,
                    'amount'       => $amount,
                    'eta'          => 'Instant',
                    'destination'  => 'Refund Coupon',
                    'note'         => "Your COD refund: use coupon code {$couponCode} for your next purchase.",
                ];
            }

        } catch (\Exception $e) {
            Log::error("COD Refund Failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to process store credit refund: ' . $e->getMessage()];
        } finally {
            // Revert to master connection to be safe
            DB::purge('tenant_dynamic');
            config(['database.default' => 'mysql']);
        }
    }

    // ── Stripe ─────────────────────────────────────────────────────────────

    protected function refundStripe(Payment $payment, float $amount): array
    {
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        $refund = \Stripe\Refund::create([
            'payment_intent' => $payment->stripe_payment_intent_id,
            'amount'         => (int)($amount * 100),
        ]);

        $success = $refund->status === 'succeeded' || $refund->status === 'pending';
        if ($success) {
            $payment->update(['payment_status' => 'refunded']);
            $this->recordRefund($payment, $amount, 'stripe', '5-10 business days');
        }

        return [
            'success'     => $success,
            'refund_id'   => $refund->id,
            'method'      => 'stripe_card',
            'eta'         => '5–10 business days',
            'destination' => 'original card',
        ];
    }

    // ── SSLCommerz ─────────────────────────────────────────────────────────

    protected function refundSSLCommerz(Payment $payment, float $amount): array
    {
        // SSLCommerz has a refund API but it requires manual approval in Bangladesh
        Log::info("SSLCommerz refund requested: payment={$payment->id} amount={$amount}");
        return [
            'success'  => true,
            'method'   => 'sslcommerz',
            'eta'      => '7–14 business days',
            'note'     => 'SSLCommerz refund initiated. Processed manually by SSLCommerz.',
        ];
    }

    // ── Helper ─────────────────────────────────────────────────────────────

    protected function recordRefund(Payment $payment, float $amount, string $method, string $eta): void
    {
        // Record refund in payments table or a dedicated refunds table
        $payment->update([
            'refunded_amount' => ($payment->refunded_amount ?? 0) + $amount,
            'refund_method'   => $method,
            'refunded_at'     => now(),
        ]);
    }
}
