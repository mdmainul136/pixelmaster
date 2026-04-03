<?php

namespace App\Modules\Tracking\Services;

use Aws\TimestreamWrite\TimestreamWriteClient;
use Aws\TimestreamQuery\TimestreamQueryClient;
use Illuminate\Support\Facades\Log;

/**
 * TimestreamAnalyticsService  (Phase 3.3)
 *
 * Writes real-time tracking analytics to AWS Timestream.
 * Used alongside ClickHouse: Timestream handles time-series KPIs (event rate,
 * p95 latency, error rate) while ClickHouse stores raw event logs.
 *
 * Timestream Tables:
 *   Database: sgtm_tracking
 *   Table:    tracking_metrics  (dimensions: container_id, event_name, destination)
 *
 * Data Model:
 *   - Measure: event_count (BIGINT), value_sum (DOUBLE), error_count (BIGINT),
 *              latency_ms (BIGINT), forwarded_count (BIGINT)
 *   - Dimensions: tenant_id, container_id, event_name, destination_type
 *
 * Setup:
 *   AWS_ACCESS_KEY_ID=...
 *   AWS_SECRET_ACCESS_KEY=...
 *   AWS_DEFAULT_REGION=ap-southeast-1
 *   TIMESTREAM_DATABASE=sgtm_tracking
 *   TIMESTREAM_TABLE=tracking_metrics
 */
class TimestreamAnalyticsService
{
    private ?TimestreamWriteClient $writer = null;
    private ?TimestreamQueryClient $reader = null;

    private string $database;
    private string $table;

    public function __construct()
    {
        $this->database = env('TIMESTREAM_DATABASE', 'sgtm_tracking');
        $this->table    = env('TIMESTREAM_TABLE',    'tracking_metrics');
    }

    /**
     * Record a tracking event metric in Timestream.
     *
     * @param int    $containerId      Container that received the event
     * @param int    $tenantId         Tenant who owns the container
     * @param string $eventName        e.g. 'purchase', 'add_to_cart'
     * @param float  $value            Conversion value (0 if not purchase)
     * @param int    $latencyMs        End-to-end processing latency in ms
     * @param array  $destinations     Destination types forwarded to
     * @param bool   $hasError         Whether the event resulted in an error
     */
    public function recordEvent(
        int    $containerId,
        int    $tenantId,
        string $eventName,
        float  $value       = 0.0,
        int    $latencyMs   = 0,
        array  $destinations = [],
        bool   $hasError     = false
    ): void {
        if (!$this->isConfigured()) {
            return; // Silently skip if Timestream not configured (local/dev)
        }

        try {
            $now = (string) (microtime(true) * 1000); // Millisecond timestamp

            $records = [
                $this->makeRecord('event_count',     1,          'BIGINT',  $containerId, $tenantId, $eventName),
                $this->makeRecord('value_sum',        $value,     'DOUBLE',  $containerId, $tenantId, $eventName),
                $this->makeRecord('latency_ms',       $latencyMs, 'BIGINT',  $containerId, $tenantId, $eventName),
                $this->makeRecord('error_count',      $hasError ? 1 : 0, 'BIGINT', $containerId, $tenantId, $eventName),
                $this->makeRecord('forwarded_count', count($destinations), 'BIGINT', $containerId, $tenantId, $eventName),
            ];

            $this->getWriter()->writeRecords([
                'DatabaseName' => $this->database,
                'TableName'    => $this->table,
                'Records'      => $records,
            ]);

        } catch (\Throwable $e) {
            // Timestream failure must NEVER block the main event pipeline
            Log::warning('[Timestream] Write failed (non-fatal)', [
                'container_id' => $containerId,
                'event_name'   => $eventName,
                'error'        => $e->getMessage(),
            ]);
        }
    }

    /**
     * Query event rate for a container in the last N hours.
     * Used by the admin dashboard for real-time sparklines.
     */
    public function getEventRate(int $containerId, int $hours = 24): array
    {
        if (!$this->isConfigured()) {
            return [];
        }

        $query = "SELECT BIN(time, 1h) as hour_bucket, "
            . "SUM(CASE WHEN measure_name='event_count' THEN measure_value::bigint ELSE 0 END) as events, "
            . "SUM(CASE WHEN measure_name='error_count' THEN measure_value::bigint ELSE 0 END) as errors "
            . "FROM \"{$this->database}\".\"{$this->table}\" "
            . "WHERE container_id = '{$containerId}' "
            . "AND time BETWEEN ago({$hours}h) AND now() "
            . "GROUP BY 1 ORDER BY 1";

        try {
            $result = $this->getReader()->query(['QueryString' => $query]);
            return $result->get('Rows') ?? [];
        } catch (\Throwable $e) {
            Log::warning('[Timestream] Query failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Get p95 latency for a container in the last 24h.
     */
    public function getP95Latency(int $containerId): int
    {
        if (!$this->isConfigured()) {
            return 0;
        }

        $query = "SELECT APPROX_PERCENTILE(measure_value::bigint, 0.95) as p95 "
            . "FROM \"{$this->database}\".\"{$this->table}\" "
            . "WHERE container_id = '{$containerId}' "
            . "AND measure_name = 'latency_ms' AND time > ago(24h)";

        try {
            $result = $this->getReader()->query(['QueryString' => $query]);
            $rows   = $result->get('Rows');
            return (int) ($rows[0]['Data'][0]['ScalarValue'] ?? 0);
        } catch (\Throwable) {
            return 0;
        }
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private function makeRecord(
        string $measureName,
        mixed  $measureValue,
        string $measureType,
        int    $containerId,
        int    $tenantId,
        string $eventName
    ): array {
        return [
            'Dimensions' => [
                ['Name' => 'container_id',  'Value' => (string) $containerId],
                ['Name' => 'tenant_id',     'Value' => (string) $tenantId],
                ['Name' => 'event_name',    'Value' => $eventName],
            ],
            'MeasureName'      => $measureName,
            'MeasureValue'     => (string) $measureValue,
            'MeasureValueType' => $measureType,
            'Time'             => (string) round(microtime(true) * 1000),
            'TimeUnit'         => 'MILLISECONDS',
        ];
    }

    private function isConfigured(): bool
    {
        return !empty(env('AWS_ACCESS_KEY_ID')) && !empty(env('TIMESTREAM_DATABASE'));
    }

    private function getWriter(): TimestreamWriteClient
    {
        if (!$this->writer) {
            $this->writer = new TimestreamWriteClient([
                'region'  => env('AWS_DEFAULT_REGION', 'ap-southeast-1'),
                'version' => 'latest',
            ]);
        }
        return $this->writer;
    }

    private function getReader(): TimestreamQueryClient
    {
        if (!$this->reader) {
            $this->reader = new TimestreamQueryClient([
                'region'  => env('AWS_DEFAULT_REGION', 'ap-southeast-1'),
                'version' => 'latest',
            ]);
        }
        return $this->reader;
    }
}
