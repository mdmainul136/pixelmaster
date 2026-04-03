<?php

namespace App\Modules\Tracking\Services;

use App\Models\Tracking\TrackingContainer;
use App\Models\Tracking\TrackingEventLog;
use App\Events\Tracking\NewTrackingEvent;
use Illuminate\Support\Facades\Log;

class EventDebuggerService
{
    /**
     * Push an event to the real-time debugger.
     * Applies SHA-256 hashing to PII for privacy compliance.
     */
    public function push(TrackingContainer $container, array $data, string $requestId): void
    {
        // 1. Privacy First: Hash PII in the payload
        $hashedData = $this->hashSensitiveData($data);

        // 2. Create the permanent (24h) log record
        $log = TrackingEventLog::create([
            'tenant_id'    => $container->tenant_id,
            'container_id' => $container->id,
            'event_id'     => $data['event_id'] ?? null,
            'event_name'   => $data['event_name'] ?? 'unknown',
            'client_id'    => $data['client_id'] ?? null,
            'source_ip'    => request()->ip(),
            'user_agent'   => request()->userAgent(),
            'page_url'     => $data['page_location'] ?? $data['page_url'] ?? null,
            'status'       => 'processed',
            'status_code'  => 200,
            'request_id'   => $requestId,
            'payload'      => $hashedData,
            'processed_at' => now(),
        ]);

        // 3. Broadcast for real-time UI updates
        try {
            broadcast(new NewTrackingEvent($container->tenant_id, $log))->toOthers();
        } catch (\Exception $e) {
            Log::error("Failed to broadcast tracking event to debugger: " . $e->getMessage());
        }
    }

    /**
     * Scans the payload and hashes known PII fields using SHA-256.
     */
    private function hashSensitiveData(array $data): array
    {
        $piiKeys = [
            'email', 'phone', 'phone_number', 'fn', 'ln', 'first_name', 'last_name',
            'external_id', 'address', 'city', 'zip', 'ct', 'st', 'zp'
        ];

        array_walk_recursive($data, function (&$value, $key) use ($piiKeys) {
            if (in_array(strtolower($key), $piiKeys) && !empty($value)) {
                // Ensure value is normalized before hashing
                $normalized = strtolower(trim((string)$value));
                $value = hash('sha256', $normalized);
            }
        });

        return $data;
    }
}
