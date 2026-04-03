<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TenantService;
use App\Services\TenancyService;
use Illuminate\Http\Request;
use App\Models\Tenant;

class TenantController extends Controller
{
    protected TenantService $tenantService;
    protected TenancyService $tenancyService;

    public function __construct(TenantService $tenantService, TenancyService $tenancyService)
    {
        $this->tenantService = $tenantService;
        $this->tenancyService = $tenancyService;
    }

    /**
     * Register a new tenant.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        // 1. Minimal Validation for PixelMaster-style Signup
        $validated = $request->validate([
            'adminEmail' => 'required|email|max:255',
            'server_location' => 'nullable|string|in:global,eu',
            'password' => 'nullable|string|min:8', 
            'adminName' => 'nullable|string|max:255',
            'tenantId' => 'nullable|string|regex:/^[a-z0-9-]+$/|unique:tenants,id|max:50',
            'plan' => 'nullable|string|in:starter,growth,pro',
            'marketing_consent' => 'nullable|boolean',
            'terms_consent' => 'nullable|boolean',
            'is_agency' => 'nullable|boolean',
            'agency_name' => 'nullable|required_if:is_agency,true|string|max:255',
        ]);

        // 2. Greedy Auto-Derivation (The "Cloud setup" engine)
        if (empty($validated['tenantId'])) {
            // If agency, use agency_name as base, else use email prefix
            $source = (!empty($validated['is_agency']) && !empty($validated['agency_name'])) 
                ? $validated['agency_name'] 
                : explode('@', $validated['adminEmail'])[0];

            $baseId = preg_replace('/[^a-z0-9]/', '', strtolower($source));
            $baseId = substr($baseId, 0, 40); 
            
            $tenantId = $baseId;
            $counter = 1;
            while (Tenant::where('id', $tenantId)->exists()) {
                $tenantId = $baseId . (string) $counter++;
            }
            $validated['tenantId'] = $tenantId;
        }

        // Auto-fill other greedy defaults
        $isAgency = !empty($validated['is_agency']);
        $validated['businessType'] = $isAgency ? 'agency' : 'sgtm';
        $validated['tenantName'] = $validated['agency_name'] ?? (ucfirst($validated['tenantId']) . ' Workspace');
        $validated['companyName'] = $validated['agency_name'] ?? (ucfirst($validated['tenantId']) . ' Corp');
        $validated['adminName'] = $validated['adminName'] ?? ucfirst(explode('@', $validated['adminEmail'])[0]);
        $validated['adminPassword'] = $validated['password'] ?? \Illuminate\Support\Str::random(16);
        $validated['plan'] = $validated['plan'] ?? 'free';

        // 3. Subdomain Check: Ensure the derived subdomain isn't already in use
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $baseDomain = parse_url($frontendUrl, PHP_URL_HOST);
        $proposedSubdomain = $validated['tenantId'] . '.' . $baseDomain;

        if (\App\Models\TenantDomain::where('domain', $proposedSubdomain)->exists()) {
            if ($request->hasHeader('X-Inertia') || !$request->wantsJson()) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'tenantId' => 'The generated subdomain is already in use. Please try a different ID.'
                ]);
            }
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'errors'  => [
                    'tenantId' => ['The generated subdomain is already in use. Please try a different ID.']
                ]
            ], 422);
        }

        try {
            // Provision Tenant
            $tenant = $this->tenantService->createTenant($validated);

            // Fetch admin user and send verification email
            $adminUser = \App\Models\User::where('email', $validated['adminEmail'])->first();
            if ($adminUser) {
                // Trigger Laravel's email verification notification
                $adminUser->sendEmailVerificationNotification();
                
                // Log the user in so they can access the verification notice page
                auth()->login($adminUser);
            }

            if ($request->hasHeader('X-Inertia') || !$request->wantsJson()) {
                return redirect()->route('verification.notice');
            }

            return response()->json([
                'success' => true,
                'message' => 'Registration accepted. Please verify your email to access your workspace.',
                'data' => [
                    'tenantId' => $tenant->id,
                    'email'    => $validated['adminEmail'],
                    'domain'   => $proposedSubdomain
                ]
            ], 202);
        } catch (\Exception $e) {
            \Log::error('Tenant registration error: ' . $e->getMessage());
            
            if ($request->hasHeader('X-Inertia') || !$request->wantsJson()) {
                return back()->withErrors(['adminEmail' => 'Error registering tenant: ' . $e->getMessage()]);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Error registering tenant',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get tenant information.
     *
     * @param  string  $tenantId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $tenantId)
    {
        $tenant = $this->tenantService->getTenantById($tenantId);

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'tenant_id' => $tenant->id,
                'tenant_name' => $tenant->tenant_name,
                'database_name' => $tenant->database_name,
                'status' => $tenant->status,
                'created_at' => $tenant->created_at,
            ],
        ]);
    }

    /**
     * Get the current identified tenant's information.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function current(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id');
        
        if (!$tenantId) {
            return response()->json([
                'success' => false,
                'message' => 'No tenant identified',
                'debug' => [
                    'host' => $request->getHost(),
                    'tenant_id_header' => $request->header('X-Tenant-ID'),
                ]
            ], 400);
        }


        $tenant = $this->tenantService->getTenantById($tenantId);

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found',
            ], 404);
        }

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $baseDomain = parse_url($frontendUrl, PHP_URL_HOST);
        $frontendPort = parse_url($frontendUrl, PHP_URL_PORT);
        $portSuffix = $frontendPort ? ':' . $frontendPort : '';

        return response()->json([
            'success' => true,
            'data' => [
                'tenant_id'      => $tenant->id,
                'tenant_name'    => $tenant->tenant_name,
                'company_name'   => $tenant->company_name,
                'business_type'  => $tenant->business_type,
                'business_category' => $tenant->business_category,
                'admin_name'     => $tenant->admin_name,
                'admin_email'    => $tenant->admin_email,
                'api_key'        => $tenant->api_key,
                'global_account_secret' => $tenant->global_account_secret,
                'database_name'  => $tenant->database_name,
                'domain'         => $tenant->domain . $portSuffix,
                'phone'          => $tenant->phone,
                'address'        => $tenant->address,
                'city'           => $tenant->city,
                'country'        => $tenant->country,
                'logo_url'       => $tenant->logo_url,
                'favicon_url'    => $tenant->favicon_url,
                'status'         => $tenant->status,
                'onboarded_at'   => $tenant->onboarded_at,
                'created_at'     => $tenant->created_at,
                'platform_ip'    => env('PLATFORM_IP', '127.0.0.1'),
                'base_domain'    => $baseDomain . $portSuffix,
                'plan'           => $tenant->plan ?? 'free',
                'currency_code'  => $tenant->currency_code,
                'currency_symbol'=> $tenant->currency_symbol,
                'is_global'      => $tenant->is_global,
                'store_status'   => $tenant->store_status,
                'available_countries' => $tenant->available_countries ?? [],
                'auto_language_switcher' => $tenant->auto_language_switcher ?? true,
                'multi_currency_detection' => $tenant->multi_currency_detection ?? true,
                'timezone'       => $tenant->timezone,
                'date_format'    => $tenant->date_format,
                'measurement_unit' => $tenant->measurement_unit,
                'fiscal_year_start' => $tenant->fiscal_year_start,
                'invoice_prefix' => $tenant->invoice_prefix,
                'shipping_origin_lat' => $tenant->shipping_origin_lat,
                'shipping_origin_lng' => $tenant->shipping_origin_lng,
                'default_courier' => $tenant->default_courier,
                'rfm_frequency'  => $tenant->rfm_frequency,
                'sentiment_threshold' => $tenant->sentiment_threshold,
                'stockout_buffer' => $tenant->stockout_buffer,
                'tax_regions'    => $tenant->tax_regions ?? [],
                'domains'        => $tenant->domains->map(function ($d) {
                    return [
                        'domain' => $d->domain,
                        'is_primary' => $d->domain === request()->getHost(), // Simple check
                    ];
                }),
                'usage' => [
                    'db_usage_gb' => $tenant->currentDbUsageGb(),
                    'db_limit_gb' => $tenant->dbLimitGb(),
                    'db_usage_percent' => $tenant->dbUsagePercent(),
                    'is_over_quota' => $tenant->isOverQuota(),
                ]
            ],
        ]);
    }

    /**
     * Get all tenants.

     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        return response()->json($this->tenancyService->getAllTenantsStats());
    }

    /**
     * Get detailed live stats for a single tenant 
     */
    public function stats(string $id)
    {
        $tenant = Tenant::findOrFail($id);
        return response()->json($this->tenancyService->getTenantStats($tenant));
    }

