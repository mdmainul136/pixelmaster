<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\TenantDomain;
use App\Models\DomainOrder;
use App\Models\Payment;
use App\Models\Invoice;
use App\Services\DomainService;
use App\Services\DomainSearchService;
use App\Services\DomainRegistrationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class TenantDomainManagementController extends Controller
{
    /**
     * Display a listing of domains for a specific tenant.
     */
    public function index(Tenant $tenant)
    {
        $domains = TenantDomain::where('tenant_id', $tenant->id)
            ->orderBy('is_primary', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Platform/Tenants/Domains', [
            'tenant' => [
                'id' => $tenant->id,
                'tenant_name' => $tenant->tenant_name,
            ],
            'domains' => $domains,
            'platformIp' => config('services.platform.ip', $_SERVER['SERVER_ADDR'] ?? '127.0.0.1'),
        ]);
    }

    /**
     * Store a newly created domain for the tenant.
     */
    public function store(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'domain' => 'required|string|unique:tenant_domains,domain',
            'purpose' => 'required|string|in:website,api,other',
        ]);

        $domain = TenantDomain::create([
            'tenant_id' => $tenant->id,
            'domain' => $validated['domain'],
            'purpose' => $validated['purpose'],
            'is_verified' => false,
            'status' => 'pending',
            'verification_token' => bin2hex(random_bytes(16)),
        ]);

        return back()->with('success', 'Domain added successfully.');
    }

    /**
     * Verify the domain.
     */
    public function verify(Tenant $tenant, $domainId)
    {
        $domain = TenantDomain::where('tenant_id', $tenant->id)->findOrFail($domainId);
        
        // Rapid DNS TXT check (simplified for now)
        $domain->update(['is_verified' => true, 'status' => 'verified']);
        
        return back()->with('success', 'Domain verified manually by admin.');
    }

    /**
     * Set domain as primary for the tenant.
     */
    public function setPrimary(Tenant $tenant, $domainId)
    {
        $domain = TenantDomain::where('tenant_id', $tenant->id)->findOrFail($domainId);
        
        // Reset others
        TenantDomain::where('tenant_id', $tenant->id)->update(['is_primary' => false]);
        
        // Set new primary
        $domain->update(['is_primary' => true]);
        
        return back()->with('success', 'Primary domain updated.');
    }

    /**
     * Remove the domain.
     */
    public function destroy(Tenant $tenant, $domainId)
    {
        $domain = TenantDomain::where('tenant_id', $tenant->id)->findOrFail($domainId);
        
        if ($domain->is_primary) {
            return back()->with('error', 'Cannot delete primary domain.');
        }

        $domain->delete();
        
    }

    /**
     * Search for domain availability globally.
     */
    public function search(Request $request)
    {
        $request->validate(['domain' => 'required|string']);

        try {
            $domain = $request->domain;
            $searchService = app(DomainSearchService::class);
            $result = $searchService->checkAvailability($domain);
            $suggestions = $searchService->getSuggestions(explode('.', $domain)[0]);

            return response()->json([
                'success' => true,
                'data' => [
                    'main' => $result,
                    'suggestions' => $suggestions,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * Platform Admin directly purchases a domain for a tenant.
     * Bypasses Stripe checkout and provisions directly, billing via invoice later.
     */
    public function purchase(Request $request, Tenant $tenant)
    {
        $request->validate([
            'domain' => 'required|string',
            'years' => 'required|integer|min:1|max:10',
        ]);

        try {
            $registrationService = app(DomainRegistrationService::class);
            
            $contactInfo = [
                'first_name' => $tenant->admin_name ?? 'Platform',
                'last_name' => 'Admin',
                'address' => $tenant->address ?? 'Main Street',
                'city' => $tenant->city ?? 'Dhaka',
                'state' => 'NY',
                'zip' => '10001',
                'country' => $tenant->country ?? 'Bangladesh',
                'phone' => $tenant->phone ?? '+880.1711111111',
                'email' => $tenant->admin_email ?? 'admin@platform.com',
            ];

            // 1. Register with Namecheap directly.
            $tenantDomain = $registrationService->registerDomain(
                $tenant->id,
                $request->domain,
                $request->years,
                $contactInfo
            );

            // 2. Setup DNS
            try {
                $registrationService->autoSetupDnsForPurchasedDomain($tenant->id, $request->domain);
            } catch (\Exception $e) {
                Log::warning("Auto DNS setup failed during admin purchase: " . $e->getMessage());
            }

            // 3. Create an order and invoice for billing later
            $searchService = app(DomainSearchService::class);
            $priceResult = $searchService->checkAvailability($request->domain);
            $price = $priceResult['price'] ?? 15.00;

            $order = DomainOrder::create([
                'tenant_id' => $tenant->id,
                'domain' => $request->domain,
                'amount' => $price,
                'currency' => 'USD',
                'registration_years' => $request->years,
                'status' => 'completed',
                'tenant_domain_id' => $tenantDomain->id,
            ]);

            Invoice::create([
                'tenant_id' => $tenant->id,
                'amount' => $price,
                'currency' => 'USD',
                'status' => 'pending',
                'due_date' => now()->addDays(7),
                'notes' => "Admin Provisioned Domain Registration: {$request->domain}",
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Domain successfully registered and attached to tenant!',
                'data' => $tenantDomain,
            ]);
        } catch (\Exception $e) {
            Log::error('Admin Domain purchase failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to provision domain: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Trigger global DNS Verification
     */
    public function verifyDns(Tenant $tenant, $domainId)
    {
        try {
            // Verify ownership belongs to tenant
            $domain = TenantDomain::where('tenant_id', $tenant->id)->findOrFail($domainId);
            
            $service = app(DomainService::class);
            $result = $service->verifyDomain($domain->id);
            
            // Piggyback health stats
            $health = $service->getHealthReport($domain->id);
            $result['health'] = $health['diagnostics'];

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get real-time health diagnostic
     */
    public function health(Tenant $tenant, $domainId)
    {
        try {
            $domain = TenantDomain::where('tenant_id', $tenant->id)->findOrFail($domainId);
            $service = app(DomainService::class);
            $report = $service->getHealthReport($domain->id);

            return response()->json([
                'success' => true,
                'data' => $report
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Trigger one click setup
     */
    public function oneClickSetup(Tenant $tenant, $domainId)
    {
        try {
            $domain = TenantDomain::where('tenant_id', $tenant->id)->findOrFail($domainId);
            $service = app(DomainService::class);
            $result = $service->oneClickSetup($domain->id);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
