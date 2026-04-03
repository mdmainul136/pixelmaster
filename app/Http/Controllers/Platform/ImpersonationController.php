<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class ImpersonationController extends Controller
{
    /**
     * Start impersonating a tenant admin.
     */
    public function impersonate(Request $request, $tenantId)
    {
        $superAdmin = Auth::user();
        $tenant = Tenant::findOrFail($tenantId);

        // Find the first admin user for this tenant
        // In this architecture, we assume the tenant has an 'admin_email' stored
        $targetUser = User::where('email', $tenant->admin_email)->first();

        if (!$targetUser) {
            return back()->with('error', 'No admin user found for this tenant.');
        }

        // Store current Super Admin ID to allow switching back
        Session::put('impersonated_by', $superAdmin->id);
        Session::put('impersonated_tenant_id', $tenant->id);

        // Switch context
        Auth::login($targetUser);

        return redirect()->route('tenant.dashboard', ['tenant' => $tenant->id])
            ->with('success', "Now impersonating {$tenant->tenant_name}");
    }

    /**
     * Stop impersonating and return to Super Admin.
     */
    public function stopImpersonating()
    {
        $superAdminId = Session::get('impersonated_by');

        if (!$superAdminId) {
            return redirect('/')->with('error', 'No active impersonation session.');
        }

        $superAdmin = User::findOrFail($superAdminId);

        // Clear session
        Session::forget('impersonated_by');
        Session::forget('impersonated_tenant_id');

        // Login as Super Admin again
        Auth::login($superAdmin);

        return redirect()->route('platform.dashboard')
            ->with('success', 'Returned to platform administration.');
    }
}
