<?php

namespace App\Services;

use App\Models\ThemeVendor;
use App\Models\ThemePurchase;
use App\Models\VendorPayout;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * VendorPayoutService
 * Automates weekly/biweekly vendor earnings payouts via Stripe Connect or Paddle.
 */
class VendorPayoutService
{
    public function __construct()
    {
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Automated payout for all eligible vendors.
     * Called via scheduled command: php artisan theme:payout-vendors
     */
    public function processAllPayouts(string $interval = 'weekly'): void
    {
        $periodStart = Carbon::now()->startOfWeek()->subWeek();
        $periodEnd   = Carbon::now()->startOfWeek();

        ThemeVendor::where('is_active', true)
            ->where('is_verified', true)
            ->chunk(50, function ($vendors) use ($periodStart, $periodEnd) {
                foreach ($vendors as $vendor) {
                    $this->processVendorPayout($vendor, $periodStart, $periodEnd);
                }
            });
    }

    /**
     * Process payout for a single vendor using Stripe Connect.
     */
    public function processVendorPayout(ThemeVendor $vendor, Carbon $periodStart, Carbon $periodEnd): ?VendorPayout
    {
        $earnings = ThemePurchase::where('vendor_id', $vendor->id)
            ->where('payment_status', 'completed')
            ->whereNull('paid_out_at')
            ->whereBetween('purchased_at', [$periodStart, $periodEnd])
            ->sum('vendor_earnings');

        if ($earnings <= 0) {
            return null;
        }

        $payout = VendorPayout::create([
            'vendor_id'    => $vendor->id,
            'amount'       => $earnings,
            'currency'     => 'USD',
            'provider'     => 'stripe',
            'status'       => 'processing',
            'period_start' => $periodStart->toDateString(),
            'period_end'   => $periodEnd->toDateString(),
        ]);

        try {
            $stripeAccountId = $vendor->payout_details['stripe_account_id'] ?? null;
            if (!$stripeAccountId) {
                throw new \Exception("No Stripe Connect account for vendor {$vendor->id}");
            }

            $transfer = \Stripe\Transfer::create([
                'amount'      => intval($earnings * 100),
                'currency'    => 'usd',
                'destination' => $stripeAccountId,
                'metadata'    => [
                    'vendor_id'    => $vendor->id,
                    'period_start' => $periodStart->toDateString(),
                    'period_end'   => $periodEnd->toDateString(),
                ],
            ]);

            // Mark the purchases as paid out
            ThemePurchase::where('vendor_id', $vendor->id)
                ->where('payment_status', 'completed')
                ->whereNull('paid_out_at')
                ->whereBetween('purchased_at', [$periodStart, $periodEnd])
                ->update(['paid_out_at' => now()]);

            $payout->update([
                'provider_transfer_id' => $transfer->id,
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            Log::info("Vendor payout completed: vendor={$vendor->id}, amount={$earnings}");
        } catch (\Exception $e) {
            $payout->update([
                'status' => 'failed',
                'failure_reason' => $e->getMessage(),
            ]);
            Log::error("Vendor payout failed: vendor={$vendor->id} - " . $e->getMessage());
        }

        return $payout;
    }

    /**
     * Onboard a vendor to Stripe Connect (returns account link URL).
     */
    public function createStripeConnectAccount(ThemeVendor $vendor): string
    {
        $account = \Stripe\Account::create([
            'type' => 'express',
            'email' => $vendor->support_email,
            'metadata' => ['vendor_id' => $vendor->id],
            'capabilities' => [
                'card_payments' => ['requested' => true],
                'transfers' => ['requested' => true],
            ],
        ]);

        // Store Stripe account ID
        $vendor->update([
            'payout_details' => array_merge(
                $vendor->payout_details ?? [],
                ['stripe_account_id' => $account->id]
            ),
        ]);

        $link = \Stripe\AccountLink::create([
            'account' => $account->id,
            'refresh_url' => config('app.url') . "/vendor/onboarding/refresh",
            'return_url'  => config('app.url') . "/vendor/onboarding/complete",
            'type' => 'account_onboarding',
        ]);

        return $link->url;
    }
}
