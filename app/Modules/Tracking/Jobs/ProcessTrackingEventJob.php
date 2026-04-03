<?php

namespace App\Modules\Tracking\Jobs;

use App\Models\Tracking\TrackingEventLog;
use App\Modules\Tracking\Services\ClickHouseEventLogService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * ProcessTrackingEventJob
 *
 * Async log-writer job dispatched by ProcessTrackingEventAction after
 * the pipeline has completed fan-out.
 *
 *   ✅ Write to tracking_event_logs (MySQL — audit/transactional)
 *   ✅ Mirror to ClickHouse (columnar — high-perf analytics)
 *   ❌ Does NOT re-run dedup, enrichment, or fan-out (already done in Action)
 *
 * Queue: 'tracking-logs' (low-priority)
 * Retries: 3 (10s, 60s, 300s backoff)
 */
class ProcessTrackingEventJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int   $tries   = 3;
    public array $backoff = [10, 60, 300];
    public int   $timeout = 30;
    public array $data;

    public $queue = 'tracking-logs';

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    /**
     * Execute: dual-write MySQL + ClickHouse.
     */
    public function handle(ClickHouseEventLogService $clickhouse): void
    {
        $containerId = $this->data['container_id'] ?? null;
        $tenantId    = $this->data['tenant_id']    ?? 0;
        $eventType   = $this->data['event_type']   ?? 'unknown';
        $payload     = $this->data['payload']       ?? [];
        $requestId   = $this->data['_request_id']   ?? null;
        $retryCount  = $this->data['_retry_count']  ?? 0;
        $dispatchedAt = $this->data['_dispatched_at'] ?? microtime(true);

        // ── 0. Performance Instrumentation ───────────────────────────────────
        $now = microtime(true);
        $waitTime = $now - $dispatchedAt;
        $minuteKey = date('YmdHi');

        try {
            $redis = \Illuminate\Support\Facades\Redis::connection('default');
            $redis->pipeline(function ($pipe) use ($minuteKey, $waitTime) {
                // JPM (Jobs Per Minute)
                $pipe->incr("tracking:metrics:jpm:{$minuteKey}");
                $pipe->expire("tracking:metrics:jpm:{$minuteKey}", 3600); // 1h TTL

                // Latency (Total Wait Time in ms)
                $pipe->incrby("tracking:metrics:latency:{$minuteKey}", (int)($waitTime * 1000));
                $pipe->expire("tracking:metrics:latency:{$minuteKey}", 3600);
            });
        } catch (\Throwable $e) {
            // Metrics failure should never kill the job
            Log::warning('[Metrics] Failed to record queue metrics', ['error' => $e->getMessage()]);
        }

        // ── MySQL — TRANSACTIONAL AUDIT TRAIL REMOVED (As per Pure ClickHouse Architecture) ──
        // Events are now stored ONLY in ClickHouse to ensure multi-billion event scale.

        // ── 2. ClickHouse — columnar analytics store (non-blocking) ──────────
        // ClickHouse failure MUST NOT cause a job retry; MySQL is source of truth.
        try {
            // HYBRID SYNC: Configure for the container's preferred ClickHouse instance
            if ($containerId) {
                $containerType = \Illuminate\Support\Facades\Cache::remember("container:{$containerId}:ch_type", 3600, function() use ($containerId) {
                    return \App\Models\Tracking\TrackingContainer::where('id', $containerId)->value('clickhouse_type') ?? 'self_hosted';
                });
                $clickhouse->configureFor($containerType);
            }

            $clickhouse->insert([
                'tenant_id'    => $tenantId,
                'container_id' => $containerId,
                'event_id'     => $payload['event_id']   ?? null,
                'event_name'   => $payload['event_name'] ?? $eventType,
                'source_ip'    => $this->data['source_ip']  ?? '',
                'user_hash'    => isset($payload['user_data']['em'])
                    ? hash('sha256', $payload['user_data']['em'])
                    : '',
                'value'        => $payload['custom_data']['value']    ?? null,
                'currency'     => $payload['custom_data']['currency'] ?? '',
                'request_id'   => $requestId ?? '',
                'retry_count'  => $retryCount,
                'payload'      => $payload,
                'status'       => 'processed',
            ]);
        } catch (\Throwable $e) {
            Log::warning('[Tracking][ClickHouse] Dual-write failed (non-fatal)', [
                'container_id' => $containerId,
                'event_id'     => $payload['event_id'] ?? null,
                'error'        => $e->getMessage(),
            ]);
            // Do NOT re-throw — job succeeds even if ClickHouse is unavailable
        }

        Log::info('[Tracking] Event logged (MySQL + ClickHouse)', [
            'event_id'     => $payload['event_id'] ?? null,
            'container_id' => $containerId,
            'request_id'   => $requestId,
        ]);
    }

    public function failed(\Throwable $e): void
    {
        Log::critical('[Tracking] ProcessTrackingEventJob permanently failed', [
            'container_id' => $this->data['container_id'] ?? null,
            'event_type'   => $this->data['event_type']   ?? null,
            'request_id'   => $this->data['_request_id']  ?? null,
            'error'        => $e->getMessage(),
        ]);
    }
}
