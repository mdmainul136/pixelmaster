<?php

namespace App\Modules\Tracking\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Tracking\TrackingContainer;
use App\Models\Tracking\CustomerIdentity;
use App\Models\Tracking\TrackingEventLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerInsightsController extends Controller
{
    /**
     * Display a list of all identified customers (CDP Index).
     */
    public function index(Request $request, string $containerId)
    {
        $tenantId = tenant('id');
        $tenant = null;

        if (!$tenantId) {
            $user = auth()->user();
            $tenant = \App\Models\Tenant::where('admin_email', $user->email)->firstOrFail();
            $tenantId = $tenant->id;
        } else {
            $tenant = \App\Models\Tenant::findOrFail($tenantId);
        }

        if ($containerId === 'main' || $containerId === 'default') {
            $container = TrackingContainer::where('tenant_id', $tenantId)->first();
        } else {
            $container = TrackingContainer::where('container_id', $containerId)->first();
        }

        // Run data fetching within tenant context
        $identities = $tenant->run(function () {
            return CustomerIdentity::whereNotNull('email_hash')
                ->orderBy('total_spent', 'desc')
                ->paginate(20);
        });

        return Inertia::render('Tenant/Tracking/CdpList', [
            'container'  => $container,
            'identities' => $identities,
        ]);
    }

    /**
     * Show a unified 360-degree profile for a single customer.
     */
    public function show(string $containerId, string $identityId)
    {
        $tenantId = tenant('id');
        $tenant = null;

        if (!$tenantId) {
            $user = auth()->user();
            $tenant = \App\Models\Tenant::where('admin_email', $user->email)->firstOrFail();
            $tenantId = $tenant->id;
        } else {
            $tenant = \App\Models\Tenant::findOrFail($tenantId);
        }

        if ($containerId === 'main' || $containerId === 'default') {
            $container = TrackingContainer::where('tenant_id', $tenantId)->first();
        } else {
            $container = TrackingContainer::where('container_id', $containerId)->first();
        }

        // Run data fetching within tenant context
        $data = $tenant->run(function () use ($identityId) {
            $identity = CustomerIdentity::findOrFail($identityId);
            
            $timeline = TrackingEventLog::where('identity_id', $identity->id)
                ->orderBy('processed_at', 'desc')
                ->limit(100)
                ->get();
                
            return compact('identity', 'timeline');
        });

        return Inertia::render('Tenant/Tracking/SingleCustomerView', [
            'container' => $container,
            'identity'  => $data['identity'],
            'timeline'  => $data['timeline'],
        ]);
    }

    /**
     * API: Get Identity Graph data for visual representation.
     */
    public function getGraph(string $identityId)
    {
        $identity = CustomerIdentity::findOrFail($identityId);
        
        return response()->json([
            'anonymous_ids' => $identity->merged_anonymous_ids ?? [],
            'ips'           => $identity->ip_addresses ?? [],
            'devices'       => $identity->devices ?? [],
            'browsers'      => $identity->browsers ?? [],
        ]);
    }
}
