<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Invoice;
use Illuminate\Support\Facades\Log;

class BillingEnforcementService
{
    /**
     * Check the billing health of a tenant and update status if necessary.
     *
     * @param Tenant $tenant
     * @return string Current status
     */
    public function checkTenantHealth(Tenant $tenant): string
    {
        // 1. Check for past-due Stripe subscriptions exceeding grace period (3 days)
        $pastDueSubscription = \App\Models\TenantSubscription::where('tenant_id', $tenant->id)
            ->where('status', 'past_due')
            ->where('updated_at', '<', now()->subDays(3))
            ->first();

        if ($pastDueSubscription) {
            if ($tenant->status !== 'suspended') {
                $tenant->update(['status' => 'suspended']);
                Log::warning("Tenant {$tenant->tenant_id} marked as 'suspended' due to past_due subscription exceeding grace period.");
            }
            return $tenant->status;
        }

        // 2. Get overdue invoices (for non-stripe/manual payments or module invoices)
        $overdueCount = Invoice::where('tenant_id', $tenant->id)
            ->where('status', 'pending')
            ->where('due_date', '<', now()->subDays(3)) // 3-day grace period
            ->count();

        if ($overdueCount > 0) {
            if ($tenant->status !== 'billing_failed' && $tenant->status !== 'suspended') {
                $tenant->update(['status' => 'billing_failed']);
                Log::warning("Tenant {$tenant->tenant_id} marked as 'billing_failed' due to {$overdueCount} overdue invoices.");
            }
            return $tenant->status;
        }

        // 3. Clear billing_failed/suspended if all overdue invoices are paid and no past_due subscriptions
        if (in_array($tenant->status, ['billing_failed', 'suspended'])) {
            $stillOverdue = Invoice::where('tenant_id', $tenant->id)
                ->where('status', 'pending')
                ->where('due_date', '<', now())
                ->exists();

            $stillPastDueSub = \App\Models\TenantSubscription::where('tenant_id', $tenant->id)
                ->where('status', 'past_due')
                ->exists();
                
            if (!$stillOverdue && !$stillPastDueSub) {
                $tenant->update(['status' => 'active']);
                Log::info("Tenant {$tenant->tenant_id} restored to 'active' status.");
            }
        }

        return $tenant->status;
    }

    /**
     * Enforce billing check for all active or billing_failed tenants.
     * Designed to be run by a daily scheduler.
     */
    public function enforceForAll(): void
    {
        Log::info("Starting daily billing enforcement check.");

        Tenant::whereIn('status', ['active', 'billing_failed'])->chunk(100, function ($tenants) {
            foreach ($tenants as $tenant) {
                $this->checkTenantHealth($tenant);
            }
        });

        Log::info("Billing enforcement check completed.");
    }
}
