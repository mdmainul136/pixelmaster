<?php

namespace App\Modules\Tracking\Integrations\Generic\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Tracking\Services\SgtmProxyService;
use App\Modules\Tracking\Services\SgtmContainerService;
use Illuminate\Http\Request;

/**
 * EventIngestionController (Integrations Identity)
 * 
 * Handles generic event ingestion and configuration fetching.
 */
class EventIngestionController extends Controller
{
    public function __construct(
        private SgtmProxyService $sgtm,
        private SgtmContainerService $containerService,
    ) {}

    /**
     * Generic event ingestion endpoint.
     * POST /api/tracking/events/ingest
     */
    public function ingest(Request $request)
    {
        $request->validate([
            'events'    => 'required|array|min:1',
            'events.*.name'   => 'required|string',
            'events.*.params' => 'nullable|array',
            'client_id' => 'nullable|string',
            'user_id'   => 'nullable|string',
        ]);

        $container = $this->containerService->getPrimaryContainer();
        if (!$container) {
            return response()->json(['error' => 'No container configured'], 404);
        }

        $measurementId = $this->containerService->getMeasurementId($container);
        $apiSecret = $this->containerService->getApiSecret($container);

        if (!$measurementId || !$apiSecret) {
            return response()->json(['error' => 'Container not fully configured'], 500);
        }

        $clientId = $request->input('client_id', time() . '.' . rand(100000000, 999999999));
        $userId   = $request->input('user_id');
        $events   = $request->input('events');

        $result = $this->sgtm->sendMeasurementProtocol(
            $measurementId, $apiSecret, $events, $clientId, $userId
        );

        return response()->json(['success' => $result['success'] ?? false]);
    }

    /**
     * Get container config for integrations (by API key).
     * GET /api/tracking/config/{apiKey}
     */
    public function getConfig(string $apiKey)
    {
        $container = $this->containerService->getPrimaryContainer();
        if (!$container) {
            return response()->json(['error' => 'Not found'], 404);
        }

        return response()->json([
            'transport_url'  => $container->domain ? "https://{$container->domain}" : null,
            'measurement_id' => $this->containerService->getMeasurementId($container),
            'container_id'   => $container->container_id,
            'power_ups'      => $container->power_ups ?? [],
            'sdk_url'        => $container->domain ? "https://{$container->domain}/sdk/v1/pixelmaster.min.js" : null,
        ]);
    }
}
