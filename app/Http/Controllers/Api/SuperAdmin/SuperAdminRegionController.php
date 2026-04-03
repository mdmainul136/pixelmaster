<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\RegionModuleOverride;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * SuperAdminRegionController
 *
 * CRUD API for managing regional module availability overrides.
 * Only accessible by SuperAdmin users from the SaaS dashboard.
 */
class SuperAdminRegionController extends Controller
{
    /**
     * GET /api/super-admin/region-overrides
     * List all active overrides, optionally filtered by region.
     */
    public function index(Request $request): JsonResponse
    {
        $query = RegionModuleOverride::query();

        if ($request->has('region')) {
            $query->forRegion($request->input('region'));
        }

        $overrides = $query->orderBy('region_code')->orderBy('module_slug')->get();

        return response()->json(['data' => $overrides]);
    }

    /**
     * GET /api/super-admin/region-overrides/{regionCode}
     * Get the full module map for a specific region.
     */
    public function show(string $regionCode): JsonResponse
    {
        $overrides = RegionModuleOverride::forRegion($regionCode)->get();

        return response()->json([
            'region'    => $regionCode,
            'overrides' => $overrides,
        ]);
    }

    /**
     * POST /api/super-admin/region-overrides
     * Create or update a module override for a region.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'region_code'  => 'required|string|max:50',
            'module_slug'  => 'required|string|max:100',
            'status'       => 'required|in:core,addon,na',
            'addon_price'  => 'nullable|numeric|min:0',
            'is_active'    => 'boolean',
        ]);

        $override = RegionModuleOverride::updateOrCreate(
            [
                'region_code' => $validated['region_code'],
                'module_slug' => $validated['module_slug'],
            ],
            [
                'status'      => $validated['status'],
                'addon_price' => $validated['addon_price'] ?? null,
                'is_active'   => $validated['is_active'] ?? true,
                'updated_by'  => auth()->id(),
            ]
        );

        return response()->json([
            'message' => 'Override saved successfully.',
            'data'    => $override,
        ], 201);
    }

    /**
     * PUT /api/super-admin/region-overrides/bulk
     * Bulk-update module overrides for a region.
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'region_code' => 'required|string|max:50',
            'modules'     => 'required|array|min:1',
            'modules.*.module_slug' => 'required|string|max:100',
            'modules.*.status'      => 'required|in:core,addon,na',
            'modules.*.addon_price' => 'nullable|numeric|min:0',
        ]);

        $results = [];
        foreach ($validated['modules'] as $mod) {
            $results[] = RegionModuleOverride::updateOrCreate(
                [
                    'region_code' => $validated['region_code'],
                    'module_slug' => $mod['module_slug'],
                ],
                [
                    'status'      => $mod['status'],
                    'addon_price' => $mod['addon_price'] ?? null,
                    'is_active'   => true,
                    'updated_by'  => auth()->id(),
                ]
            );
        }

        return response()->json([
            'message' => count($results) . ' overrides updated.',
            'data'    => $results,
        ]);
    }

    /**
     * DELETE /api/super-admin/region-overrides/{id}
     * Remove a specific override (falls back to config defaults).
     */
    public function destroy(int $id): JsonResponse
    {
        $override = RegionModuleOverride::findOrFail($id);
        $override->delete();

        return response()->json(['message' => 'Override removed. Config defaults will apply.']);
    }
}
