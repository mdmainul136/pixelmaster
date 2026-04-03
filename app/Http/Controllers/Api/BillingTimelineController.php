<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\TenantSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BillingTimelineController extends Controller
{
    /**
     * Get aggregated billing and subscription events for a tenant
     */
    public function index(Request $request)
    {
        try {
            $tenantId = $request->attributes->get('tenant_id') ?? $request->input('token_tenant_id');
            $tenant = Tenant::findOrFail($tenantId);

            $events = collect();

            // 1. Successul Payments
            $payments = Payment::with(['module'])
                ->where('tenant_id', $tenant->id)
                ->where('payment_status', 'completed')
                ->get();

            foreach ($payments as $payment) {
                $events->push([
                    'id' => 'payment_' . $payment->id,
                    'type' => 'payment',
                    'title' => 'Payment Successful',
                    'description' => ($payment->module ? $payment->module->name : 'Service') . " payment of {$payment->currency} {$payment->amount}",
                    'date' => $payment->paid_at ?? $payment->created_at,
                    'status' => 'completed',
                    'meta' => [
                        'payment_id' => $payment->id,
                        'amount' => $payment->amount,
                        'currency' => $payment->currency,
                        'module' => $payment->module->name ?? null
                    ]
                ]);
            }

            // 2. New Invoices
            $invoices = Invoice::where('tenant_id', $tenant->id)->get();
            foreach ($invoices as $invoice) {
                $events->push([
                    'id' => 'invoice_' . $invoice->id,
                    'type' => 'invoice',
                    'title' => 'Invoice Generated',
                    'description' => "Invoice #{$invoice->invoice_number} for {$invoice->total} {$invoice->currency}",
                    'date' => $invoice->invoice_date,
                    'status' => $invoice->status === 'paid' ? 'success' : 'pending',
                    'metadata' => [
                        'invoice_number' => $invoice->invoice_number,
                        'total' => $invoice->total,
                        'status' => $invoice->status
                    ]
                ]);
            }

            // 3. Subscription Events
            $subscriptions = TenantSubscription::with('plan')->where('tenant_id', $tenant->id)->get();
            foreach ($subscriptions as $sub) {
                $events->push([
                    'id' => 'sub_' . $sub->id,
                    'type' => 'subscription',
                    'title' => 'Subscription Changed',
                    'description' => "Plan changed to " . ($sub->plan ? $sub->plan->name : 'Custom'),
                    'date' => $sub->created_at,
                    'status' => 'info',
                    'metadata' => [
                        'plan' => $sub->plan->name ?? 'Unknown',
                        'cycle' => $sub->billing_cycle
                    ]
                ]);

                if ($sub->canceled_at) {
                    $events->push([
                        'id' => 'sub_cancel_' . $sub->id,
                        'type' => 'subscription',
                        'title' => 'Subscription Canceled',
                        'description' => "Subscription scheduled to end on " . $sub->ends_at?->toDateString(),
                        'date' => $sub->canceled_at,
                        'status' => 'warning',
                        'metadata' => [
                            'ends_at' => $sub->ends_at
                        ]
                    ]);
                }
            }

            // 4. Module Installations
            $modules = TenantModule::with('module')->where('tenant_id', $tenant->id)->get();
            foreach ($modules as $tm) {
                $events->push([
                    'id' => 'module_' . $tm->id,
                    'type' => 'module',
                    'title' => 'Module Active',
                    'description' => ($tm->module ? $tm->module->name : 'Unknown') . " module added to your workspace",
                    'date' => $tm->subscribed_at ?? $tm->created_at,
                    'status' => 'activated',
                    'meta' => [
                        'module' => $tm->module->name ?? 'Unknown',
                        'source' => $tm->source
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $events->sortByDesc('date')->values()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch billing timeline: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch timeline',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