    /**
     * Admin: Create a new tenant (simplified)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'subdomain'     => 'required|string|unique:tenant_domains,domain',
            'plan'          => 'required|in:starter,growth,pro',
            'custom_domain' => 'nullable|string'
        ]);

        $tenant = $this->tenancyService->createTenant($data);

        return response()->json([
            'success' => true,
            'tenant'  => $tenant
        ], 201);
    }

    /**
     * Admin: Upgrade tenant plan
     */
    public function upgradePlan(Request $request, string $id)
    {
        $data = $request->validate(['plan' => 'required|in:starter,growth,pro']);
        $tenant = Tenant::findOrFail($id);

        $result = $this->tenancyService->upgradePlan($tenant, $data['plan']);

        return response()->json([
            'success' => true,
            'message' => "Tenant upgraded to {$data['plan']}",
            'data'    => $result
        ]);
    }

    /**
     * Admin: Override quota manually
     */
    public function setCustomQuota(Request $request, string $id)
    {
        $data = $request->validate(['gb' => 'required|numeric|min:0.1']);
        $tenant = Tenant::findOrFail($id);

        $this->tenancyService->setCustomQuota($tenant, (float) $data['gb']);

        return response()->json([
            'success' => true,
            'message' => "Quota updated to {$data['gb']} GB"
        ]);
    }

