<?php

namespace App\Modules\Tracking\Console;

use App\Models\Tracking\TrackingDestination;
use App\Modules\Tracking\Services\Channels\TikTokEventsService;
use App\Modules\Tracking\Traits\ThrottlesApiCalls;
use Illuminate\Console\Command;

/**
 * DrainTikTokQueueCommand
 *
 * Artisan: php artisan tracking:drain-tiktok-queue
 *
 * Drains the Redis deferred event queue for TikTok destinations
 * that were throttled (> 900 req/min per pixel) and buffered for later.
 *
 * Queue key pattern: tiktok:queue:{pixelCode}
 * Scheduled every minute — TikTok limit is per-minute so drain frequently.
 */
class DrainTikTokQueueCommand extends Command
{
    use ThrottlesApiCalls;

    protected $signature   = 'tracking:drain-tiktok-queue {--limit=250 : Max events to drain per run}';
    protected $description = 'Drain buffered TikTok Events API events queued due to rate limiting';

    public function handle(TikTokEventsService $tiktok): int
    {
        $limit = (int) $this->option('limit');
        $total = 0;

        $destinations = TrackingDestination::where('type', 'tiktok')
            ->where('is_active', true)
            ->get();

        foreach ($destinations as $dest) {
            $creds     = $dest->credentials ?? [];
            $pixelCode = $creds['pixel_code'] ?? null;

            if (!$pixelCode) {
                continue;
            }

            $this->initThrottle('tiktok', $pixelCode, 900, 60);
            $depth = $this->queueDepth($pixelCode);

            if ($depth === 0) {
                continue;
            }

            $this->info("[TikTok Drain] Pixel {$pixelCode}: {$depth} events queued");

            $drained = 0;
            $batch   = [];

            while ($drained < $limit) {
                $items = $this->popDeferred($pixelCode, min(50, $limit - $drained));
                if (empty($items)) {
                    break;
                }

                foreach ($items as $item) {
                    $batch[] = $item['event'];
                    $drained++;

                    // TikTok hard limit: 50 events per request
                    if (count($batch) >= 50) {
                        $tiktok->sendEvents($batch, $creds);
                        $total += count($batch);
                        $batch = [];
                    }
                }
            }

            // Flush remainder
            if (!empty($batch)) {
                $tiktok->sendEvents($batch, $creds);
                $total += count($batch);
            }

            $this->info("[TikTok Drain] Sent {$drained} events for pixel {$pixelCode}");
        }

        $this->info("[TikTok Drain] Total drained: {$total}");
        return self::SUCCESS;
    }
}
