<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Modules\Tracking\Jobs\ProcessSgtmEvent;

class SgtmController extends Controller
{
    /**
     * Ingest tracking event from client-side JS.
     * High-throughput optimized: minimal logic before dispatch.
     */
    public function collect(Request $request)
    {
        $payload = $request->all();
        $apiKey = $request->header('X-API-Key');

        if (!$apiKey) {
            return response()->json(['error' => 'Missing API Key'], 401);
        }

        // 1. Resolve config from cache (Redis) or DB
        $config = $this->resolveConfig($apiKey);

        if (!$config || !$config['is_active']) {
            return response()->json(['error' => 'Invalid or inactive container'], 403);
        }

        // 2. Prepare metadata
        $requestId = (string) Str::uuid();
        $sourceIp = $request->ip();
        $userAgent = $request->userAgent();

        // 3. Dispatch to Redis for async heavy lifting
        ProcessSgtmEvent::dispatch([
            'tenant_id'    => $config['tenant_id'],
            'container_id' => $config['container_id'],
            'event_name'   => $payload['event_name'] ?? 'unknown',
            'event_id'     => $payload['event_id']   ?? null,
            'source_ip'    => $sourceIp,
            'user_agent'   => $userAgent,
            'payload'      => $payload,
            'request_id'   => $requestId,
            'dispatched_at' => microtime(true),
        ])->onQueue($config['settings']['queue'] ?? 'sgtm_events');

        return response()->json([
            'success'   => true,
            'request_id' => $requestId,
        ], 202); // 202 Accepted
    }

    /**
     * Resolve configuration with Redis caching.
     */
    private function resolveConfig($apiKey)
    {
        $cacheKey = "sgtm:config:{$apiKey}";
        
        $cached = Redis::get($cacheKey);
        if ($cached) {
            return json_decode($cached, true);
        }

        $config = \DB::table('tenant_sgtm_configs')
            ->where('api_key', $apiKey)
            ->first();

        if ($config) {
            $data = [
                'tenant_id'    => $config->tenant_id,
                'container_id' => $config->container_id,
                'is_active'    => (bool) $config->is_active,
                'settings'     => json_decode($config->settings, true) ?: [],
            ];
            Redis::setex($cacheKey, 3600, json_encode($data));
            return $data;
        }

        return null;
    }
}
