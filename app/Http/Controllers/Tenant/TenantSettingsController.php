<?php

namespace App\Http\Controllers\Tenant;

use App\Models\Tenant;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class TenantSettingsController extends Controller
{
    protected function resolveTenant()
    {
        if (function_exists('tenant') && tenant()) {
            return tenant();
        }

        $request = request();
        $tenantId = $request->query('tenant_id') ?? session('active_tenant_id');
        $tenant = null;

        if ($tenantId) {
            $tenant = \App\Models\Tenant::find($tenantId);
        }

        if (!$tenant && $request->user()) {
            $tenant = \App\Models\Tenant::where('admin_email', $request->user()->email)->first();
        }

        if (!$tenant) {
            abort(404, 'No workspace found.');
        }

        return $tenant;
    }

    /**
     * General Settings — sGTM Tracking Context
     */
    public function showGeneral()
    {
        $tenant = $this->resolveTenant();
        
        return Inertia::render('Tenant/Core/Settings', [
            'tenant' => $tenant,
            'settings' => [
                'tenant_name'      => $tenant->tenant_name,
                'company_name'     => $tenant->company_name,
                'company_email'    => $tenant->admin_email,
                'company_phone'    => $tenant->phone,
                'plan'             => $tenant->plan ?: 'free',
                'api_key'          => $tenant->api_key,
                'global_account_secret' => $tenant->global_account_secret,
                'event_limit'      => $tenant->monthly_event_limit,
                'region'           => $tenant->db_region ?: 'Global',
            ],
        ]);
    }

    /**
     * Update settings — Core Tracking identity
     */
    public function update(Request $request)
    {
        $tenant = $this->resolveTenant();

        $validated = $request->validate([
            'tenant_name'      => 'required|string|max:255',
            'company_name'     => 'nullable|string|max:255',
            'company_email'    => 'nullable|email|max:255',
            'company_phone'    => 'nullable|string|max:30',
        ]);

        // Map UI fields to database columns
        $updateData = [
            'tenant_name'  => $validated['tenant_name'],
            'company_name' => $validated['company_name'],
            'admin_email'  => $validated['company_email'] ?? $tenant->admin_email,
            'phone'        => $validated['company_phone'] ?? $tenant->phone,
        ];

        $tenant->update($updateData);

        return back()->with('success', 'Workspace identity updated successfully.');
    }

    /**
     * Rotate Global Account Secret
     */
    public function rotateSecret()
    {
        $tenant = $this->resolveTenant();
        
        // Generate a secure master key
        $newSecret = 'GTM-' . strtoupper(bin2hex(random_bytes(16)));
        
        $tenant->update([
            'global_account_secret' => $newSecret
        ]);

        return back()->with('success', 'Global Secret rotated successfully. Please update your sidecar nodes.');
    }

    /**
     * Billing & Plan Info
     */
    public function showBilling()
    {
        $tenant = $this->resolveTenant();
        
        return Inertia::render('Tenant/Core/BillingSettings', [
            'tenant' => $tenant,
            'subscription' => [
                'status' => 'active',
                'plan_name' => ucfirst($tenant->plan ?: 'free'),
                'usage' => [
                    'monthly_events' => 0, // Injected by Usage Service in reality
                    'limit' => $tenant->monthly_event_limit,
                ]
            ],
            'plans' => \App\Models\Tenant::$plans
        ]);
    }
}
