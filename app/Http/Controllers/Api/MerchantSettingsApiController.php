<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MerchantSettingsApiController extends Controller
{
    /**
     * GET /api/merchant/settings
     * Return all merchant settings as JSON.
     */
    public function index(): JsonResponse
    {
        $tenant = tenant();
        return response()->json([
            'success' => true,
            'data' => [
                'general' => [
                    'tenant_name'      => $tenant->tenant_name,
                    'company_name'     => $tenant->company_name,
                    'admin_email'      => $tenant->admin_email,
                    'phone'            => $tenant->phone,
                    'address'          => $tenant->address,
                    'city'             => $tenant->city,
                    'logo_url'         => $tenant->logo_url,
                    'favicon_url'      => $tenant->favicon_url,
                ],
                'business' => [
                    'business_type'     => $tenant->business_type,
                    'business_category' => $tenant->business_category,
                    'cr_number'         => $tenant->cr_number,
                    'vat_number'        => $tenant->vat_number,
                    'country'           => $tenant->country,
                    'invoice_prefix'    => $tenant->invoice_prefix,
                    'tax_rate'          => $tenant->tax_rate,
                ],
                'localization' => [
                    'currency_code'           => $tenant->currency_code,
                    'currency_symbol'         => $tenant->currency_symbol,
                    'timezone'                => $tenant->timezone,
                    'date_format'             => $tenant->date_format,
                    'measurement_unit'        => $tenant->measurement_unit,
                    'fiscal_year_start'       => $tenant->fiscal_year_start,
                    'is_global'               => $tenant->is_global,
                    'auto_language_switcher'   => $tenant->auto_language_switcher,
                    'multi_currency_detection' => $tenant->multi_currency_detection,
                ],
                'branding' => [
                    'primary_color'   => $tenant->primary_color,
                    'secondary_color' => $tenant->secondary_color,
                    'facebook_url'    => $tenant->facebook_url,
                    'instagram_url'   => $tenant->instagram_url,
                    'twitter_url'     => $tenant->twitter_url,
                    'linkedin_url'    => $tenant->linkedin_url,
                    'theme_id'        => $tenant->theme_id,
                ],
            ],
        ]);
    }

    /**
     * PUT /api/merchant/settings/general
     */
    public function updateGeneral(Request $request): JsonResponse
    {
        return $this->updateSection($request, 'general', [
            'tenant_name'      => 'nullable|string|max:255',
            'company_name'     => 'nullable|string|max:255',
            'admin_email'      => 'nullable|email|max:255',
            'phone'            => 'nullable|string|max:30',
            'address'          => 'nullable|string|max:500',
            'city'             => 'nullable|string|max:100',
        ]);
    }

    /**
     * PUT /api/merchant/settings/business
     */
    public function updateBusiness(Request $request): JsonResponse
    {
        return $this->updateSection($request, 'business', [
            'business_type'     => 'nullable|string|max:100',
            'business_category' => 'nullable|string|max:100',
            'cr_number'         => 'nullable|string|max:50',
            'vat_number'        => 'nullable|string|max:50',
            'country'           => 'nullable|string|max:100',
            'invoice_prefix'    => 'nullable|string|max:20',
            'tax_rate'          => 'nullable|numeric|min:0|max:100',
        ]);
    }

    /**
     * PUT /api/merchant/settings/localization
     */
    public function updateLocalization(Request $request): JsonResponse
    {
        return $this->updateSection($request, 'localization', [
            'currency_code'           => 'nullable|string|max:10',
            'currency_symbol'         => 'nullable|string|max:10',
            'timezone'                => 'nullable|string|max:100',
            'date_format'             => 'nullable|string|max:50',
            'measurement_unit'        => 'nullable|string|in:metric,imperial',
            'fiscal_year_start'       => 'nullable|integer|min:1|max:12',
            'is_global'               => 'nullable|boolean',
            'auto_language_switcher'   => 'nullable|boolean',
            'multi_currency_detection' => 'nullable|boolean',
        ]);
    }

    /**
     * PUT /api/merchant/settings/branding
     */
    public function updateBranding(Request $request): JsonResponse
    {
        return $this->updateSection($request, 'branding', [
            'primary_color'   => 'nullable|string|max:20',
            'secondary_color' => 'nullable|string|max:20',
            'facebook_url'    => 'nullable|url|max:500',
            'instagram_url'   => 'nullable|url|max:500',
            'twitter_url'     => 'nullable|url|max:500',
            'linkedin_url'    => 'nullable|url|max:500',
            'theme_id'        => 'nullable|string|max:50',
        ]);
    }

    /**
     * Internal: validate + update tenant columns.
     */
    private function updateSection(Request $request, string $section, array $rules): JsonResponse
    {
        $validated = $request->validate($rules);
        $tenant = tenant();
        $tenant->update($validated);

        return response()->json([
            'success' => true,
            'message' => ucfirst($section) . ' settings updated.',
            'data'    => $validated,
        ]);
    }
}
