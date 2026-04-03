<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Database Quota Enforcement Middleware.
 * 
 * Tiers:
 *   < 80%:  Normal — no headers
 *   80-89%: X-Quota-Warning: approaching
 *   90-99%: X-Quota-Warning: critical
 *   100%+:  402 Payment Required — writes blocked
 * 
 * Always injects: X-Quota-Usage, X-Quota-Limit
 */
class DbQuotaMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = tenant();
        if (!$tenant) {
            return $next($request);
        }

        // 1. Check Account Status
        if ($tenant->status === 'suspended') {
            return response()->json([
                'success' => false,
                'message' => 'Account suspended. Please contact support.',
                'code'    => 'ACCOUNT_SUSPENDED'
            ], 403);
        }

        // Lazy-compute usage only once
        $usagePercent = $tenant->dbUsagePercent();

        // 2. Enforce DB Quota on Write Operations
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            if ($usagePercent >= 100) {
                return response()->json([
                    'success' => false,
                    'message' => 'Database storage limit reached. Please upgrade your plan.',
                    'code'    => 'QUOTA_EXCEEDED',
                    'usage'   => $usagePercent . '%',
                    'limit'   => $tenant->dbLimitGb() . ' GB'
                ], 402); // 402 Payment Required
            }
        }

        $response = $next($request);

        // 3. Inject Tiered Warning Headers
        $response->headers->set('X-Quota-Usage', round($usagePercent, 1) . '%');
        $response->headers->set('X-Quota-Limit', $tenant->dbLimitGb() . 'GB');

        if ($usagePercent >= 90) {
            $response->headers->set('X-Quota-Warning', 'critical');
            $response->headers->set('X-Quota-Message', "Storage at {$usagePercent}% — upgrade immediately to avoid write-blocking");
        } elseif ($usagePercent >= 80) {
            $response->headers->set('X-Quota-Warning', 'approaching');
            $response->headers->set('X-Quota-Message', "Storage at {$usagePercent}% — consider upgrading your plan");
        }

        return $response;
    }
}

