<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use App\Models\Tenant;
use Symfony\Component\HttpFoundation\Response;

class EnforceAdvancedQuota
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenantId = $request->attributes->get('tenant_id') ?: $request->header('X-Tenant-ID');

        if (!$tenantId) {
            return $next($request);
        }

        // 1. Identify Tenant Tier
        $tenant = Tenant::find($tenantId);
        if (!$tenant) return $next($request);

        $tier = $tenant->plan ?: 'free';
        
        // Load tier quotas from config
        $quotas = config("tenant_quotas.tiers.{$tier}") ?: config("tenant_quotas.tiers.starter");

        // 2. Global API Rate Limiting (RPM)
        $this->enforceRpm($tenantId, $quotas['api_rpm_limit'] ?? 60);

        // 3. Sensitive Action Quotas (Hard vs Soft Limits)
        $this->enforceUsageQuotas($request, $tenant, $quotas);

        return $next($request);
    }

    /**
     * Enforce Requests Per Minute
     */
    private function enforceRpm(string $tenantId, int $limit)
    {
        $key = 'tenant_rpm:' . $tenantId;

        if (RateLimiter::tooManyAttempts($key, $limit)) {
            abort(429, "Rate limit exceeded. Your plan ({$limit} RPM) limit has been reached.");
        }

        RateLimiter::hit($key, 60);
    }

    /**
     * Enforce usage-based quotas (e.g., API calls, AI tokens, Scraping)
     * Integrated with UsageQuotaService for persistent billing-period tracking.
     */
    private function enforceUsageQuotas(Request $request, Tenant $tenant, array $quotas)
    {
        $path = $request->path();
        $quotaService = app(\App\Services\UsageQuotaService::class);
        
        // Define which routes map to which quota keys and module slugs
        // Note: For persistent monthly quotas, we use module slugs.
        $quotaMap = [
            'scraper/'      => 'scraping',
            'ai/'           => 'ai_content', // Assuming module slug
            'whatsapp/send' => 'whatsapp',
        ];

        foreach ($quotaMap as $pattern => $moduleSlug) {
            if (str_contains($path, $pattern)) {
                // We use hardLock = true to throw Exception if quota exceeded
                // UsageQuotaService handles the configuration lookup and threshold alerts.
                try {
                    // count = 0 means we only CHECK the quota without incrementing yet.
                    // This allows the controller to do the actual increment after successful action.
                    if (!$quotaService->hasQuota($tenant->id, $moduleSlug)) {
                        abort(402, "Quota exceeded for {$moduleSlug}. Please upgrade your plan.");
                    }
                } catch (\Exception $e) {
                    abort(402, $e->getMessage());
                }
            }
        }
    }
}

