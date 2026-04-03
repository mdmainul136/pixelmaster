<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantUsageQuota extends Model
{
    protected $connection = 'central';

    protected $fillable = [
        'tenant_id',
        'module_slug',
        'quota_limit',
        'used_count',
        'overage_rate',
        'billing_period_start',
        'billing_period_end',
    ];

    protected $casts = [
        'quota_limit'          => 'integer',
        'used_count'           => 'integer',
        'overage_rate'         => 'decimal:2',
        'billing_period_start' => 'date',
        'billing_period_end'   => 'date',
    ];

    // ── Helpers ───────────────────────────────────────

    public function remainingQuota(): int
    {
        return max(0, $this->quota_limit - $this->used_count);
    }

    public function usagePercent(): float
    {
        return $this->quota_limit > 0
            ? round(($this->used_count / $this->quota_limit) * 100, 1)
            : 100;
    }

    public function isOverQuota(): bool
    {
        return $this->used_count >= $this->quota_limit;
    }

    public function isInCurrentPeriod(): bool
    {
        $now = now()->toDateString();
        return $now >= $this->billing_period_start && $now <= $this->billing_period_end;
    }
}
