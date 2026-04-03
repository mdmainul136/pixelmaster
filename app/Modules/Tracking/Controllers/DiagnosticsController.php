<?php

namespace App\Modules\Tracking\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Tracking\TrackingContainer;
use App\Models\Tracking\TrackingDestination;
use App\Modules\Tracking\Services\DatasetQualityService;
use App\Modules\Tracking\Services\DirectIntegrationService;
use App\Modules\Tracking\Services\MetaCapiService;
use App\Modules\Tracking\Services\CapiDiagnosticsService;
use Illuminate\Http\Request;

/**
 * CAPI Diagnostics & Direct Integration Controller.
 *
 * Endpoints for:
 *   - Dataset Quality reports (EMQ, match keys, ACR)
 *   - Direct integration code snippet generation
 *   - Test event sending
 *   - Event validation
 */
class DiagnosticsController extends Controller
{
    public function __construct(
        private DatasetQualityService $datasetQuality,
        private DirectIntegrationService $directIntegration,
        private MetaCapiService $metaCapi,
        private CapiDiagnosticsService $capiDiagnostics,
    ) {}

    /**
     * GET /tracking/diagnostics/{id}/quality
     * Fetch Dataset Quality report from Meta for a container's Facebook Pixel.
     */
    public function quality(int $id)
    {
        $container = TrackingContainer::findOrFail($id);
        $report = $this->capiDiagnostics->calculateEmqScore($container);

        return response()->json(['success' => true, 'data' => $report]);
    }

    /**
     * GET /tracking/diagnostics/{id}/trends
     * Get historical EMQ trends for a container.
     */
    public function trends(int $id, Request $request)
    {
        $container = TrackingContainer::findOrFail($id);
        $days = (int) $request->input('days', 30);
        $trends = $this->capiDiagnostics->getEmqTrends($container, $days);

        return response()->json(['success' => true, 'data' => $trends]);
    }

    /**
     * GET /tracking/diagnostics/{id}/match-keys
     * Get match key coverage breakdown.
     */
    public function matchKeys(int $id)
    {
        $container = TrackingContainer::findOrFail($id);
        $fbDest = $this->getFacebookDestination($container->id);

        if (!$fbDest) {
            return response()->json([
                'success' => false,
                'error'   => 'No Facebook CAPI destination configured',
            ], 404);
        }

        $creds = $fbDest->credentials ?? [];
        $result = $this->datasetQuality->getMatchKeyCoverage(
            $creds['pixel_id'] ?? '',
            $creds['access_token'] ?? ''
        );

        return response()->json($result);
    }

    /**
     * GET /tracking/diagnostics/{id}/acr
     * Get Additional Conversions Reported (ACR) metrics.
     */
    public function additionalConversions(int $id)
    {
        $container = TrackingContainer::findOrFail($id);
        $fbDest = $this->getFacebookDestination($container->id);

        if (!$fbDest) {
            return response()->json([
                'success' => false,
                'error'   => 'No Facebook CAPI destination configured',
            ], 404);
        }

        $creds = $fbDest->credentials ?? [];
        $result = $this->datasetQuality->getAdditionalConversions(
            $creds['pixel_id'] ?? '',
            $creds['access_token'] ?? ''
        );

        return response()->json(['success' => true, 'data' => $result]);
    }

    /**
     * GET /tracking/diagnostics/{id}/integration-kit
     * Generate direct integration code snippets for the tenant.
     */
    public function integrationKit(int $id)
    {
        $container = TrackingContainer::findOrFail($id);
        $fbDest = $this->getFacebookDestination($container->id);

        $pixelId = '';
        if ($fbDest) {
            $pixelId = $fbDest->credentials['pixel_id'] ?? $fbDest->credentials['dataset_id'] ?? '';
        }

        $config = [
            'pixel_id'    => $pixelId,
            'domain'      => $container->domain ?? $container->settings['domain'] ?? 'tracking.yoursite.com',
            'loader_path' => $container->settings['loader_path'] ?? '/gtm.js',
            'collect_path' => $container->settings['collect_path'] ?? '/collect',
        ];

        $kit = $this->directIntegration->generateIntegrationKit($config);

        return response()->json(['success' => true, 'data' => $kit]);
    }

    /**
     * POST /tracking/diagnostics/test-event
     * Send a test event to validate CAPI connectivity.
     */
    public function testEvent(Request $request)
    {
        $validated = $request->validate([
            'container_id'    => 'required|integer',
            'event_name'      => 'string',
            'test_event_code' => 'required|string',
        ]);

        $container = TrackingContainer::findOrFail($validated['container_id']);
        $fbDest = $this->getFacebookDestination($container->id);

        if (!$fbDest) {
            return response()->json([
                'success' => false,
                'error'   => 'No Facebook CAPI destination configured',
            ], 404);
        }

        $creds = $fbDest->credentials ?? [];

        $testEvent = [
            'event_name'       => $validated['event_name'] ?? 'PageView',
            'event_time'       => time(),
            'action_source'    => 'website',
            'event_source_url' => $request->header('Referer', 'https://test.example.com'),
            'user_data'        => [
                'client_ip_address' => $request->ip(),
                'client_user_agent' => $request->userAgent(),
            ],
        ];

        $result = $this->metaCapi->sendEvent($testEvent, $creds, [
            'test_event_code' => $validated['test_event_code'],
        ]);

        return response()->json([
            'success' => true,
            'data'    => $result,
            'message' => 'Test event sent. Check Meta Events Manager → Test Events to verify.',
        ]);
    }

    /**
     * POST /tracking/diagnostics/emq-preview
     * Preview EMQ score for given user_data (without sending to Meta).
     */
    public function emqPreview(Request $request)
    {
        $userData = $request->input('user_data', []);
        $emq = $this->metaCapi->calculateEMQ($userData);

        return response()->json(['success' => true, 'data' => $emq]);
    }

    /**
     * Get the Facebook CAPI destination for a container.
     */
    private function getFacebookDestination(int $containerId): ?TrackingDestination
    {
        return TrackingDestination::where('container_id', $containerId)
            ->where('type', 'facebook_capi')
            ->where('is_active', true)
            ->first();
    }
}
