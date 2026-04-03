<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\UsageQuotaService;
use App\Models\Tenant;
use App\Models\TenantUsageQuota;
use App\Events\QuotaThresholdReached;
use App\Exceptions\QuotaExceededException;
use Illuminate\Support\Facades\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UsageQuotaTest extends TestCase
{
    use RefreshDatabase;

    public function test_quota_hard_lock_throws_exception()
    {
        Event::fake();
        $quotaService = app(UsageQuotaService::class);
        $tenantId = 'test-tenant';
        
        // Setup initial quota at 100%
        $quota = TenantUsageQuota::create([
            'tenant_id' => $tenantId,
            'module_slug' => 'tracking',
            'quota_limit' => 10,
            'used_count' => 10,
            'billing_period_start' => now()->startOfMonth(),
            'billing_period_end' => now()->endOfMonth(),
        ]);

        $this->expectException(QuotaExceededException::class);
        
        $quotaService->incrementUsage($tenantId, 1, 'tracking', true);
    }

    public function test_quota_threshold_triggers_event()
    {
        Event::fake();
        $quotaService = app(UsageQuotaService::class);
        $tenantId = 'test-tenant';
        
        TenantUsageQuota::create([
            'tenant_id' => $tenantId,
            'module_slug' => 'tracking',
            'quota_limit' => 100,
            'used_count' => 79,
            'billing_period_start' => now()->startOfMonth(),
            'billing_period_end' => now()->endOfMonth(),
        ]);

        $quotaService->incrementUsage($tenantId, 1, 'tracking');

        Event::assertDispatched(QuotaThresholdReached::class, function ($event) {
            return $event->threshold === 80;
        });
    }
}
