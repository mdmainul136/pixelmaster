<?php

namespace App\Console\Commands\Tracking;

use Illuminate\Console\Command;
use App\Models\Tracking\TrackingEventLog;
use Illuminate\Support\Facades\Log;

class PruneDebugLogs extends Command
{
    /**
     * The name and signature of the console command.
     * @var string
     */
    protected $signature = 'tracking:prune-debug-logs';

    /**
     * The console command description.
     * @var string
     */
    protected $description = 'Prune sGTM tracking event logs older than 24 hours to maintain database performance.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting tracking log pruning (24h retention)...');

        $count = TrackingEventLog::where('processed_at', '<', now()->subHours(24))->delete();

        if ($count > 0) {
            $this->warn("Successfully pruned {$count} expired tracking logs.");
            Log::info("Pruned {$count} tracking logs (24h retention policy).");
        } else {
            $this->info("No expired logs found for pruning.");
        }

        $this->info('Log pruning complete.');
    }
}
