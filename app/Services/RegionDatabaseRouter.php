<?php

namespace App\Services;

/**
 * RegionDatabaseRouter
 *
 * Routes tenants to the correct regional database server based on their country.
 * In production each region points to a separate MySQL server/cluster.
 * 
 * Integration with stancl/tenancy:
 *   - getConnectionName($country) returns the Laravel DB connection name
 *   - This is stored as `tenancy_db_connection` on the Tenant model
 *   - Stancl clones that connection's config and swaps the `database` name
 * 
 * Usage:
 *   $router = app(RegionDatabaseRouter::class);
 *   $connectionName = $router->getConnectionName('Bangladesh');
 *   // Returns: 'tenant_bd_dhaka' (maps to config/database.php connection)
 */
class RegionDatabaseRouter
{
    /**
     * Region ID → Laravel DB connection name mapping.
     * Must match connection keys in config/database.php.
     */
    protected array $connectionMap = [
        'us_east'     => 'tenant_us_east',
        'eu_west'     => 'tenant_eu_west',
        'ap_south'    => 'tenant_ap_south',
        'south_asia'  => 'tenant_bd_dhaka',
        'global'      => 'mysql',  // Default template
    ];

    /**
     * Resolve country to region ID.
     */
    public function getRegion(string $country): string
    {
        $map = config('tenant.country_region_map', []);

        return $map[$country] ?? 'global';
    }

    /**
     * Get the Laravel DB connection name for a given country.
     * This value is stored as `tenancy_db_connection` on the Tenant model,
     * which stancl reads to determine the template connection for creating
     * and connecting to the tenant's database.
     */
    public function getConnectionName(string $country): string
    {
        $region = $this->getRegion($country);

        return $this->connectionMap[$region] ?? $this->connectionMap['global'];
    }

    /**
     * Get the full database server config for a given country.
     *
     * @return array{region: string, host: string, port: string, username: string, password: string}
     */
    public function getServerConfig(string $country): array
    {
        $region = $this->getRegion($country);
        $servers = config('tenant.region_servers', []);

        $server = $servers[$region] ?? $servers['global'] ?? [
            'host' => config('tenant.database.host'),
            'port' => config('tenant.database.port'),
            'username' => config('tenant.database.username'),
            'password' => config('tenant.database.password'),
        ];

        return array_merge($server, ['region' => $region]);
    }

    /**
     * Get all available regions and their configs.
     *
     * @return array<string, array>
     */
    public function getAllRegions(): array
    {
        return config('tenant.region_servers', []);
    }

    /**
     * Get all countries mapped to a specific region.
     */
    public function getCountriesForRegion(string $region): array
    {
        $map = config('tenant.country_region_map', []);

        return array_keys(array_filter($map, fn($r) => $r === $region));
    }

    /**
     * Get summary of tenants per region.
     */
    public function getRegionStats(): array
    {
        $stats = [];
        $regions = array_keys(config('tenant.region_servers', []));

        foreach ($regions as $region) {
            $countries = $this->getCountriesForRegion($region);
            $tenantCount = \App\Models\Tenant::whereIn('country', $countries)->count();

            $stats[$region] = [
                'countries' => $countries,
                'tenant_count' => $tenantCount,
                'server' => config("tenant.region_servers.{$region}"),
            ];
        }

        return $stats;
    }
}

