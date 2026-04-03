<?php

namespace App\Modules\Tracking\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Tracking\TrackingContainer;
use App\Modules\Tracking\Services\PowerUpService;
use App\Modules\Tracking\Services\TrackingProxyService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

/**
 * ProxyController
 *
 * Entry point for all server-side tracking events forwarded by the
 * Power-Ups Sidecar (docker/sgtm/server.js).
 *
 * Route: POST /api/tracking/proxy/{containerId}
 *        (No auth middleware — authenticated via X-Container-Secret on the container)
 *
 * Pipeline:
 *   1. Bot filter (Power-Up: bot_filter)
 *   2. API Secret verification (X-Container-Secret header)
 *   3. Delegate to TrackingProxyService → ProcessTrackingEventAction
 *   4. Power-Up: cookie extension (server-side first-party cookie)
 */
class ProxyController extends Controller
{
    public function __construct(
        private readonly TrackingProxyService $proxyService,
        private readonly PowerUpService       $powerUpService,
        private readonly \App\Modules\Tracking\Services\EventDebuggerService $debugger
    ) {}

    /**
     * Handle an inbound proxied event from the Power-Ups Sidecar.
     */
    public function handle(Request $request, string $containerId): JsonResponse
    {
        // ── 0. Find active container ───────────────────────────────────────────
        $container = TrackingContainer::where('container_id', $containerId)
            ->where('is_active', true)
            ->firstOrFail();

        // ── 1. Power-Up: Advanced Bot Filter ──────────────────────────────────
        if ($this->powerUpService->isEnabled($container, 'bot_detection')) {
            $ua = $request->userAgent() ?? '';

            // Block known bot user-agents
            if (preg_match('/bot|crawl|slurp|spider|mediapartners|headless|phantom|selenium/i', $ua)) {
                return response()->json(['success' => false, 'reason' => 'bot_ua'], 403);
            }

            // Block known datacenter IP ranges from config
            $blockedIps = config('tracking.blocked_ips', []);
            if (in_array($request->ip(), $blockedIps, true)) {
                return response()->json(['success' => false, 'reason' => 'blocked_ip'], 403);
            }
        }

        // ── 2. API Secret Verification (Mandatory) ─────────────────────────────
        // Each container now has a 32-char secret_key generated upon creation.
        // This is the primary defense against domain/container spoofing.
        $clientSecret = $request->header('X-Container-Secret') ?? $request->get('api_secret');

        if (!$container->secret_key || $clientSecret !== $container->secret_key) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Invalid or Missing Container Secret',
                'hint'    => 'Get your Secret Key from the PixelMaster Dashboard'
            ], 401);
        }

        // ── 3. Extract and propagate X-Request-ID ─────────────────────────────
        // The sidecar sets this on every request for cross-service log correlation
        $requestId = $request->header('X-Request-ID') ?? Str::uuid()->toString();

        // ── 4. Process event through the full pipeline ────────────────────────
        // TrackingProxyService → ProcessTrackingEventAction → ForwardToDestinationJob
        $data   = $request->all();
        $result = $this->proxyService->processEvent($container, $data, $requestId);

        // Build base response
        $httpStatus = match ($result['status'] ?? 'ok') {
            'error'    => 500,
            'dropped'  => 200,   // Dropped events still return 200 so sidecar won't retry
            'duplicate'=> 200,
            default    => 200,
        };

        $response = response()->json($result, $httpStatus);

        // ── 5. Power-Up: Cookie Keeper (Standard vs Custom) ───────────────────
        // Server-side first-party cookie with configurable lifetime.
        $isStdCookie    = $this->powerUpService->isEnabled($container, 'cookie_keeper');
        $isCustomCookie = $this->powerUpService->isEnabled($container, 'cookie_keeper_custom');

        if (($isStdCookie || $isCustomCookie) && $request->has('_ext_cookie')) {
            // Default (Starter/Free) settings
            $cookieName     = 'pm_id';
            $cookieLifetime = 525600; // 365 days in minutes

            // Override with custom settings if Pro tier feature is enabled
            if ($isCustomCookie) {
                $cookieName     = $container->settings['cookie_name']     ?? $cookieName;
                $cookieLifetime = $container->settings['cookie_lifetime'] ?? $cookieLifetime;
            }

            $response = $response->withCookie(cookie(
                $cookieName,
                $request->get('_ext_cookie'),
                $cookieLifetime,
                '/',
                $request->getHost(),
                true,  // Secure
                true,  // HttpOnly
                false, // Raw
                'Lax'  // SameSite
            ));
        }

        // ── 6. Push to real-time Debugger ─────────────────────────────────────
        try {
            $this->debugger->push($container, $data, $requestId);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Debugger push failed: " . $e->getMessage());
        }

        return $response;
    }
}
