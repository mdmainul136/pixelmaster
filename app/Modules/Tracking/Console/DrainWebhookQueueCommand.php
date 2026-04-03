<?php

namespace App\Modules\Tracking\Console;

use App\Models\Tracking\TrackingDestination;
use App\Modules\Tracking\Services\Channels\WebhookForwardingService;
use App\Modules\Tracking\Traits\ThrottlesApiCalls;
use Illuminate\Console\Command;

/**
 * php artisan tracking:drain-webhook-queue
 * Queue key: webhook:queue:{base64Url}
 */
class DrainWebhookQueueCommand extends Command
{
    use ThrottlesApiCalls;

    protected $signature   = 'tracking:drain-webhook-queue {--limit=500 : Max events to drain per run}';
    protected $description = 'Drain buffered generic Webhook events queued due to rate limiting';

    public function handle(WebhookForwardingService $webhook): int
    {
        $limit = (int) $this->option('limit');
        $total = 0;

        $destinations = TrackingDestination::where('type', 'webhook')
            ->where('is_active', true)
            ->get();

        foreach ($destinations as $dest) {
            $creds = $dest->credentials ?? [];
            $url   = $creds['url'] ?? null;
            if (!$url) continue;

            $identity = base64_encode($url);
            $this->initThrottle('webhook', $url, 20, 1);
            
            $depth = $this->queueDepth($identity);
            if ($depth === 0) continue;

            $this->info("[Webhook Drain] URL {$url}: {$depth} queued");

            $drained = 0;
            while ($drained < $limit) {
                $items = $this->popDeferred($identity, min(50, $limit - $drained));
                if (empty($items)) break;

                $batch = array_column($items, 'event');
                $webhook->sendEvents($batch, $creds);
                
                $drained += count($batch);
                $total   += count($batch);
            }

            $this->info("[Webhook Drain] Sent {$drained} for URL {$url}");
        }

        $this->info("[Webhook Drain] Total: {$total}");
        return self::SUCCESS;
    }
}