    /**
     * Admin: Add custom domain
     */
    public function addDomain(Request $request, string $id)
    {
        $data = $request->validate(['domain' => 'required|string|unique:tenant_domains,domain']);
        $tenant = Tenant::findOrFail($id);

        $this->tenancyService->addCustomDomain($tenant, $data['domain']);

        return response()->json([
            'success' => true,
            'message' => 'Custom domain added successfully'
        ]);
    }

    /**
     * Admin: Remove custom domain
     */
    public function removeDomain(Request $request, string $id)
    {
        $data = $request->validate(['domain' => 'required|string']);
        $tenant = Tenant::findOrFail($id);

        $this->tenancyService->removeCustomDomain($tenant, $data['domain']);

        return response()->json([
            'success' => true,
            'message' => 'Domain removed'
        ]);
    }

    /**
     * Check the status of tenant provisioning.
     */
    public function checkStatus(string $tenantId)
    {
        $result = $this->tenantService->checkProvisioningStatus($tenantId);

        if ($result['status'] === 'completed') {
            try {
                // Ensure we are in the tenant's database context
                $tenant = \App\Models\Tenant::find($tenantId);
                if ($tenant) {
                    $databaseManager = app(\App\Services\DatabaseManager::class);
                    $databaseManager->switchToTenantDatabaseByDbName($tenant->database_name);
                    
                    $user = \App\Models\User::where('email', $tenant->admin_email)->first();
                    if ($user) {
                        $token = $user->createToken('auth_token')->plainTextToken;
                        $result['token'] = $token;
                    }
                }
            } catch (\Exception $e) {
                \Log::error("Failed to generate auto-login token for tenant {$tenantId}: " . $e->getMessage());
            }
        }
        
        return response()->json($result);
    }

    /**
     * Check if a tenant ID is available for registration.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */

    public function checkAvailability(Request $request)
    {
        $tenantId = $request->query('tenant_id');

        if (!$tenantId) {
            return response()->json([
                'available' => false,
                'message' => 'tenant_id query parameter is required.',
            ], 422);
        }

        // Validate format
        if (!preg_match('/^[a-z0-9-]+$/', $tenantId)) {
            return response()->json([
                'available' => false,
                'message' => 'Tenant ID can only contain lowercase letters, numbers, and hyphens.',
            ]);
        }

        if (strlen($tenantId) < 3) {
            return response()->json([
                'available' => false,
                'message' => 'Tenant ID must be at least 3 characters.',
            ]);
        }

        $exists = \App\Models\Tenant::find($tenantId);
        
        // Also check for domain collision
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $baseDomain = parse_url($frontendUrl, PHP_URL_HOST);
        $fullSubdomain = $tenantId . '.' . $baseDomain;
        $domainExists = \App\Models\TenantDomain::where('domain', $fullSubdomain)->exists();

        return response()->json([
            'available' => !$exists && !$domainExists,
            'tenant_id' => $tenantId,
            'message' => ($exists || $domainExists)
                ? 'This Tenant ID or Subdomain is already taken.'
                : 'This Tenant ID is available!',
        ]);
    }

