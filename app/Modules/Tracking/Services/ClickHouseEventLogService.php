<?php

namespace App\Modules\Tracking\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ClickHouseEventLogService  (Phase 3.2)
 *
 * High-performance event log writer backed by ClickHouse.
 * Designed to replace the MySQL TrackingEventLog table for raw event storage
 * at 10K+ tenant scale (> 1B events/month).
 *
 * Why ClickHouse:
 *   - Columnar storage → 10–100× faster analytics queries than MySQL
 *   - Compression → 5–10× smaller storage footprint
 *   - Batch inserts → extremely efficient for high-throughput write workloads
 *   - MySQL stays for container config, destinations, billing (transactional)
 *
 * Setup:
 *   CLICKHOUSE_HOST=localhost
 *   CLICKHOUSE_PORT=8123
 *   CLICKHOUSE_DB=sgtm_tracking
 *   CLICKHOUSE_USER=default
 *   CLICKHOUSE_PASSWORD=
 *
 * Table DDL (run once on ClickHouse server):
 *   CREATE TABLE sgtm_events (
 *     tenant_id       UInt32,
 *     container_id    UInt32,
 *     event_id        String,
 *     event_name      LowCardinality(String),
 *     source_ip       String,
 *     user_hash       String,
 *     value           Nullable(Float64),
 *     currency        LowCardinality(String),
 *     request_id      String,
 *     retry_count     UInt8 DEFAULT 0,
 *     payload         String,       -- JSON blob
 *     status          LowCardinality(String) DEFAULT 'received',
 *     processed_at    DateTime64(3) DEFAULT now64()
 *   ) ENGINE = MergeTree()
 *     PARTITION BY toYYYYMM(processed_at)
 *     ORDER BY (tenant_id, container_id, processed_at)
 *     TTL processed_at + INTERVAL 12 MONTH;
 */
class ClickHouseEventLogService
{
    /** @var resource|null Raw HTTP connection to ClickHouse HTTP interface */
    private ?string $dsn = null;
    private string $type = 'self_hosted';

    public function __construct()
    {
        $this->configureFor('self_hosted'); // Default init
    }

    /**
     * Dynamically configure the service for a specific ClickHouse instance type.
     */
    public function configureFor(string $type): self
    {
        $this->type = ($type === 'cloud') ? 'cloud' : 'self_hosted';

        // Fetch settings from GlobalSetting or env fallbacks
        $host = \App\Models\GlobalSetting::get("{$this->type}_host", env('CLICKHOUSE_HOST', 'localhost'));
        $port = \App\Models\GlobalSetting::get("{$this->type}_port", env('CLICKHOUSE_PORT', ($this->type === 'cloud' ? 8443 : 8123)));
        $user = \App\Models\GlobalSetting::get("{$this->type}_user", env('CLICKHOUSE_USER', 'default'));
        $pass = \App\Models\GlobalSetting::get("{$this->type}_password", env('CLICKHOUSE_PASSWORD', ''));
        $db   = \App\Models\GlobalSetting::get("{$this->type}_database", env('CLICKHOUSE_DATABASE', 'sgtm_tracking'));

        // Handle the specific Cloud Host provided by the user as a smart fallback
        if ($this->type === 'cloud' && ($host === 'localhost' || empty($host))) {
            $host = 'gsomw8qbfi.ap-southeast-1.aws.clickhouse.cloud';
        }

        // Build DSN following the user's specific Cloud requirements (HTTPS/8443/SSL)
        $protocol = ($this->type === 'cloud' || (int)$port === 8443) ? 'https' : 'http';
        
        // We build the base URL. Note: curl_init handles user:pass in URL correctly
        $this->dsn = "{$protocol}://{$user}:{$pass}@{$host}:{$port}/?database={$db}";
        
        if ($protocol === 'https' || $this->type === 'cloud') {
            $this->dsn .= "&ssl=true";
        }

        return $this;
    }

