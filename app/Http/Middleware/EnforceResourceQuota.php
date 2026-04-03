<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware: enforce.quota:table_name
 *
 * Checks plan-based resource limits before allowing POST (create) requests.
 * Reads limits from config/tenant_quotas.php â†’ resource_limits.
 *
 * Usage in routes:
 *   Route::post('/properties', [PropertyController::class, 'store'])
 *       ->middleware('enforce.quota:re_properties');
 *
 * Or in controller constructor:
 *   $this->middleware('enforce.quota:re_properties')->only('store');
 */
class EnforceResourceQuota
{
    public function handle(Request $request, Closure $next, string $table): Response
    {
        // Only enforce on POST (create) requests
        if (!$request->isMethod('POST')) {
            return $next($request);
        }

        $tenant = tenant();
        if (!$tenant) {
            return $next($request);
        }

        $plan = $tenant->plan ?? 'free';

        // Look up limit from config
        $limits = config("tenant_quotas.resource_limits.{$table}", []);
        $limit = $limits[$plan] ?? ($limits['starter'] ?? -1);

        // -1 means unlimited
        if ($limit === -1) {
            return $next($request);
        }

        // Count current records in tenant DB
        try {
            $currentCount = DB::connection('tenant')->table($table)->count();
        } catch (\Exception $e) {
            Log::warning("EnforceResourceQuota: Could not count '{$table}' â€” {$e->getMessage()}");
            return $next($request); // Fail open if table doesn't exist yet
        }

        if ($currentCount >= $limit) {
            $resourceName = str_replace('_', ' ', $table);
            $resourceName = ucwords(trim($resourceName));

            return response()->json([
                'success' => false,
                'message' => "{$resourceName} limit reached ({$currentCount}/{$limit}) for your {$plan} plan. Please upgrade to add more.",
                'error_code' => 'RESOURCE_QUOTA_EXCEEDED',
                'quota' => [
                    'resource' => $table,
                    'current'  => $currentCount,
                    'limit'    => $limit,
                    'plan'     => $plan,
                ],
            ], 403);
        }

        return $next($request);
    }
}

