<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\TenantDatabasePlan;
use App\Services\TenantDatabaseAnalyticsService;
use App\Services\TenantDatabaseIsolationService;
use Illuminate\Http\Request;

class TenantDatabaseController extends Controller
{
    protected TenantDatabaseAnalyticsService $analyticsService;
    protected TenantDatabaseIsolationService $isolationService;

    public function __construct(
        TenantDatabaseAnalyticsService $analyticsService,
        TenantDatabaseIsolationService $isolationService
    ) {
        $this->analyticsService = $analyticsService;
        $this->isolationService = $isolationService;
    }

    /**
     * Get database analytics (usage, quota, overview).
     *
     * GET /api/database/analytics
     */
    public function analytics(Request $request)
    {
        try {
            $tenant = tenant();
            if (!$tenant) {
                return response()->json(['success' => false, 'message' => 'Tenant context required'], 403);
            }
            // Eager-load relations needed for analytics
            $tenant->loadMissing(['databasePlan', 'latestDatabaseStat']);

            // PROACTIVE TELEMETRY: Refresh stats if missing or older than 1 hour
            $latest = $tenant->latestDatabaseStat;
            if (!$latest || $latest->recorded_at->diffInHours(now()) >= 1) {
                $this->analyticsService->collectStats($tenant);
                // Refresh model to get the new stat
                $tenant->load('latestDatabaseStat');
            }

            $analytics = $this->analyticsService->getAnalytics($tenant);
            
            // Use live methods from Tenant model
            $usedGb    = $tenant->currentDbUsageGb();
            $limitGb   = $tenant->dbLimitGb();
            $percent   = $tenant->dbUsagePercent();
            $isOver    = $tenant->isOverQuota();

            return response()->json([
                'success' => true,
                'data' => [
                    'usage' => [
                        'mb' => round($usedGb * 1024, 2),
                        'gb' => $usedGb,
                        'tables' => $analytics['usage']['table_count'],
                        'rows' => $analytics['usage']['total_rows'],
                        'last_updated' => now()->toISOString(),
                    ],
                    'quota' => [
                        'plan' => $tenant->plan ?? 'free',
                        'limit_gb' => $limitGb,
                        'usage_percent' => $percent,
                        'is_over_quota' => $isOver,
                    ],
                    'alerts' => $this->buildAlerts([
                        'over_quota' => $isOver,
                        'usage_percent' => $percent
                    ]),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch database analytics',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get per-table breakdown.
     *
     * GET /api/database/tables
     */
    public function tables(Request $request)
    {
        try {
            $tenant = tenant();
            if (!$tenant) {
                return response()->json(['success' => false, 'message' => 'Tenant context required'], 403);
            }

            $tables = $this->analyticsService->getTableBreakdown($tenant);

            return response()->json([
                'success' => true,
                'data' => [
                    'tables' => $tables,
                    'total_tables' => count($tables),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch table breakdown',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get historical growth trend.
     *
     * GET /api/database/growth?days=30
     */
    public function growth(Request $request)
    {
        try {
            $tenant = tenant();
            if (!$tenant) {
                return response()->json(['success' => false, 'message' => 'Tenant context required'], 403);
            }

            $days = (int) $request->get('days', 30);
            $days = max(1, min($days, 365)); // Clamp between 1 and 365

            $growth = $this->analyticsService->getGrowthTrend($tenant, $days);

            return response()->json([
                'success' => true,
                'data' => $growth,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch growth trend',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get available database plans.
     *
     * GET /api/database/plans
     */
    public function plans(Request $request)
    {
        try {
            $plans = TenantDatabasePlan::active()
                ->orderBy('storage_limit_gb', 'asc')
                ->get()
                ->map(function ($plan) {
                    return [
                        'id' => $plan->id,
                        'name' => $plan->name,
                        'slug' => $plan->slug,
                        'storage_limit_gb' => $plan->storage_limit_gb,
                        'max_tables' => $plan->max_tables,
                        'max_connections' => $plan->max_connections,
                        'price' => (float) $plan->price,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $plans,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch database plans',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Build alert messages based on quota usage.
     */
    private function buildAlerts(array $quotaCheck): array
    {
        $alerts = [];

        if ($quotaCheck['over_quota']) {
            $alerts[] = [
                'type' => 'danger',
                'message' => "You have exceeded your storage quota! Current usage: {$quotaCheck['usage_percent']}%. Please upgrade your plan.",
            ];
        } elseif ($quotaCheck['usage_percent'] >= 90) {
            $alerts[] = [
                'type' => 'warning',
                'message' => "You are using {$quotaCheck['usage_percent']}% of your storage quota. Consider upgrading your plan.",
            ];
        } elseif ($quotaCheck['usage_percent'] >= 75) {
            $alerts[] = [
                'type' => 'info',
                'message' => "You are using {$quotaCheck['usage_percent']}% of your storage quota.",
            ];
        }

        return $alerts;
    }
}