    /**
     * Write a single event to ClickHouse (used in low-volume / dev contexts).
     * For high-volume production, prefer insertBatch().
     */
    public function insert(array $event): bool
    {
        return $this->insertBatch([$event]);
    }

    /**
     * Write a batch of events to ClickHouse via HTTP INSERT query.
     * Much more efficient than single-row inserts.
     *
     * @param array $events  Array of event rows
     */
    public function insertBatch(array $events): bool
    {
        if (empty($events)) {
            return true;
        }

        $rows = array_map(fn($e) => $this->buildRow($e), $events);
        $sql  = "INSERT INTO sgtm_events FORMAT JSONEachRow\n" . implode("\n", array_map('json_encode', $rows));

        try {
            $ch = curl_init($this->dsn);
            curl_setopt_array($ch, [
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $sql,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 10,
                CURLOPT_HTTPHEADER     => ['Content-Type: text/plain'],
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200) {
                Log::error('[ClickHouse] Insert failed', [
                    'status'   => $httpCode,
                    'response' => $response,
                    'rows'     => count($events),
                ]);
                return false;
            }

            Log::debug('[ClickHouse] Batch inserted', ['rows' => count($events)]);
            return true;

        } catch (\Throwable $e) {
            Log::error('[ClickHouse] Connection error', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Query event count for a container in a date range.
     * Falls back to 0 on ClickHouse unavailability (non-blocking for billing).
     */
    public function getEventCount(int $tenantId, int $containerId, string $from, string $to): int
    {
        $sql = "SELECT count() as cnt FROM sgtm_events "
            . "WHERE tenant_id = {$tenantId} AND container_id = {$containerId} "
            . "AND processed_at >= '{$from}' AND processed_at <= '{$to}'";

        try {
            $ch = curl_init($this->dsn . "&query=" . urlencode($sql) . "&default_format=JSONCompact");
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 5,
            ]);
            $response = curl_exec($ch);
            curl_close($ch);

            $data = json_decode($response, true);
            return (int) ($data['data'][0]['cnt'] ?? 0);

        } catch (\Throwable) {
            return 0;
        }
    }

    /**
     * Get top N event names for a container (for dashboard analytics).
     */
    public function getTopEvents(int $tenantId, int $containerId, int $days = 30, int $limit = 10): array
    {
        $since = now()->subDays($days)->toDateTimeString();
        $sql   = "SELECT event_name, count() as cnt, sum(value) as total_value "
            . "FROM sgtm_events "
            . "WHERE tenant_id = {$tenantId} AND container_id = {$containerId} AND processed_at >= '{$since}' "
            . "GROUP BY event_name ORDER BY cnt DESC LIMIT {$limit}";

        try {
            $ch = curl_init($this->dsn . "&query=" . urlencode($sql) . "&default_format=JSON");
            curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 5]);
            $response = curl_exec($ch);
            curl_close($ch);

            return json_decode($response, true)['data'] ?? [];
        } catch (\Throwable) {
            return [];
        }
    }

