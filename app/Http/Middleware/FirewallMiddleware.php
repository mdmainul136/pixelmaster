<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use App\Models\FirewallRule;
use Symfony\Component\HttpFoundation\Response;

class FirewallMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $ip = $request->ip();

        // 1. Check Redis Cache first (Fast path)
        $isBlocked = Redis::get("firewall:block:{$ip}");

        if ($isBlocked === '1') {
            return response()->json([
                'success' => false,
                'message' => 'Your IP address has been blocked for security reasons.'
            ], 403);
        }

        if ($isBlocked === null) {
            // 2. Cache Miss: Check Database
            $rule = FirewallRule::where('ip_address', $ip)
                ->where('type', 'block')
                ->active()
                ->first();

            if ($rule) {
                // Cache for 1 hour
                Redis::setex("firewall:block:{$ip}", 3600, '1');
                
                return response()->json([
                    'success' => false,
                    'message' => 'Your IP address has been blocked for security reasons.'
                ], 403);
            }

            // 3. Not blocked: Cache the "Allow" status for 5 mins to avoid DB spam
            Redis::setex("firewall:block:{$ip}", 300, '0');
        }

        return $next($request);
    }
}