    /**
     * Get feature flags for the current tenant.
     */
    public function features(Request $request, \App\Services\FeatureFlagService $featureFlagService)
    {
        $tenantId = $request->attributes->get('tenant_id');
        if (!$tenantId) {
            return response()->json(['success' => false, 'message' => 'No tenant identified'], 400);
        }

        $config = config('tenant_features.feature_map', []);
        $features = [];

        foreach (array_keys($config) as $featureKey) {
            $features[$featureKey] = $featureFlagService->isEnabled($featureKey, $tenantId);
        }

        return response()->json([
            'success' => true,
            'data' => $features
        ]);
    }

    /**
     * Update tenant settings.
     */
    public function updateSettings(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id');
        if (!$tenantId) {
            return response()->json(['success' => false, 'message' => 'No tenant identified'], 400);
        }

        $tenant = Tenant::findOrFail($tenantId);

        $validated = $request->validate([
            'tenant_name' => ['nullable', 'string', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'business_type' => ['nullable', 'string', 'max:100'],
            'business_category' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'currency_code' => ['nullable', 'string', 'max:10'],
            'currency_symbol' => ['nullable', 'string', 'max:10'],
            'primary_color' => ['nullable', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'logo_url' => ['nullable', 'url', 'max:2048'],
            'favicon_url' => ['nullable', 'url', 'max:2048'],
            'is_global' => ['nullable', 'boolean'],
            'store_status' => ['nullable', 'string', 'in:open,closed,maintenance'],
            'available_countries' => ['nullable', 'array'],
            'auto_language_switcher' => ['nullable', 'boolean'],
            'multi_currency_detection' => ['nullable', 'boolean'],
            'timezone' => ['nullable', 'string', 'max:50'],
            'date_format' => ['nullable', 'string', 'max:20'],
            'measurement_unit' => ['nullable', 'string', 'in:metric,imperial'],
            'fiscal_year_start' => ['nullable', 'integer', 'min:1', 'max:12'],
            'invoice_prefix' => ['nullable', 'string', 'max:20'],
            'shipping_origin_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'shipping_origin_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'default_courier' => ['nullable', 'string', 'max:50'],
            'rfm_frequency' => ['nullable', 'string', 'in:daily,weekly,monthly'],
            'sentiment_threshold' => ['nullable', 'string', 'in:low,medium,high'],
            'stockout_buffer' => ['nullable', 'integer', 'min:0'],
            'tax_regions' => ['nullable', 'array'],
            'tax_regions.*.country_code' => ['required_with:tax_regions', 'string', 'max:2'],
            'tax_regions.*.state' => ['nullable', 'string', 'max:100'],
            'tax_regions.*.tax_name' => ['required_with:tax_regions', 'string', 'max:50'],
            'tax_regions.*.base_rate' => ['required_with:tax_regions', 'numeric', 'min:0', 'max:100'],
            'tax_regions.*.overrides' => ['nullable', 'array'],
            'tax_regions.*.overrides.*.category_id' => ['required_with:tax_regions.*.overrides', 'string'],
            'tax_regions.*.overrides.*.rate' => ['required_with:tax_regions.*.overrides', 'numeric', 'min:0', 'max:100'],
        ]);

        // Filter only null values to preserve false boolean values
        $updateData = array_filter($validated, fn($value) => !is_null($value));

        // CRITICAL: Prevent updating business_type if it's already a valid legal structure
        $legalTypes = ['sole_proprietorship', 'partnership', 'llc', 'corporation', 'startup', 'nonprofit', 'franchise', 'cooperative'];
        if (isset($updateData['business_type']) && in_array($tenant->business_type, $legalTypes) && $updateData['business_type'] !== $tenant->business_type) {
            return response()->json([
                'success' => false,
                'message' => 'Legal business structure cannot be changed after initial setup',
                'errors' => ['business_type' => ['Modification restricted']]
            ], 422);
        }

        $tenant->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully',
            'data' => $tenant->fresh()
        ]);
    }
}