    /**
     * Execute a raw SQL query and return the JSON response.
     */
    public function queryRaw(string $sql): array
    {
        try {
            $ch = curl_init($this->dsn . "&query=" . urlencode($sql) . "&default_format=JSON");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200) {
                Log::error('[ClickHouse] Raw query failed', ['code' => $httpCode, 'sql' => $sql, 'response' => $response]);
                return [];
            }

            return json_decode($response, true) ?? [];
        } catch (\Throwable $e) {
            Log::error('[ClickHouse] Query exception', ['error' => $e->getMessage(), 'sql' => $sql]);
            return [];
        }
    }

    /**
     * Get overview stats for a set of containers in the last 24h.
     */
    public function getOverviewStats(int $tenantId, array $containerIds, string $since): array
    {
        if (empty($containerIds)) return [];
        $ids = implode(',', $containerIds);

        $sql = "SELECT
            count() as total_events,
            countIf(status = 'processed') as processed,
            countIf(status = 'failed') as failed,
            countIf(status = 'duplicate') as deduped,
            sum(value) as total_value,
            avg(value) as avg_value
            FROM sgtm_events
            WHERE tenant_id = {$tenantId} AND container_id IN ({$ids}) AND processed_at >= '{$since}'";

        try {
            $ch = curl_init($this->dsn . "&query=" . urlencode($sql) . "&default_format=JSON");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($ch);
            curl_close($ch);

            return json_decode($response, true)['data'][0] ?? [];
        } catch (\Throwable) {
            return [];
        }
    }

    /**
     * Get hourly event breakdown for sparklines.
     */
    public function getHourlyStats(int $tenantId, array $containerIds, string $since): array
    {
        if (empty($containerIds)) return [];
        $ids = implode(',', $containerIds);

        $sql = "SELECT toHour(processed_at) as hour, count() as count
                FROM sgtm_events
                WHERE tenant_id = {$tenantId} AND container_id IN ({$ids}) AND processed_at >= '{$since}'
                GROUP BY hour ORDER BY hour ASC";

        try {
            $ch = curl_init($this->dsn . "&query=" . urlencode($sql) . "&default_format=JSON");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($ch);
            curl_close($ch);

            return json_decode($response, true)['data'] ?? [];
        } catch (\Throwable) {
            return [];
        }
    }

    /**
     * Get paginated event feed from ClickHouse.
     */
    public function getEventFeed(int $tenantId, array $containerIds, array $filters, int $limit = 25, int $offset = 0): array
    {
        if (empty($containerIds)) return ['data' => [], 'total' => 0];
        $ids = implode(',', $containerIds);

        $where = ["tenant_id = {$tenantId}", "container_id IN ({$ids})"];
        if (!empty($filters['event_name'])) $where[] = "event_name LIKE '%" . $filters['event_name'] . "%'";
        if (!empty($filters['status']))     $where[] = "status = '" . $filters['status'] . "'";
        if (!empty($filters['from']))       $where[] = "processed_at >= '" . $filters['from'] . "'";
        if (!empty($filters['to']))         $where[] = "processed_at <= '" . $filters['to'] . "'";

        $whereClause = implode(' AND ', $where);

        $sql = "SELECT event_id as id, event_name, source_ip, value, status, processed_at
                FROM sgtm_events
                WHERE {$whereClause}
                ORDER BY processed_at DESC
                LIMIT {$limit} OFFSET {$offset}";

        try {
            $ch = curl_init($this->dsn . "&query=" . urlencode($sql) . "&default_format=JSON");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($ch);
            curl_close($ch);

            $data = json_decode($response, true)['data'] ?? [];

            // Get total for pagination
            $countSql = "SELECT count() as total FROM sgtm_events WHERE {$whereClause}";
            $ch = curl_init($this->dsn . "&query=" . urlencode($countSql) . "&default_format=JSON");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $totalCount = json_decode(curl_exec($ch), true)['data'][0]['total'] ?? 0;
            curl_close($ch);

            return [
                'data'  => $data,
                'total' => (int) $totalCount,
            ];
        } catch (\Throwable) {
            return ['data' => [], 'total' => 0];
        }
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private function buildRow(array $event): array
    {
        return [
            'tenant_id'    => (int) ($event['tenant_id'] ?? 0),
            'container_id' => (string) ($event['container_id'] ?? 'unknown'),
            'event_id'     => $event['event_id']     ?? Str::uuid()->toString(),
            'event_name'   => $event['event_name']   ?? 'unknown',
            'source_ip'    => $event['source_ip']    ?? '',
            'user_hash'    => $event['user_hash']    ?? '',
            'value'        => isset($event['value']) ? (float) $event['value'] : null,
            'currency'     => $event['currency']     ?? '',
            'request_id'   => $event['request_id']   ?? '',
            'retry_count'  => (int) ($event['retry_count'] ?? 0),
            'payload'      => is_string($event['payload'])
                ? $event['payload']
                : json_encode($event['payload'] ?? []),
            'status'       => $event['status']       ?? 'received',
            'processed_at' => now()->format('Y-m-d H:i:s.v'),
        ];
    }
}
