<?php

namespace App\Modules\Tracking\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Tracking\TrackingContainer;
use App\Modules\Tracking\Services\AttributionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttributionController extends Controller
{
    public function __construct(
        private readonly AttributionService $attributionService
    ) {}

    /**
     * Display the Attribution Modeler Dashboard.
     */
    public function index(Request $request, string $containerId)
    {
        $container = TrackingContainer::where('container_id', $containerId)->firstOrFail();
        $days = $request->get('days', 30);

        return Inertia::render('Platform/Sgtm/AttributionModeler', [
            'container' => $container,
            'matrix'    => $this->attributionService->getComparisonMatrix($container->id, (int)$days),
            'paths'     => $this->attributionService->getConversionPaths($container->id, (int)$days),
            'filters'   => [
                'days' => (int)$days,
            ]
        ]);
    }

    /**
     * API: Get Matrix data for dynamic model switching.
     */
    public function getMatrix(Request $request, string $containerId)
    {
        $container = TrackingContainer::where('container_id', $containerId)->firstOrFail();
        $days = $request->get('days', 30);

        return response()->json([
            'matrix' => $this->attributionService->getComparisonMatrix($container->id, (int)$days),
        ]);
    }
}
