<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Tenant;

class DashboardController extends Controller
{
    /**
     * Render the Platform Admin Dashboard.
     */
    public function index(Request $request)
    {
        // Gather stats for the platform super admin
        $stats = [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('status', 'active')->count(),
            'past_due_tenants' => Tenant::where('status', 'past_due')->count(),
            'suspended_tenants' => Tenant::where('status', 'suspended')->count(),
            // Mock stats or pull from global metrics
            'mrr' => '$0.00',
            'mrr_change' => '+0%',
        ];

        $recentTenants = Tenant::orderBy('created_at', 'desc')->take(5)->get()->map(function ($tenant) {
            return [
                'id' => $tenant->id,
                'name' => $tenant->tenant_name ?? $tenant->id,
                'domain' => $tenant->domain,
                'plan' => $tenant->plan ?? 'free',
                'status' => $tenant->status ?? 'inactive',
            ];
        });

        // Use the existing Platform/Dashboard view
        return Inertia::render('Platform/Dashboard', [
            'stats' => $stats,
            'recentTenants' => $recentTenants,
            'settings' => [
                'app_name' => config('app.name', 'Platform')
            ]
        ]);
    }
}

