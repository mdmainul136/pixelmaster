<?php

namespace App\Modules\Tracking\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Tracking\TrackingContainer;
use App\Modules\Tracking\Services\AiAdvisorService;
use Illuminate\Http\Request;

class AiAdvisorController extends Controller
{
    public function __construct(
        private AiAdvisorService $advisor,
        private \App\Modules\Tracking\Services\PredictiveAiService $predictive
    ) {}

    /**
     * Get aggregate predictive stats and AI insights for the dashboard.
     */
    public function dashboard(Request $request)
    {
        $tenantId = tenant('id');
        $container = TrackingContainer::where('tenant_id', $tenantId)->firstOrFail();

        return response()->json([
            'insights'   => $this->advisor->getInsights($container),
            'predictive' => $this->predictive->getAggregateForecast($container->tenant_id),
            'container'  => $container
        ]);
    }

    /**
     * Get prioritized insights for the container.
     * GET /api/tracking/ai/insights
     */
    public function insights(Request $request)
    {
        $tenantId = tenant('id');
        $container = TrackingContainer::where('tenant_id', $tenantId)->first();

        if (!$container) {
            return response()->json([
                'success' => false,
                'message' => 'No container found for this tenant.'
            ], 404);
        }

        $insights = $this->advisor->getInsights($container);

        return response()->json([
            'success' => true,
            'data'    => $insights,
            'container_id' => $container->id
        ]);
    }
}
