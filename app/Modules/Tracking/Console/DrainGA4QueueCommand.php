<?php

namespace App\Modules\Tracking\Console;

use App\Models\Tracking\TrackingDestination;
use App\Modules\Tracking\Services\Channels\GA4MeasurementProtocolService;
use Illuminate\Console\Command;

/**
 * DrainGA4QueueCommand
 *
 * Artisan: php artisan tracking:drain-ga4-queue
 *
 * Drains the Redis deferred event queue for GA4 destinations that were
 * throttled (> 10 events/sec per client_id) and buffered for later sending.
 *
 * Scheduled every minute in routes/console.php.
 */
class DrainGA4QueueCommand extends Command
{
    protected $signature   = 'tracking:drain-ga4-queue {--limit=200 : Max events to drain per run}';
    protected $description = 'Drain buffered GA4 events that were queued due to rate limiting';

    public function handle(GA4MeasurementProtocolService $ga4): int
    {
        $limit = (int) $this->option('limit');
        $total = 0;

        // Find all active GA4 destinations
        $destinations = TrackingDestination::where('type', 'ga4')
            ->where('is_active', true)
            ->get();

        foreach ($destinations as $dest) {
            $creds         = $dest->credentials ?? [];
            $measurementId = $creds['measurement_id'] ?? null;

            if (!$measurementId) {
                continue;
            }

            $drained = $ga4->drainQueue($measurementId, $creds, $limit);

            if ($drained > 0) {
                $this->info("[GA4 Drain] {$dest->id} ({$measurementId}): {$drained} events sent");
                $total += $drained;
            }
        }

        if ($total > 0) {
            $this->info("[GA4 Drain] Total drained: {$total} events");
        }

        return self::SUCCESS;
    }
}
