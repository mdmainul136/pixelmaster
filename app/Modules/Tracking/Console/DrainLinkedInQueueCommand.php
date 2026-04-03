<?php

namespace App\Modules\Tracking\Console;

use App\Models\Tracking\TrackingDestination;
use App\Modules\Tracking\Services\Channels\LinkedInConversionService;
use App\Modules\Tracking\Traits\ThrottlesApiCalls;
use Illuminate\Console\Command;

/**
 * php artisan tracking:drain-linkedin-queue
 * Queue key: linkedin:queue:{adAccountId}
 * Scheduled every minute (LinkedIn 500 req/min).
 */
class DrainLinkedInQueueCommand extends Command
{
    use ThrottlesApiCalls;

    protected $signature   = 'tracking:drain-linkedin-queue {--limit=200 : Max events to drain per run}';
    protected $description = 'Drain buffered LinkedIn Conversions API events queued due to rate limiting';

    public function handle(LinkedInConversionService $linkedin): int
    {
        $limit = (int) $this->option('limit');
        $total = 0;

        $destinations = TrackingDestination::where('type', 'linkedin')
            ->where('is_active', true)
            ->get();

        foreach ($destinations as $dest) {
            $creds       = $dest->credentials ?? [];
            $adAccountId = $creds['ad_account_id'] ?? md5($creds['access_token'] ?? '');
            if (!$adAccountId) continue;

            $this->initThrottle('linkedin', $adAccountId, 450, 60);
            $depth = $this->queueDepth($adAccountId);
            if ($depth === 0) continue;

            $this->info("[LinkedIn Drain] Account {$adAccountId}: {$depth} queued");

            $drained = 0;
            $batch   = [];

            while ($drained < $limit) {
                $items = $this->popDeferred($adAccountId, min(100, $limit - $drained));
                if (empty($items)) break;

                foreach ($items as $item) {
                    $batch[] = $item['event'];
                    $drained++;
                    if (count($batch) >= 100) {
                        $linkedin->sendEvents($batch, $creds);
                        $total += count($batch);
                        $batch = [];
                    }
                }
            }

            if (!empty($batch)) {
                $linkedin->sendEvents($batch, $creds);
                $total += count($batch);
            }

            $this->info("[LinkedIn Drain] Sent {$drained} for account {$adAccountId}");
        }

        $this->info("[LinkedIn Drain] Total: {$total}");
        return self::SUCCESS;
    }
}
