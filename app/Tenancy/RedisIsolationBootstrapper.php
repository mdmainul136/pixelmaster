<?php

namespace App\Tenancy;

use Stancl\Tenancy\Contracts\TenancyBootstrapper;
use Stancl\Tenancy\Contracts\Tenant;
use Illuminate\Support\Facades\Redis;

class RedisIsolationBootstrapper implements TenancyBootstrapper
{
    protected $originalConfig = [];

    public function bootstrap(Tenant $tenant)
    {
        $this->originalConfig = [
            'prefix' => config('database.redis.options.prefix'),
        ];

        $tenantId = $tenant->getTenantKey();
        $prefix = config('tenancy.redis.prefix_base', 'tenant') . $tenantId . ':';

        config([
            'database.redis.options.prefix' => $prefix,
        ]);

        // Purge all redis connections to force re-connection with new prefix
        foreach (config('database.redis', []) as $name => $connection) {
            if (is_array($connection)) {
                try {
                    Redis::purge($name);
                } catch (\Exception $e) {
                    // Ignore if connection doesn't exist
                }
            }
        }
    }

    public function revert()
    {
        config([
            'database.redis.options.prefix' => $this->originalConfig['prefix'],
        ]);

        foreach (config('database.redis', []) as $name => $connection) {
            if (is_array($connection)) {
                try {
                    Redis::purge($name);
                } catch (\Exception $e) {
                    // Ignore
                }
            }
        }
    }
}
