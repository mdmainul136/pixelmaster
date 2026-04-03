<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionPlanController extends Controller
{
    public function index()
    {
        $plans = SubscriptionPlan::orderBy('price_monthly', 'asc')->get();
        return Inertia::render('Platform/Billing/Plans', [
            'plans' => $plans
        ]);
    }
    public function store(Request $request)
    {
        $request->merge([
            'is_active' => filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN),
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'plan_key' => 'required|string|max:100|unique:subscription_plans,plan_key',
            'description' => 'nullable|string',
            'price_monthly' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'event_quota' => 'required|integer|min:0',
            'container_limit' => 'required|integer|min:-1',
            'domain_limit' => 'required|integer|min:-1',
            'prices_ppp' => 'nullable|array'
        ]);

        SubscriptionPlan::create([
            'name' => $validated['name'],
            'plan_key' => $validated['plan_key'],
            'description' => $validated['description'],
            'price_monthly' => $validated['price_monthly'],
            'price_yearly' => $validated['price_monthly'] * 10,
            'currency' => 'USD',
            'is_active' => $request->boolean('is_active', true),
            'quotas' => [
                'events' => (int)$validated['event_quota'],
                'containers' => (int)$validated['container_limit'],
                'multi_domains' => (int)$validated['domain_limit'],
            ],
            'prices_ppp' => $validated['prices_ppp'] ?? [
                'USD' => (float)$validated['price_monthly'],
                'BDT' => (float)$validated['price_monthly'] * 50, // Approx PPP for BD
                'SAR' => (float)$validated['price_monthly'] * 3,
            ]
        ]);

        return redirect()->back()->with('success', 'Subscription plan created successfully.');
    }

    public function update(Request $request, $id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        
        $request->merge([
            'is_active' => filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN),
        ]);

        \Log::info('--- UPDATE PLAN CALLED ---', ['id' => $id, 'data' => $request->all()]);

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_monthly' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'event_quota' => 'required|integer|min:0',
            'container_limit' => 'required|integer|min:-1',
            'domain_limit' => 'required|integer|min:-1',
            'prices_ppp' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            \Log::error('PLAN UPDATE VALIDATION FAILED', $validator->errors()->toArray());
            return redirect()->back()->withErrors($validator);
        }

        $validated = $validator->validated();

        $quotas = $plan->quotas ?? [];
        $quotas['events'] = (int)$validated['event_quota'];
        $quotas['containers'] = (int)$validated['container_limit'];
        $quotas['multi_domains'] = (int)$validated['domain_limit'];

        $plan->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price_monthly' => $validated['price_monthly'],
            'is_active' => $request->boolean('is_active', true),
            'quotas' => $quotas,
            'prices_ppp' => $validated['prices_ppp'] ?? $plan->prices_ppp
        ]);

        return redirect()->back()->with('success', 'Subscription plan updated successfully.');
    }

    public function destroy($id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        
        // Prevent deletion if tenants are using it
        $inUse = \App\Models\Tenant::where('plan', $plan->plan_key)->exists();
        if ($inUse) {
            return redirect()->back()->with('error', 'Cannot delete plan: Tenants are currently subscribed to it.');
        }

        $plan->delete();
        return redirect()->back()->with('success', 'Subscription plan deleted.');
    }
}
