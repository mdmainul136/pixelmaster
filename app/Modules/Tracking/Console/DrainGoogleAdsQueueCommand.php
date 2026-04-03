<?php

namespace App\Modules\Tracking\Console;

use App\Models\Tracking\TrackingDestination;
use App\Modules\Tracking\Services\Channels\GoogleAdsConversionService;
use App\Modules\Tracking\Traits\ThrottlesApiCalls;
use Illuminate\Console\Command;

/**
 * php artisan tracking:drain-gads-queue
 * Queue key: gads:queue:{customerId}
 * Scheduled every hour (Google Ads quota is daily — hourly drain is sufficient).
 */
class DrainGoogleAdsQueueCommand extends Command
{
    use ThrottlesApiCalls;

    protected $signature   = 'tracking:drain-gads-queue {--limit=200 : Max conversions to drain per run}';
    protected $description = 'Drain buffered Google Ads Conversion upload events queued due to daily quota';

    public function handle(GoogleAdsConversionService $gads): int
    {
        $limit = (int) $this->option('limit');
        $total = 0;

        $destinations = TrackingDestination::where('type', 'google_ads')
            ->where('is_active', true)
            ->get();

        foreach ($destinations as $dest) {
            $creds      = $dest->credentials ?? [];
            $customerId = str_replace('-', '', $creds['customer_id'] ?? '');
            if (!$customerId) continue;

            $this->initThrottle('gads', $customerId, 4500, 86400);
            $depth = $this->queueDepth($customerId);
            if ($depth === 0) continue;

            $this->info("[GAds Drain] Customer {$customerId}: {$depth} queued");

            $drained = 0;
            $batch   = [];

            while ($drained < $limit) {
                $items = $this->popDeferred($customerId, min(100, $limit - $drained));
                if (empty($items)) break;

                foreach ($items as $item) {
                    $batch[] = $item['event'];
                    $drained++;
                    if (count($batch) >= 100) {
                        $gads->sendEvents($batch, $creds);
                        $total += count($batch);
                        $batch = [];
                    }
                }
            }

            if (!empty($batch)) {
                $gads->sendEvents($batch, $creds);
                $total += count($batch);
            }

            $this->info("[GAds Drain] Sent {$drained} for customer {$customerId}");
        }

        $this->info("[GAds Drain] Total: {$total}");
        return self::SUCCESS;
    }
}
