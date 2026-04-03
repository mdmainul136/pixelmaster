<?php

namespace App\Modules\Tracking\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * ClickHouse Native Analytical Driver
 *
 * This Service bypasses Eloquent completely, pushing raw HTTP API POSTs
 * directly to the ClickHouse port (usually 8123) for blazing fast
 * column-oriented big data inserts using native JSONEachRow mappings.
 */
class ClickHouseService
{
    protected string $host;
    protected int $port;
    protected string $database;
    protected string $user;
    protected string $password;

    public function __construct()
    {
        $this->host     = env('CLICKHOUSE_HOST', '127.0.0.1');
        $this->port     = (int) env('CLICKHOUSE_PORT', 8123);
        $this->database = env('CLICKHOUSE_DATABASE', 'tracking');
        $this->user     = env('CLICKHOUSE_USER', 'default');
        $this->password = env('CLICKHOUSE_PASSWORD', '');
    }

    /**
     * Resolve the active database name.
     * Uses explicit override if set, otherwise falls back to the current tenant ID.
     */
    public function getActiveDatabase(): string
    {
        $tenantId = tenant('id');
        if ($tenantId) {
            // e.g. tracking_mytenant123
            return env('CLICKHOUSE_DATABASE', 'tracking') . '_' . str_replace('-', '_', $tenantId);
        }

        return $this->database;
    }

    /**
     * Manually override the active database (useful for migration loops).
     */
    public function setDatabase(string $database): self
    {
        $this->database = $database;
        return $this;
    }

    /**
     * Executes raw ClickHouse query (useful for Migrations/DDL).
     */
    public function statement(string $query): bool
    {
        try {
            $response = Http::withBasicAuth($this->user, $this->password)
                ->withHeaders(['X-ClickHouse-Database' => $this->getActiveDatabase()])
                ->withBody($query, 'text/plain')
                ->post($this->getBaseUrl());

            if ($response->failed()) {
                Log::error("ClickHouse Statement Error: " . $response->body());
                return false;
            }
            return true;
        } catch (\Exception $e) {
            Log::error("ClickHouse Network Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Bulk insert an array of events using JSONEachRow format.
     * ClickHouse works MUCH faster when given bulk inserts vs single rows.
     *
     * @param string $table The destination table (e.g. 'tracking_event_logs')
     * @param array $rows Array of associative arrays matching column names
     */
    public function bulkInsert(string $table, array $rows): bool
    {
        if (empty($rows)) {
            return true;
        }

        // Format: JSONEachRow (one JSON object per line)
        // {"id": 1, "name": "foo"}
        // {"id": 2, "name": "bar"}
        $payload = implode("\n", array_map('json_encode', $rows));

        // Construct query string using prepared queries format
        $query = "INSERT INTO {$table} FORMAT JSONEachRow";

        try {
            $response = Http::withBasicAuth($this->user, $this->password)
                ->withHeaders([
                    'X-ClickHouse-Database' => $this->getActiveDatabase()
                ])
                ->withBody($payload, 'application/x-ndjson')
                ->post($this->getBaseUrl() . "?query=" . urlencode($query));

            if ($response->failed()) {
                Log::error("ClickHouse Bulk Insert Failed: " . $response->body(), ['sample' => $rows[0] ?? []]);
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error("ClickHouse Bulk Insert Network Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Insert a single event (Convenience wrapper for low-throughput routing).
     *
     * @param string $table The destination table
     * @param array $row Associative array of column data
     */
    public function insertRow(string $table, array $row): bool
    {
        return $this->bulkInsert($table, [$row]);
    }

    /**
     * Retrieves the base URL.
     */
    private function getBaseUrl(): string
    {
        $protocol = str_contains($this->host, 'https://') ? 'https://' : 'http://';
        $host = str_replace(['http://', 'https://'], '', $this->host);
        return "{$protocol}{$host}:{$this->port}/";
    }
}
