<?php

use App\Services\FeatureFlagService;

if (!function_exists('feature')) {
    /**
     * Check if a feature is enabled for the current tenant.
     *
     * @param string $feature
     * @param string|null $tenantId
     * @return bool
     */
    function feature(string $feature, ?string $tenantId = null): bool
    {
        return app(FeatureFlagService::class)->isEnabled($feature, $tenantId);
    }
}
