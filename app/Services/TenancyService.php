<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Stancl\Tenancy\Database\DatabaseManager;

class TenancyService
{
    public function __construct(
        protected DatabaseManager $dbManager
    ) {}

    // ─── Tenant Creation ──────────────────────────────────────────────────────

    /**
     * Create a new tenant with subdomain + optional custom domain
     *
     * @param  array{
     *   name: string,
     *   email: string,
     *   plan: string,
     *   subdomain: string,
     *   custom_domain: string|null
     * } $data
     */
    public function createTenant(array $data): Tenant
    {
        // Validate plan
        if (!isset(Tenant::$plans[$data['plan']])) {
            throw new \InvalidArgumentException("Invalid plan: {$data['plan']}");
        }

        $plan       = Tenant::$plans[$data['plan']];
        $tenantId   = Str::slug($data['subdomain']);   // "acme-corp"

        // Create tenant record
        $tenant = Tenant::create([
            'id'          => $tenantId,
            'plan'        => $data['plan'],
            'db_limit_gb' => $plan['db_limit_gb'],
            'status'      => 'active',
            'database_name' => "tenant_{$tenantId}",  // Standardized naming
        ]);

        // Attach subdomain  →  acme-corp.yoursaas.com
        $centralDomain = config('tenancy.central_domains')[0] ?? 'localhost';
        $tenant->domains()->create([
            'domain' => "{$data['subdomain']}.{$centralDomain}",
            'is_verified' => true,
            'status' => 'verified',
            'is_primary' => true,
        ]);

        // Attach custom domain if provided  →  acme.com
        if (!empty($data['custom_domain'])) {
            if (!$tenant->hasCapability('custom_domain')) {
                Log::warning("Tenant tried to add custom domain on Starter plan", ['tenant' => $tenantId]);
                // We let it pass or throw? Usually, for creation, we might want to throw or just ignore.
                // The user said "add korte parbe na", so let's throw.
                throw new \RuntimeException("Custom domains are not allowed on the Starter plan.");
            }
            $tenant->domains()->create([
                'domain' => $data['custom_domain'],
            ]);
        }

        // Create & migrate tenant DB
        $tenant->run(function () {
            \Illuminate\Support\Facades\Artisan::call('migrate', [
                '--path' => 'database/migrations/tenant',
                '--force' => true,
            ]);
        });

        Log::info("Tenant created via TenancyService", ['id' => $tenantId, 'plan' => $data['plan']]);

        return $tenant->fresh(['domains']);
    }

    // ─── Domain Management ────────────────────────────────────────────────────

    /**
     * Add custom domain to existing tenant
     */
    public function addCustomDomain(Tenant $tenant, string $domain): void
    {
        // Check compatibility
        if (!$tenant->hasCapability('custom_domain')) {
            throw new \RuntimeException("Upgrade your plan to Growth or Pro to add a custom domain.");
        }

        $tenant->domains()->create(['domain' => $domain]);
        Log::info("Custom domain added", ['tenant' => $tenant->id, 'domain' => $domain]);
    }

    /**
     * Remove custom domain
     */
    public function removeCustomDomain(Tenant $tenant, string $domain): void
    {
        // Never remove the subdomain
        $subdomain = $tenant->id . '.' . (config('tenancy.central_domains')[0] ?? 'localhost');
        if ($domain === $subdomain) {
            throw new \RuntimeException("Cannot remove primary subdomain.");
        }

        $tenant->domains()->where('domain', $domain)->delete();
    }

    // ─── Quota & Upgrade ──────────────────────────────────────────────────────

    /**
     * Upgrade tenant plan (5GB → 10GB → 50GB)
     */
    public function upgradePlan(Tenant $tenant, string $newPlan): array
    {
        $oldPlan = $tenant->plan;
        $oldGb   = $tenant->dbLimitGb();

        $tenant->upgradePlan($newPlan);

        $newGb = $tenant->fresh()->dbLimitGb();

        Log::info("Tenant plan upgraded", [
            'tenant'   => $tenant->id,
            'from'     => $oldPlan,
            'to'       => $newPlan,
            'old_gb'   => $oldGb,
            'new_gb'   => $newGb,
        ]);

        return [
            'old_plan'     => $oldPlan,
            'new_plan'     => $newPlan,
            'old_limit_gb' => $oldGb,
            'new_limit_gb' => $newGb,
        ];
    }

    /**
     * Set completely custom quota (admin override)
     */
    public function setCustomQuota(Tenant $tenant, float $gb): void
    {
        if ($gb < 0.1) {
            throw new \InvalidArgumentException("Minimum quota is 0.1 GB");
        }
        $tenant->setCustomQuota($gb);
        Log::info("Custom quota set", ['tenant' => $tenant->id, 'gb' => $gb]);
    }

    // ─── Stats & Monitoring ───────────────────────────────────────────────────

