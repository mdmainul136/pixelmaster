<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TenantModule;

class TenantConfigController extends Controller
{
    /**
     * Get unified configuration for the current tenant.
     * This endpoint is called by the frontend to break redirection loops 
     * and enable dynamic UI mapping.
     */
    public function index(Request $request)
    {
        $tenant = $request->get('tenant'); // Injected by IdentifyTenant middleware

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant context not found. Ensure host is correct.'
            ], 404);
        }

        // 1. Get Subscription Status
        $activeModules = TenantModule::where('tenant_id', $tenant->id)
            ->whereIn('status', ['active', 'trial'])
            ->with('module')
            ->get()
            ->map(fn($tm) => $tm->module->slug)
            ->toArray();

        $activeFeatures = $tenant->tenantFeatures()
            ->where('enabled', true)
            ->pluck('feature_key')
            ->toArray();

        // 2. Define Module-to-Route Mapping (Dynamic Blueprint)
        // This allows the backend to control which routes are associated with which modules.
        $moduleMap = [
            "/ecommerce" => "ecommerce",
            "/pos" => "pos",
            "/crm" => "crm",
            "/whatsapp-commerce" => "whatsapp",
            "/marketplace" => "marketplace",
            "/flash-sales" => "flash-sales",
            "/marketing" => "marketing",
            "/seo-manager" => "seo-manager",
            "/pages-blog" => "pages",
            "/zatca" => "zatca",
            "/saudi-services" => "zatca",
            "/hrm" => "hrm",
            "/hr" => "hrm",
            "/branches" => "branches",
            "/expenses" => "expenses",
            "/finance" => "finance",
            "/inventory" => "inventory",
            "/inventory/suppliers" => "inventory",
            "/inventory/purchase-orders" => "inventory",
            "/inventory/warehouse" => "inventory",
            "/subscription-plans" => "finance",
            // "/staff-access" => "hrm", // Decoupled from HRM as it's a core platform feature
            "/ior" => "cross-border-ior",
            "/tracking" => "tracking",
            "/website-analytics/server-tracking" => "tracking",
            "/tracking/containers" => "tracking",
            "/tracking/signals" => "tracking",
            "/tracking/compliance" => "tracking",
            "/tracking/attribution" => "tracking"
        ];

        // 3. Get Regional Module Bundle based on tenant's country
        $countryCode = $this->resolveCountryCode($tenant->country);
        $regionalConfig = config("regional_modules.{$countryCode}", [
            'modules'         => [],
            'payment_methods' => [],
            'compliance'      => [],
            'currency'        => null,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $tenant->id,
                'name' => $tenant->tenant_name,
                'onboarded_at' => $tenant->onboarded_at ? $tenant->onboarded_at->toIso8601String() : null,
                'is_ready' => !!$tenant->onboarded_at,
                'business_purpose' => $tenant->business_category ?? $tenant->business_type,
                'country' => $tenant->country,
                'subscription' => [
                    'tier' => $tenant->plan ?? 'free',
                    'active_modules' => $activeModules,
                    'active_features' => $activeFeatures,
                ],
                'module_map' => $moduleMap,
                'regional' => $regionalConfig,
                'branding' => [
                    'primary_color' => $tenant->primary_color ?? '#0d9488',
                    'logo_url' => $tenant->logo_url,
                ],
                'currency' => [
                    'code' => $tenant->currency_code ?? ($regionalConfig['currency']['code'] ?? 'USD'),
                    'symbol' => $tenant->currency_symbol ?? ($regionalConfig['currency']['symbol'] ?? '$'),
                ],
                'tax_regions' => $tenant->tax_regions ?? [],
                'theme_id' => $tenant->theme_id ?? null,
                'is_global' => $tenant->is_global ?? false,
                'store_status' => $tenant->store_status ?? 'open',
                'available_countries' => $tenant->data['available_countries'] ?? [],
                'auto_language_switcher' => $tenant->data['auto_language_switcher'] ?? true,
                'multi_currency_detection' => $tenant->data['multi_currency_detection'] ?? true,
            ]
        ]);
    }

    /**
     * Map country name to ISO 3166-1 alpha-2 code.
     * Used to look up regional_modules config.
     */
    private function resolveCountryCode(?string $country): ?string
    {
        if (!$country) return null;

        // If already a 2-letter code, return as-is
        if (strlen($country) === 2 && ctype_alpha($country)) {
            return strtoupper($country);
        }

        $map = [
            'Saudi Arabia' => 'SA', 'UAE' => 'AE', 'United Arab Emirates' => 'AE',
            'Kuwait' => 'KW', 'Bahrain' => 'BH', 'Qatar' => 'QA', 'Oman' => 'OM',
            'Egypt' => 'EG', 'Jordan' => 'JO',
            'India' => 'IN', 'Bangladesh' => 'BD', 'Pakistan' => 'PK',
            'Sri Lanka' => 'LK', 'Nepal' => 'NP',
            'UK' => 'GB', 'United Kingdom' => 'GB', 'Germany' => 'DE', 'France' => 'FR',
            'Turkey' => 'TR', 'Spain' => 'ES', 'Italy' => 'IT',
            'Netherlands' => 'NL', 'Sweden' => 'SE',
            'USA' => 'US', 'United States' => 'US', 'Canada' => 'CA',
            'Australia' => 'AU', 'Japan' => 'JP',
            'Brazil' => 'BR', 'Mexico' => 'MX', 'Nigeria' => 'NG', 'Kenya' => 'KE',
        ];

        return $map[$country] ?? null;
    }
}

