<?php

namespace App\Modules\Tracking\Console;

use App\Models\Tracking\TrackingDestination;
use App\Modules\Tracking\Services\MetaCapiService;
use App\Modules\Tracking\Traits\ThrottlesApiCalls;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

/**
 * DrainMetaQueueCommand
 *
 * Artisan: php artisan tracking:drain-meta-queue
 *
 * Drains the Redis deferred event queue for Meta CAPI destinations
 * that were throttled (> 180 req/hour per pixel) and buffered for later.
 *
 * Queue key pattern: meta:queue:{pixelId}
 * Scheduled every 5 minutes (Meta limit resets hourly, no point draining every minute).
 */
class DrainMetaQueueCommand extends Command
{
    use ThrottlesApiCalls;

    protected $signature   = 'tracking:drain-meta-queue {--limit=500 : Max events to drain per run}';
    protected $description = 'Drain buffered Meta CAPI events queued due to rate limiting';

    public function handle(MetaCapiService $meta): int
    {
        $limit = (int) $this->option('limit');
        $total = 0;

        $destinations = TrackingDestination::where('type', 'facebook_capi')
            ->where('is_active', true)
            ->get();

        foreach ($destinations as $dest) {
            $creds   = $dest->credentials ?? [];
            $pixelId = $creds['pixel_id'] ?? $creds['dataset_id'] ?? null;

            if (!$pixelId) {
                continue;
            }

            $this->initThrottle('meta', $pixelId, 180, 3600);
            $depth = $this->queueDepth($pixelId);

            if ($depth === 0) {
                continue;
            }

            $this->info("[Meta Drain] Pixel {$pixelId}: {$depth} events queued");

            $drained = 0;
            $batch   = [];

            while ($drained < $limit) {
                $items = $this->popDeferred($pixelId, min(100, $limit - $drained));
                if (empty($items)) {
                    break;
                }

                foreach ($items as $item) {
                    $batch[] = $item['event'];
                    $drained++;

                    // Meta accepts up to 1000 per call — flush at 500 for safety
                    if (count($batch) >= 500) {
                        $meta->sendEvents($batch, $creds);
                        $total += count($batch);
                        $batch = [];
                    }
                }
            }

            // Flush remainder
            if (!empty($batch)) {
                $meta->sendEvents($batch, $creds);
                $total += count($batch);
            }

            $this->info("[Meta Drain] Sent {$drained} events for pixel {$pixelId}");
        }

        $this->info("[Meta Drain] Total drained: {$total}");
        return self::SUCCESS;
    }
}