    /**
     * Full stats for a single tenant
     */
    public function getTenantStats(Tenant $tenant): array
    {
        $stats = null;
        $tables = [];

        try {
            $tenant->run(function () use (&$stats, &$tables) {
                $stats = DB::selectOne("
                    SELECT
                        COUNT(*)                                                               AS total_tables,
                        COALESCE(ROUND(SUM(data_length+index_length)/1024/1024/1024,4),0)     AS size_gb,
                        COALESCE(ROUND(SUM(data_length+index_length)/1024/1024,2),0)          AS size_mb,
                        COALESCE(ROUND(SUM(data_length)/1024/1024,2),0)                       AS data_mb,
                        COALESCE(ROUND(SUM(index_length)/1024/1024,2),0)                      AS index_mb,
                        COALESCE(SUM(table_rows),0)                                           AS total_rows
                    FROM information_schema.tables
                    WHERE table_schema = DATABASE()
                ");

                $tables = DB::select("
                    SELECT
                        table_name,
                        COALESCE(table_rows,0)                                                AS row_count,
                        ROUND((data_length+index_length)/1024/1024,2)                         AS size_mb,
                        ROUND(data_length/1024/1024,2)                                        AS data_mb,
                        ROUND(index_length/1024/1024,2)                                       AS index_mb,
                        engine,
                        create_time,
                        update_time
                    FROM information_schema.tables
                    WHERE table_schema = DATABASE()
                    ORDER BY (data_length+index_length) DESC
                ");
            });
        } catch (\Throwable $e) {
            return [
                'id'       => $tenant->id,
                'status'   => 'error',
                'error'    => $e->getMessage(),
                'db_stats' => null,
                'tables'   => [],
                'quota'    => $this->quotaInfo($tenant, 0),
            ];
        }

        $usedGb = (float) ($stats->size_gb ?? 0);

        return [
            'id'       => $tenant->id,
            'domains'  => $tenant->domains->pluck('domain'),
            'plan'     => $tenant->plan,
            'status'   => $tenant->status ?? 'active',
            'db_stats' => [
                'size_gb'      => $usedGb,
                'size_mb'      => (float) ($stats->size_mb ?? 0),
                'data_mb'      => (float) ($stats->data_mb ?? 0),
                'index_mb'     => (float) ($stats->index_mb ?? 0),
                'total_tables' => (int)   ($stats->total_tables ?? 0),
                'total_rows'   => (int)   ($stats->total_rows ?? 0),
            ],
            'quota'    => $this->quotaInfo($tenant, $usedGb),
            'tables'   => $tables,
        ];
    }

    /**
     * Build quota info block
     */
    public function quotaInfo(Tenant $tenant, float $usedGb): array
    {
        $limitGb    = $tenant->dbLimitGb();
        $usedPct    = $limitGb > 0 ? round(($usedGb / $limitGb) * 100, 2) : 0;
        $remainGb   = max(0, $limitGb - $usedGb);

        return [
            'limit_gb'       => $limitGb,
            'used_gb'        => round($usedGb, 4),
            'remaining_gb'   => round($remainGb, 4),
            'used_percent'   => $usedPct,
            'is_near_quota'  => $usedPct >= 80,
            'is_over_quota'  => $usedGb >= $limitGb,
            'alert_level'    => match(true) {
                $usedPct >= 100 => 'critical',
                $usedPct >= 90  => 'danger',
                $usedPct >= 80  => 'warning',
                default         => 'ok',
            },
        ];
    }

    /**
     * Stats for ALL tenants (admin overview)
     */
    public function getAllTenantsStats(): array
    {
        $tenants = Tenant::with('domains')->get();
        $results = [];

        foreach ($tenants as $tenant) {
            $results[] = $this->getTenantStats($tenant);
        }

        $totalGb    = collect($results)->sum(fn($t) => $t['db_stats']['size_gb'] ?? 0);
        $totalRows  = collect($results)->sum(fn($t) => $t['db_stats']['total_rows'] ?? 0);
        $overQuota  = collect($results)->filter(fn($t) => $t['quota']['is_over_quota'] ?? false)->count();

        return [
            'summary' => [
                'total_tenants'  => $tenants->count(),
                'active_tenants' => $tenants->where('status', 'active')->count(),
                'total_size_gb'  => round($totalGb, 4),
                'total_rows'     => $totalRows,
                'over_quota'     => $overQuota,
            ],
            'tenants' => $results,
        ];
    }

    // ─── Suspension ───────────────────────────────────────────────────────────

    public function suspend(Tenant $tenant, string $reason = ''): void
    {
        $tenant->update(['status' => 'suspended']);
        Log::warning("Tenant suspended", ['id' => $tenant->id, 'reason' => $reason]);
    }

    public function activate(Tenant $tenant): void
    {
        $tenant->update(['status' => 'active']);
        Log::info("Tenant activated", ['id' => $tenant->id]);
    }
}
