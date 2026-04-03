<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OnboardingController extends Controller
{
    /**
     * Show the onboarding page.
     */
    public function show()
    {
        return \Inertia\Inertia::render('Tenant/Core/Onboarding');
    }

    /**
     * Save onboarding data (business category, business info, etc.)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'business_category' => 'required|string|in:ecommerce,cross-border-ior,real-estate,restaurant,sgtm,business-website,lms,healthcare,fitness,salon,freelancer,travel,automotive,event,saas,landlord,education',
            'business_data' => 'nullable|array',
            'store_data' => 'nullable|array',
            'selected_plan' => 'nullable|string',
            'payment_methods' => 'nullable|array',
            'product_data' => 'nullable|array',
        ]);

        try {
            $tenant = tenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active tenant context',
                ], 400);
            }

            // Update tenant data with business category and onboarding info
            $existingData = $tenant->data ?? [];
            
            $tenant->update([
                'data' => array_merge($existingData, [
                    'business_category' => $validated['business_category'],
                    'business_data' => $validated['business_data'] ?? [],
                    'store_data' => $validated['store_data'] ?? [],
                    'selected_plan' => $validated['selected_plan'] ?? 'free',
                    'payment_methods' => $validated['payment_methods'] ?? [],
                    'product_data' => $validated['product_data'] ?? [],
                    'onboarding_completed_at' => now()->toISOString(),
                ]),
            ]);

            // Try to set direct attributes for convenience
            try {
                $tenant->update([
                    'country' => $validated['business_data']['country'] ?? $tenant->country,
                    'business_category' => $validated['business_category'],
                    'tenant_name' => $validated['store_data']['storeName'] ?? $tenant->tenant_name,
                    'company_name' => $validated['store_data']['storeName'] ?? $tenant->company_name,
                ]);
            } catch (\Exception $e) {
                Log::info('Direct columns update failed, using data JSON as primary source', [
                    'tenant_id' => $tenant->id,
                    'error' => $e->getMessage(),
                ]);
            }

            Log::info('Onboarding completed', [
                'tenant_id' => $tenant->id,
                'business_category' => $validated['business_category'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Onboarding completed successfully',
                'redirect' => '/dashboard',
            ]);

        } catch (\Exception $e) {
            Log::error('Onboarding error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error saving onboarding data',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
