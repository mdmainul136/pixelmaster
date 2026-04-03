<?php

namespace App\Modules\Tracking\Console;

use App\Models\Tracking\TrackingDestination;
use App\Modules\Tracking\Services\Channels\SnapchatConversionService;
use App\Modules\Tracking\Traits\ThrottlesApiCalls;
use Illuminate\Console\Command;

/**
 * php artisan tracking:drain-snap-queue
 * Queue key: snap:queue:{pixelId}
 * Scheduled every minute (Snap rate limit is per-minute).
 */
class DrainSnapQueueCommand extends Command
{
    use ThrottlesApiCalls;

    protected $signature   = 'tracking:drain-snap-queue {--limit=500 : Max events to drain per run}';
    protected $description = 'Drain buffered Snapchat CAPI events queued due to rate limiting';

    public function handle(SnapchatConversionService $snap): int
    {
        $limit = (int) $this->option('limit');
        $total = 0;

        $destinations = TrackingDestination::where('type', 'snapchat')
            ->where('is_active', true)
            ->get();

        foreach ($destinations as $dest) {
            $creds   = $dest->credentials ?? [];
            $pixelId = $creds['pixel_id'] ?? null;
            if (!$pixelId) continue;

            $this->initThrottle('snap', $pixelId, 1800, 60);
            $depth = $this->queueDepth($pixelId);
            if ($depth === 0) continue;

            $this->info("[Snap Drain] Pixel {$pixelId}: {$depth} queued");

            $drained = 0;
            $batch   = [];

            while ($drained < $limit) {
                $items = $this->popDeferred($pixelId, min(100, $limit - $drained));
                if (empty($items)) break;

                foreach ($items as $item) {
                    $batch[] = $item['event'];
                    $drained++;
                    if (count($batch) >= 100) {
                        $snap->sendEvents($batch, $creds);
                        $total += count($batch);
                        $batch = [];
                    }
                }
            }

            if (!empty($batch)) {
                $snap->sendEvents($batch, $creds);
                $total += count($batch);
            }

            $this->info("[Snap Drain] Sent {$drained} for pixel {$pixelId}");
        }

        $this->info("[Snap Drain] Total: {$total}");
        return self::SUCCESS;
    }
}
