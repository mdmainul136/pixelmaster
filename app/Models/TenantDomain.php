<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Stancl\Tenancy\Database\Models\Domain as BaseDomain;

class TenantDomain extends BaseDomain
{
    use HasFactory;

    protected $table = 'tenant_domains';

    protected $connection = 'central';

    protected $fillable = [
        'tenant_id',
        'domain',
        'is_primary',
        'is_verified',
        'verification_token',
        'status',
        'purpose',  // website | tracking | api | storefront
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'is_verified' => 'boolean',
    ];

    // ── Scopes ──────────────────────────────────────

    public function scopeTracking($query)
    {
        return $query->where('purpose', 'tracking');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeCustom($query, string $saasBaseDomain)
    {
        return $query->where('domain', 'not like', "%.{$saasBaseDomain}");
    }

    // ── Helpers ─────────────────────────────────────

    /**
     * Get the verified tracking domain for a tenant.
     */
    public static function getTrackingDomain(string $tenantId): ?string
    {
        return static::where('tenant_id', $tenantId)
            ->tracking()
            ->verified()
            ->value('domain');
    }

    /**
     * Get all custom (non-SaaS) verified domains for a tenant.
     */
    public static function getCustomDomains(string $tenantId, ?string $saasBaseDomain = null): array
    {
        $saasBaseDomain = $saasBaseDomain ?? config('tenancy.central_domains.0');
        
        return static::where('tenant_id', $tenantId)
            ->verified()
            ->where('purpose', 'website')
            ->where('domain', 'not like', "%.{$saasBaseDomain}")
            ->pluck('domain')
            ->toArray();
    }

    // ── Relationships ───────────────────────────────

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }
}
