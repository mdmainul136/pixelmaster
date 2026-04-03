<?php

namespace App\Events;

use App\Models\TenantUsageQuota;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class QuotaThresholdReached
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $quota;
    public $threshold; // e.g., 80, 100

    public function __construct(TenantUsageQuota $quota, int $threshold)
    {
        $this->quota = $quota;
        $this->threshold = $threshold;
    }
}
