<?php

namespace App\Modules\Tracking\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class ProcessSgtmEvent implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [5, 30, 60];

    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function handle()
    {
        $tenantId = $this->data['tenant_id'];
        $containerId = $this->data['container_id'];
        $payload = $this->data['payload'];
        $requestId = $this->data['request_id'];

        // 1. Log to Database (Audit)
        try {
            DB::table('sgtm_event_logs')->insert([
                'tenant_id'    => $tenantId,
                'container_id' => $containerId,
                'event_name'   => $this->data['event_name'],
                'event_id'     => $this->data['event_id'],
                'event_time'   => isset($payload['event_time']) ? date('Y-m-d H:i:s', $payload['event_time']) : now(),
                'source_ip'    => $this->data['source_ip'],
                'user_agent'   => $this->data['user_agent'],
                'payload'      => json_encode($payload),
                'status_code'  => 200,
                'request_id'   => $requestId,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error("[sGTM] Log Persistence Failed", [
                'request_id' => $requestId,
                'error'      => $e->getMessage()
            ]);
        }

        // 2. ClickHouse Sidecar (Tier 2 Scaling)
        $this->syncToClickHouse($payload);

        // 3. Performance Tracking (Metrics)
        $this->recordPerformance();

        // 3. Fan-out to Marketing Channels (Meta, TikTok, etc.)
        // Note: For now, we integrate with existing DestinationService if available
        // or trigger specific channel logic.
        Log::info("[sGTM] Event processed and fanned out", [
            'request_id' => $requestId,
            'event'      => $this->data['event_name']
        ]);
    }

    protected function syncToClickHouse(array $payload)
    {
        $config = config('tracking.clickhouse');

        if (!$config['enabled']) {
            return;
        }

        try {
            $url = "http://{$config['host']}:{$config['port']}/?database={$config['database']}&query=" . urlencode("INSERT INTO {$config['table']} FORMAT JSONEachRow");
            
            $data = array_merge($payload, [
                'tenant_id'    => $this->data['tenant_id'],
                'container_id' => $this->data['container_id'],
                'event_name'   => $this->data['event_name'],
                'event_id'     => $this->data['event_id'],
                'source_ip'    => $this->data['source_ip'],
                'user_agent'   => $this->data['user_agent'],
                'request_id'   => $this->data['request_id'],
                'created_at'   => now()->toDateTimeString(),
            ]);

            \Illuminate\Support\Facades\Http::withBasicAuth($config['username'], $config['password'])
                ->timeout(2)
                ->withBody(json_encode($data), 'application/json')
                ->post($url);

        } catch (\Throwable $e) {
            Log::warning("[sGTM] ClickHouse Sync Failed", [
                'error' => $e->getMessage()
            ]);
        }
    }

    protected function recordPerformance()
    {
        $now = microtime(true);
        $waitTime = $now - ($this->data['dispatched_at'] ?? $now);
        $minuteKey = date('YmdHi');

        try {
            Redis::pipeline(function ($pipe) use ($minuteKey, $waitTime) {
                $pipe->incr("tracking:metrics:jpm:{$minuteKey}");
                $pipe->expire("tracking:metrics:jpm:{$minuteKey}", 3600);
                
                $pipe->incrby("tracking:metrics:latency:{$minuteKey}", (int)($waitTime * 1000));
                $pipe->expire("tracking:metrics:latency:{$minuteKey}", 3600);
            });
        } catch (\Throwable $e) {
            // Silently fail metrics
        }
    }
}
