<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

/**
 * ModuleGraphController
 *
 * Unified API that aggregates module definitions, business type mappings,
 * dependency graphs, and feature gates for the SaaS dashboard.
 */
class ModuleGraphController extends Controller
{
    /**
     * GET /api/super-admin/module-graph
     * Full module + business type + plan + dependency map.
     */
    public function index(): JsonResponse
    {
        $modules        = config('modules', []);
        $dependencies   = config('module_dependencies', []);
        $businessTypes  = config('business_modules', []);
        $blueprints     = config('business_blueprints', []);
        $relationships  = $businessTypes['relationships'] ?? [];

        // Build enriched module list
        $enrichedModules = [];
        foreach ($modules as $slug => $module) {
            $enrichedModules[] = [
                'slug'           => $slug,
                'name'           => $module['name'] ?? $slug,
                'description'    => $module['description'] ?? '',
                'price'          => $module['price'] ?? 0,
                'icon'           => $module['icon'] ?? 'box',
                'color'          => $module['color'] ?? '#6366f1',
                'features'       => $module['features'] ?? [],
                'depends_on'     => $dependencies[$slug] ?? [],
                'related'        => $relationships[$slug] ?? [],
            ];
        }

        // Build business types (exclude 'relationships' key)
        $enrichedBusinessTypes = [];
        foreach ($businessTypes as $key => $bt) {
            if ($key === 'relationships') continue;
            $enrichedBusinessTypes[] = [
                'key'         => $key,
                'label'       => $bt['label'] ?? $key,
                'primary'     => $bt['primary'] ?? null,
                'starter'     => $bt['starter'] ?? ($bt['core'] ?? []),
                'recommended' => $bt['recommended'] ?? [],
            ];
        }

        return response()->json([
            'modules'        => $enrichedModules,
            'business_types' => $enrichedBusinessTypes,
            'blueprints'     => $blueprints,
            'dependency_graph' => $dependencies,
        ]);
    }

    /**
     * GET /api/super-admin/module-graph/dependencies
     * Dependency tree for all modules.
     */
    public function dependencies(): JsonResponse
    {
        $dependencies = config('module_dependencies', []);
        $modules      = config('modules', []);

        // Build a reverse-dependency map (what depends on X?)
        $reverseDeps = [];
        foreach ($dependencies as $module => $deps) {
            foreach ($deps as $dep) {
                $reverseDeps[$dep][] = $module;
            }
        }

        // Modules with no deps
        $standalone = [];
        foreach (array_keys($modules) as $slug) {
            if (!isset($dependencies[$slug]) || empty($dependencies[$slug])) {
                $standalone[] = $slug;
            }
        }

        return response()->json([
            'dependencies'         => $dependencies,
            'reverse_dependencies' => $reverseDeps,
            'standalone_modules'   => $standalone,
        ]);
    }

    /**
     * GET /api/super-admin/module-graph/business-types
     * Business types with their module assignments.
     */
    public function businessTypes(): JsonResponse
    {
        $businessTypes = config('business_modules', []);
        $relationships = $businessTypes['relationships'] ?? [];

        $result = [];
        foreach ($businessTypes as $key => $bt) {
            if ($key === 'relationships') continue;
            $result[] = [
                'key'         => $key,
                'label'       => $bt['label'] ?? $key,
                'primary'     => $bt['primary'] ?? null,
                'starter'     => $bt['starter'] ?? ($bt['core'] ?? []),
                'recommended' => $bt['recommended'] ?? [],
            ];
        }

        return response()->json([
            'business_types' => $result,
            'relationships'  => $relationships,
        ]);
    }

    /**
     * GET /api/super-admin/module-graph/features/{slug}
     * Get features for a specific module (flat, tier-less).
     */
    public function planFeatures(string $slug): JsonResponse
    {
        // Read from module.json directly
        $modulePath = base_path("app/Modules");
        $directories = \Illuminate\Support\Facades\File::directories($modulePath);
        $features = null;

        foreach ($directories as $dir) {
            $candidate = $dir . '/module.json';
            if (File::exists($candidate)) {
                $json = json_decode(File::get($candidate), true);
                if (($json['slug'] ?? '') === $slug) {
                    $features = $json['features'] ?? [];
                    break;
                }
            }
        }

        if ($features === null) {
            return response()->json([
                'message' => "No features defined for module '{$slug}'.",
            ], 404);
        }

        return response()->json([
            'module'   => $slug,
            'features' => $features,
        ]);
    }

    /**
     * PUT /api/super-admin/module-graph/module/{slug}
     * Update a module's features or business_types (writes to module.json).
     */
    public function updateModule(Request $request, string $slug): JsonResponse
    {
        $validated = $request->validate([
            'features'       => 'sometimes|array',
            'business_types' => 'sometimes|array',
            'depends_on'     => 'sometimes|array',
        ]);

        // Find the module.json file
        $modulePath = base_path("app/Modules");
        $jsonFile   = null;

        $directories = File::directories($modulePath);
        foreach ($directories as $dir) {
            $candidate = $dir . '/module.json';
            if (File::exists($candidate)) {
                $json = json_decode(File::get($candidate), true);
                if (($json['slug'] ?? '') === $slug) {
                    $jsonFile = $candidate;
                    break;
                }
            }
        }

        if (!$jsonFile) {
            return response()->json(['message' => "Module '{$slug}' not found."], 404);
        }

        $json = json_decode(File::get($jsonFile), true);

        // Merge updates
        if (isset($validated['features'])) {
            $json['features'] = $validated['features'];
        }
        if (isset($validated['business_types'])) {
            $json['business_types'] = $validated['business_types'];
        }
        if (isset($validated['depends_on'])) {
            $json['depends_on'] = $validated['depends_on'];
        }

        File::put($jsonFile, json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        return response()->json([
            'message' => "Module '{$slug}' updated.",
            'data'    => $json,
        ]);
    }
}
