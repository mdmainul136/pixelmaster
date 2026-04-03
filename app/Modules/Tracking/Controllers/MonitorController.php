<?php

namespace App\Modules\Tracking\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Tracking\TrackingContainer;
use App\Models\Tracking\TrackingUsage;
use App\Modules\Tracking\Contracts\OrchestratorInterface;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class MonitorController extends Controller
{
    public function __construct(
        private readonly OrchestratorInterface $orchestrator
    ) {}

    /**
     * GET /api/tracking/dashboard/health/shared
     */
    public function sharedInfraHealth(Request $request): JsonResponse
    {
        try {
            $health = $this->orchestrator->checkSharedInfraHealth();
            
            return response()->json([
                'success' => true,
                'data'    => $health
            ]);
        } catch (\Exception $e) {
            Log::error("[sGTM Monitor] Failed to fetch shared health", ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => "Unavailable"], 500);
        }
    }

    /**
     * GET /platform/sgtm/health
     * 
     * Renders the premium Health Deck dashboard for Super Admin.
     */
    public function healthDeck(Request $request): \Inertia\Response
    {
        $activeCount    = TrackingContainer::where('is_active', true)->count();
        $suspendedCount = TrackingContainer::where('is_active', false)->count();
        
        $startOfMonth = Carbon::now()->startOfMonth();
        $totalEvents  = TrackingUsage::where('billing_period', '>=', $startOfMonth)
            ->sum('events_received');

        $infraHealth = [];
        try {
            $infraHealth = $this->orchestrator->checkSharedInfraHealth();
        } catch (\Exception $e) {
            $infraHealth = ['status' => 'error', 'message' => $e->getMessage()];
        }

        return Inertia::render('Platform/Sgtm/HealthDeck', [
            'stats' => [
                'active_containers'    => $activeCount,
                'suspended_containers' => $suspendedCount,
                'total_monthly_events' => (int) $totalEvents,
                'timestamp'            => now()->toDateTimeString(),
            ],
            'infrastructure' => $infraHealth
        ]);
    }

    /**
     * GET /api/tracking/dashboard/health/global-stats
     * 
     * Returns a summarized health deck for platform admin.
     */
    public function globalHealthStats(Request $request): JsonResponse
    {
        $activeCount    = TrackingContainer::where('is_active', true)->count();
        $suspendedCount = TrackingContainer::where('is_active', false)->count();
        
        $startOfMonth = Carbon::now()->startOfMonth();
        $totalEvents  = TrackingUsage::where('billing_period', '>=', $startOfMonth)
            ->sum('events_received');

        $infraHealth = [];
        try {
            $infraHealth = $this->orchestrator->checkSharedInfraHealth();
        } catch (\Exception $e) {
            $infraHealth = ['status' => 'error', 'message' => $e->getMessage()];
        }

        return response()->json([
            'success'   => true,
            'stats'     => [
                'active_containers'    => $activeCount,
                'suspended_containers' => $suspendedCount,
                'total_monthly_events' => (int) $totalEvents,
                'timestamp'            => now()->toDateTimeString(),
            ],
            'infrastructure' => $infraHealth
        ]);
    }

    /**
     * POST /api/tracking/dashboard/health/sync
     *
     * Manual trigger to rebuild mappings.json from DB and reload sidecar.
     */
    public function rebuildMappings(Request $request): JsonResponse
    {
        // Require admin permissions (handled by middleware in routes usually, 
        // but adding an extra check here if needed)
        
        try {
            Log::info("[sGTM Monitor] Manual mappings rebuild triggered by: " . ($request->user()?->email ?? 'unknown'));
            
            $exitCode = Artisan::call('sgtm:sync-mappings', ['--force' => true]);
            
            return response()->json([
                'success' => $exitCode === 0,
                'message' => $exitCode === 0 
                    ? "Infrastructure mappings successfully rebuilt and synced." 
                    : "Rebuild failed. Check system logs for details."
            ]);
        } catch (\Exception $e) {
            Log::error("[sGTM Monitor] Failed to rebuild mappings", ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => "An internal error occurred during sync."
            ], 500);
        }
    }
}
