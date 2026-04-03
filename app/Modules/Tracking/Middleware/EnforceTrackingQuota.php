<?php

namespace App\Modules\Tracking\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Modules\Tracking\Services\TrackingUsageService;
use App\Models\Tracking\TrackingContainer;

class EnforceTrackingQuota
{
    public function __construct(private TrackingUsageService $usageService)
    {
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Identify tenant from request attributes
        $tenantId = $request->attributes->get('tenant_id') ?? tenant('id');
        
        if (!$tenantId) {
            // If no tenant context, we can't track usage securely
            return response()->json(['error' => 'Missing workspace context'], 400);
        }

        // Identify container (either provided or primary)
        $container = TrackingContainer::where('tenant_id', $tenantId)->first();
        if (!$container) {
            return response()->json(['error' => 'No tracking container configured'], 404);
        }

        // In a high-scale production system, this status should be cached via Redis.
        // For precision and given the current architecture, we utilize the database count.
        $tenantPlan = tenant('plan') ?? 'free';
        $quota = $this->usageService->getQuotaStatus($container->id, $tenantPlan);

        if ($quota['status'] === 'dropped') {
            // HARD LIMIT REACHED
            // We must drop tracking hits to prevent runaway costs
            return response()->json([
                'success' => false,
                'error'   => 'quota_exceeded',
                'message' => 'Tracking event rejected. Workspace has exhausted its hard tracking quota limit.'
            ], 402); // 402 Payment Required
        }

        // Add a warning header if the tenant is in overage (Soft Limit reached)
        $response = $next($request);
        
        if ($quota['status'] === 'overage') {
            $response->headers->set('X-Tracking-Quota', 'overage');
        }

        return $response;
    }
}
