<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TenantDomain;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDomainController extends Controller
{
    /**
     * Display the merchant domain management page.
     */
    public function index(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id') ?? tenancy()->tenant?->id;

        $domains = TenantDomain::where('tenant_id', $tenantId)
            ->orderBy('is_primary', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Domains/Index', [
            'domains' => $domains,
            'platformIp' => config('services.platform.ip', $_SERVER['SERVER_ADDR'] ?? '127.0.0.1'),
            'baseDomain' => config('app.url'),
        ]);
    }
}
