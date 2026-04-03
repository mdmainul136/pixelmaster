<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;

class PerformanceMonitoring
{
    public function handle($request, Closure $next)
    {
        $startTime = microtime(true);
        $startMemory = memory_get_usage();
        
        $response = $next($request);
        
        $executionTime = (microtime(true) - $startTime) * 1000; // ms
        $memoryUsed = (memory_get_usage() - $startMemory) / 1024 / 1024; // MB
        
        // Log slow requests
        if ($executionTime > 1000) { // > 1 second
            Log::warning('Slow Request Detected', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'execution_time' => round($executionTime, 2) . 'ms',
                'memory' => round($memoryUsed, 2) . 'MB',
            ]);
        }
        
        // Store metrics in Redis for dashboard
        $date = now()->format('Y-m-d');
        try {
            Redis::hincrby("metrics:{$date}:requests", 'total', 1);
            Redis::hincrbyfloat("metrics:{$date}:performance", 'avg_time', $executionTime);
        } catch (\Exception $e) {
            // Redis might be down, don't break the app
        }
        
        // Add performance headers
        $response->headers->set('X-Response-Time', round($executionTime, 2) . 'ms');
        $response->headers->set('X-Memory-Usage', round($memoryUsed, 2) . 'MB');
        
        return $response;
    }
}
