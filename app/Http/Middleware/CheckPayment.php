<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Tenant;
use App\Models\Invoice;
use Symfony\Component\HttpFoundation\Response;

class CheckPayment
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenantId = $request->attributes->get('tenant_id');

        if (!$tenantId) {
            return $next($request);
        }

        $tenant = Tenant::on('central')->find($tenantId);

        if (!$tenant) {
            return $next($request);
        }

        // 1. Prioritize Trial Access
        if ($tenant->isTrialActive()) {
            return $next($request);
        }

        // 2. Skip check for certain routes
        // These routes MUST work even when dashboard is locked,
        // otherwise the tenant cannot reach billing or load the UI shell.
        $skipRoutes = [
            'api/billing*',
            'api/subscriptions*',
            'api/payments*',
            'api/payment*',
            'api/invoices*',
            'api/payment-methods*',
            'api/tenants/status',
            'api/tenants/current',
            'api/tenant/config',
            'api/tenant/features',
            'api/tenant/modules',
            'api/auth/logout',
            'api/auth/login',
            'api/auth/register',
            'api/auth/me',
            'api/public/*',
        ];

        foreach ($skipRoutes as $route) {
            if ($request->is($route)) {
                return $next($request);
            }
        }

        // 3. Enforce Access Lock
        if (!$tenant->canAccessDashboard()) {
            $unpaidInvoices = Invoice::on('central')
                ->where('tenant_id', $tenant->id)
                ->where('status', 'pending')
                ->where('subscription_type', '!=', 'domain_registration')
                ->count();

            return response()->json([
                'success' => false,
                'message' => 'Payment Required. Your dashboard is locked until the outstanding invoice is paid or a trial is granted.',
                'payment_required' => true,
                'tenant_status' => $tenant->status,
                'unpaid_invoices_count' => $unpaidInvoices,
            ], 402); // 402 Payment Required
        }

        // 4. Overdue Check: Lock even "active" tenants if they have overdue invoices
        // Note: We exclude domain_registration invoices from locking the dashboard
        $overdueInvoice = Invoice::on('central')
            ->where('tenant_id', $tenant->id)
            ->where('status', 'pending')
            ->where('subscription_type', '!=', 'domain_registration')
            ->where('due_date', '<', now())
            ->first();

        if ($overdueInvoice) {
            return response()->json([
                'success' => false,
                'message' => 'Your dashboard is locked due to an overdue invoice. Please settle your bill to restore access.',
                'payment_required' => true,
                'overdue' => true,
                'invoice_id' => $overdueInvoice->id,
                'due_date' => $overdueInvoice->due_date,
            ], 402);
        }

        return $next($request);
    }
}
