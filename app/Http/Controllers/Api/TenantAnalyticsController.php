<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Services\TenantDatabaseAnalyticsService;
use Illuminate\Http\Request;

class TenantAnalyticsController extends Controller
{
    public function __construct(protected TenantDatabaseAnalyticsService $analyticsService) {}

    /**
     * GET /api/analytics/resource-usage
     */
    public function resourceUsage(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id');
        $tenant = Tenant::findOrFail($tenantId);

        $stats = $this->analyticsService->getAnalytics($tenant);
        $trends = $this->analyticsService->getResourceTrends($tenant);

        return response()->json([
            'success' => true,
            'data' => [
                'current_usage' => $stats['usage'],
                'quota'         => $stats['quota'],
                'trends'        => $trends,
            ]
        ]);
    }

    /**
     * GET /api/analytics/heatmaps
     */
    public function heatmaps(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id');
        $tenant = Tenant::findOrFail($tenantId);

        $days = $request->query('days', 7);
        $heatmap = $this->analyticsService->getActivityHeatmap($tenant, (int)$days);

        return response()->json([
            'success' => true,
            'data' => [
                'heatmap' => $heatmap,
                'period_days' => $days
            ]
        ]);
    }
}
