<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Services\RegionDatabaseRouter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegionStatsController extends Controller
{
    protected RegionDatabaseRouter $router;

    public function __construct(RegionDatabaseRouter $router)
    {
        $this->router = $router;
    }

    /**
     * GET /api/regions/stats
     * Returns per-region tenant counts, server config, and country mapping.
     */
    public function stats(): JsonResponse
    {
        $regions = config('tenant.region_servers', []);
        $countryMap = config('tenant.country_region_map', []);

        $stats = [];
        foreach ($regions as $regionId => $serverConfig) {
            // Countries in this region
            $countries = array_keys(array_filter($countryMap, fn($r) => $r === $regionId));

            // Tenant counts
            $totalTenants = Tenant::where('db_region', $regionId)->count();
            $activeTenants = Tenant::where('db_region', $regionId)->where('status', 'active')->count();
            $provisioningTenants = Tenant::where('db_region', $regionId)
                ->whereNotIn('provisioning_status', ['completed', 'failed'])
                ->count();

            // Also count tenants that have no db_region but match countries (legacy)
            $legacyTenants = Tenant::whereNull('db_region')
                ->whereIn('country', $countries)
                ->count();

            $stats[] = [
                'id' => $regionId,
                'name' => $this->regionLabel($regionId),
                'flag' => $this->regionFlag($regionId),
                'server' => [
                    'host' => $serverConfig['host'],
                    'port' => $serverConfig['port'],
                ],
                'countries' => $countries,
                'country_count' => count($countries),
                'tenant_count' => $totalTenants + $legacyTenants,
                'active_tenants' => $activeTenants,
                'provisioning_tenants' => $provisioningTenants,
                'legacy_tenants' => $legacyTenants,
            ];
        }

        return response()->json([
            'success' => true,
            'regions' => $stats,
            'total_tenants' => Tenant::count(),
            'total_active' => Tenant::where('status', 'active')->count(),
        ]);
    }

    /**
     * GET /api/regions/{region}/tenants
     * Returns tenants in a specific region.
     */
    public function tenants(Request $request, string $region): JsonResponse
    {
        $countryMap = config('tenant.country_region_map', []);
        $countries = array_keys(array_filter($countryMap, fn($r) => $r === $region));

        $query = Tenant::where(function ($q) use ($region, $countries) {
            $q->where('db_region', $region)
              ->orWhere(function ($q2) use ($countries) {
                  $q2->whereNull('db_region')->whereIn('country', $countries);
              });
        });

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $tenants = $query->orderBy('created_at', 'desc')
            ->select([
                'id', 'tenant_id', 'tenant_name', 'company_name',
                'country', 'status', 'provisioning_status',
                'db_host', 'db_port', 'db_region',
                'created_at'
            ])
            ->get();

        return response()->json([
            'success' => true,
            'region' => $region,
            'region_name' => $this->regionLabel($region),
            'tenants' => $tenants,
            'count' => $tenants->count(),
        ]);
    }

    private function regionLabel(string $id): string
    {
        return match ($id) {
            'mena' => 'Middle East & North Africa',
            'europe' => 'Europe',
            'south_asia' => 'South Asia',
            'americas' => 'Americas',
            'global' => 'Global',
            default => ucfirst($id),
        };
    }

    private function regionFlag(string $id): string
    {
        return match ($id) {
            'mena' => '🕌',
            'europe' => '🇪🇺',
            'south_asia' => '🌏',
            'americas' => '🌎',
            'global' => '🌍',
            default => '🌐',
        };
    }
}
