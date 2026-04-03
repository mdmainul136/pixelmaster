<?php

namespace App\Tenancy;

use Stancl\Tenancy\Contracts\TenancyBootstrapper;
use Stancl\Tenancy\Contracts\Tenant;
use Illuminate\Support\Facades\Cache;

class CacheIsolationBootstrapper implements TenancyBootstrapper
{
    protected $originalConfig = [];

    public function bootstrap(Tenant $tenant)
    {
        $this->originalConfig = [
            'prefix' => config('cache.prefix'),
            'path' => config('cache.stores.file.path'),
        ];

        $tenantId = $tenant->getTenantKey();

        config([
            'cache.prefix' => 'tenant_' . $tenantId,
            'cache.stores.file.path' => storage_path('framework/cache/data'),
        ]);

        Cache::purge(config('cache.default'));
    }

    public function revert()
    {
        config([
            'cache.prefix' => $this->originalConfig['prefix'],
            'cache.stores.file.path' => $this->originalConfig['path'],
        ]);

        Cache::purge(config('cache.default'));
    }
}
