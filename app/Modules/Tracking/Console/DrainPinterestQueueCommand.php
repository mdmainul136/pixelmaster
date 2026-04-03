<?php

namespace App\Modules\Tracking\Console;

use App\Models\Tracking\TrackingDestination;
use App\Modules\Tracking\Services\Channels\PinterestConversionService;
use App\Modules\Tracking\Traits\ThrottlesApiCalls;
use Illuminate\Console\Command;

/**
 * php artisan tracking:drain-pinterest-queue
 * Queue key: pinterest:queue:{adAccountId}
 * Scheduled every minute (Pinterest 120 req/min).
 */
class DrainPinterestQueueCommand extends Command
{
    use ThrottlesApiCalls;

    protected $signature   = 'tracking:drain-pinterest-queue {--limit=100 : Max events to drain per run}';
    protected $description = 'Drain buffered Pinterest Conversions API events queued due to rate limiting';

    public function handle(PinterestConversionService $pinterest): int
    {
        $limit = (int) $this->option('limit');
        $total = 0;

        $destinations = TrackingDestination::where('type', 'pinterest')
            ->where('is_active', true)
            ->get();

        foreach ($destinations as $dest) {
            $creds       = $dest->credentials ?? [];
            $adAccountId = $creds['ad_account_id'] ?? null;
            if (!$adAccountId) continue;

            $this->initThrottle('pinterest', $adAccountId, 100, 60);
            $depth = $this->queueDepth($adAccountId);
            if ($depth === 0) continue;

            $this->info("[Pinterest Drain] Account {$adAccountId}: {$depth} queued");

            $drained = 0;
            $batch   = [];

            while ($drained < $limit) {
                $items = $this->popDeferred($adAccountId, min(50, $limit - $drained));
                if (empty($items)) break;

                foreach ($items as $item) {
                    $batch[] = $item['event'];
                    $drained++;
                    if (count($batch) >= 50) {
                        $pinterest->sendEvents($batch, $creds);
                        $total += count($batch);
                        $batch = [];
                    }
                }
            }

            if (!empty($batch)) {
                $pinterest->sendEvents($batch, $creds);
                $total += count($batch);
            }

            $this->info("[Pinterest Drain] Sent {$drained} for account {$adAccountId}");
        }

        $this->info("[Pinterest Drain] Total: {$total}");
        return self::SUCCESS;
    }
}
