<?php

namespace App\Modules\Tracking\Console;

use App\Models\Tracking\TrackingDestination;
use App\Modules\Tracking\Services\Channels\TwitterConversionService;
use App\Modules\Tracking\Traits\ThrottlesApiCalls;
use Illuminate\Console\Command;

/**
 * php artisan tracking:drain-twitter-queue
 * Queue key: twitter:queue:{pixelId}
 */
class DrainTwitterQueueCommand extends Command
{
    use ThrottlesApiCalls;

    protected $signature   = 'tracking:drain-twitter-queue {--limit=200 : Max events to drain per run}';
    protected $description = 'Drain buffered Twitter/X Conversions events queued due to rate limiting';

    public function handle(TwitterConversionService $twitter): int
    {
        $limit = (int) $this->option('limit');
        $total = 0;

        $destinations = TrackingDestination::where('type', 'twitter')
            ->where('is_active', true)
            ->get();

        foreach ($destinations as $dest) {
            $creds   = $dest->credentials ?? [];
            $pixelId = $creds['pixel_id'] ?? null;
            if (!$pixelId) continue;

            $this->initThrottle('twitter', $pixelId, 450, 60);
            $depth = $this->queueDepth($pixelId);
            if ($depth === 0) continue;

            $this->info("[Twitter Drain] Pixel {$pixelId}: {$depth} queued");

            $drained = 0;
            while ($drained < $limit) {
                // Twitter Conversions API doesn't have a high-volume batch endpoint 
                // like GA4's batch, but we iterate and send.
                $items = $this->popDeferred($pixelId, min(50, $limit - $drained));
                if (empty($items)) break;

                $batch = array_column($items, 'event');
                $twitter->sendEvents($batch, $creds);
                
                $drained += count($batch);
                $total   += count($batch);
            }

            $this->info("[Twitter Drain] Sent {$drained} for pixel {$pixelId}");
        }

        $this->info("[Twitter Drain] Total: {$total}");
        return self::SUCCESS;
    }
}
