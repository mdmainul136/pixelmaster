<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Redis;
use Symfony\Component\HttpFoundation\Response;

class GlobalRateLimitMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $limit = $this->resolveLimit($request);
        $key = $this->resolveRequestKey($request);

        if (RateLimiter::tooManyAttempts($key, $limit)) {
            $this->logExceededLimit($request, $key);
            
            return response()->json([
                'error' => 'Too many requests.',
                'message' => 'Platform-wide rate limit exceeded. Please try again later.',
                'retry_after' => RateLimiter::availableIn($key),
            ], 429);
        }

        RateLimiter::hit($key, 60); // 1 minute window

        return $next($request);
    }

    /**
     * Resolve the rate limit based on user type.
     */
    protected function resolveLimit(Request $request): int
    {
        if ($request->user('super_admin_web')) {
            return config('security.rate_limits.platform_admin', 1000);
        }

        if ($request->attributes->get('tenant_id')) {
            return config('security.rate_limits.tenant_api', 500);
        }

        return config('security.rate_limits.guest', 60);
    }

    /**
     * Resolve a unique key for the request identified (IP or User ID).
     */
    protected function resolveRequestKey(Request $request): string
    {
        if ($user = $request->user()) {
            return 'rate_limit:user:' . $user->id;
        }

        if ($tenantId = $request->attributes->get('tenant_id')) {
            return 'rate_limit:tenant:' . $tenantId . ':' . $request->ip();
        }

        return 'rate_limit:ip:' . $request->ip();
    }

    /**
     * Log instances where rate limits are exceeded for security auditing.
     */
    protected function logExceededLimit(Request $request, string $key): void
    {
        $data = [
            'ip' => $request->ip(),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'key' => $key,
            'user_agent' => $request->userAgent(),
        ];

        // Store in Redis for real-time security dashboard tracking
        Redis::lpush('security:rate_limit_exceeded', json_encode(array_merge($data, ['timestamp' => time()])));
        Redis::ltrim('security:rate_limit_exceeded', 0, 99); // Keep last 100 entries

        \Illuminate\Support\Facades\Log::warning("Rate limit exceeded for $key", $data);
    }
}
