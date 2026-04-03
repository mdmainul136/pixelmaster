<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

use Illuminate\Support\Str;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasFactory, HasDatabase, HasDomains;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';
    public const STATUS_SUSPENDED = 'suspended';
    public const STATUS_BILLING_FAILED = 'billing_failed';
    public const STATUS_TERMINATED = 'terminated';
    public const STATUS_PENDING_PAYMENT = 'pending_payment';
    
    // â”€â”€â”€ Plan Definitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // 5-Tier Architecture: Free â†’ Pro â†’ Business â†’ Enterprise â†’ Custom
    public static array $plans = [
        'free'       => ['db_limit_gb' => 2,   'price' => 0,    'staff_limit' => 1,   'monthly_event_limit' => 10_000],
        'pro'        => ['db_limit_gb' => 10,  'price' => 17,   'staff_limit' => 5,   'monthly_event_limit' => 500_000],
        'business'   => ['db_limit_gb' => 50,  'price' => 83,   'staff_limit' => 20,  'monthly_event_limit' => 5_000_000],
        'enterprise' => ['db_limit_gb' => 200, 'price' => 0,    'staff_limit' => -1,  'monthly_event_limit' => 50_000_000],
        'custom'     => ['db_limit_gb' => -1,  'price' => 0,    'staff_limit' => -1,  'monthly_event_limit' => -1],
        // Legacy aliases (backward compat)
        'starter'    => ['db_limit_gb' => 2,   'price' => 0,    'staff_limit' => 1,   'monthly_event_limit' => 10_000],
        'growth'     => ['db_limit_gb' => 10,  'price' => 49,   'staff_limit' => 3,   'monthly_event_limit' => 100_000],
    ];

    /**
     * 5-Tier hierarchy â€” lower index = cheaper plan.
     * Used to determine which plan is needed to unlock a feature.
     */
    public const PLAN_HIERARCHY = ['free', 'pro', 'business', 'enterprise', 'custom'];

    protected $connection = 'central';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'tenant_name',
        'company_name',
        'business_type',
        'business_category',
        'admin_name',
        'database_name',
        'db_host',
        'db_port',
        'db_region',
        'admin_email',
        'phone',
        'address',
        'city',
        'country',
        'cr_number',
        'vat_number',
        'domain',
        'status',
        'provisioning_status',
        'database_plan_id',
        'api_key',
        'global_account_secret',
        'logo_url',
        'favicon_url',
        'primary_color',
        'secondary_color',
        'facebook_url',
        'instagram_url',
        'twitter_url',
        'linkedin_url',
        'localizations',
        'onboarded_at',
        'plan',
        'db_limit_gb',
        'trial_ends_at',
        'timezone',
        'date_format',
        'measurement_unit',
        'data',
        // Stripe Billing
        'stripe_customer_id',
        'stripe_subscription_id',
        'stripe_price_id',
        'stripe_subscription_status',
        'stripe_overage_item_id',
        'billing_required',
    ];

    protected $hidden = [
        'db_password_encrypted',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'db_password_encrypted' => 'encrypted',
            'localizations' => 'array',
            'onboarded_at' => 'datetime',
            'trial_ends_at' => 'datetime',
            'db_limit_gb' => 'float',
            'data' => 'array',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public static function generateDatabaseName(string $tenantId): string
    {
        $prefix = config('tenant.database_prefix', 'tenant_');
        return $prefix . $tenantId;
    }


    /**
     * The database plan assigned to this tenant
     */
    public function databasePlan()
    {
        return $this->belongsTo(TenantDatabasePlan::class, 'database_plan_id');
    }

    /**
     * The active subscription for this tenant
     */
    public function subscription()
    {
        return $this->hasOne(TenantSubscription::class, 'tenant_id', 'id');
    }

    /**
     * Relationship: Subscribed modules for this tenant.
     */
    public function tenantModules()
    {
        return $this->hasMany(TenantModule::class);
    }

    /**
     * Relationship: Memberships (Pivot entries in central DB)
     */
    public function memberships()
    {
        return $this->hasMany(TenantMembership::class, 'tenant_id', 'id');
    }

    /**
     * Relationship: Team members (Users via memberships)
     */
    public function members()
    {
        return $this->belongsToMany(User::class, 'tenant_memberships', 'tenant_id', 'user_id')
            ->withPivot(['role', 'status', 'invited_at', 'accepted_at'])
            ->withTimestamps();
    }

    /**
     * Relationship: Modules owned by this tenant (via TenantModule pivot).
     */
    public function modules()
    {
        return $this->belongsToMany(Module::class, 'tenant_modules', 'tenant_id', 'module_id')
            ->withPivot(['status', 'subscribed_at', 'expires_at'])
            ->withTimestamps();
    }

    /**
     * Historical database statistics
     */
    public function databaseStats()
    {
        return $this->hasMany(TenantDatabaseStat::class);
    }

    /**
     * The most recent database statistics snapshot
     */
    public function latestDatabaseStat()
    {
        return $this->hasOne(TenantDatabaseStat::class)->latestOfMany('recorded_at');
    }

    // â”€â”€â”€ DB Quota Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * Current DB usage in GB (live from information_schema)
     */
    public function currentDbUsageGb(): float
    {
        return $this->run(function () {
            try {
                $row = \Illuminate\Support\Facades\DB::selectOne("
                    SELECT COALESCE(
                        ROUND(SUM(data_length + index_length) / 1024 / 1024 / 1024, 4), 0
                    ) AS size_gb
                    FROM information_schema.tables
                    WHERE table_schema = DATABASE()
                ");
                return (float) ($row->size_gb ?? 0);
            } catch (\Exception $e) {
                \Log::error("Failed to calculate DB usage for tenant {$this->id}: " . $e->getMessage());
                return 0.0;
            }
        });
    }

    /**
     * Quota limit in GB (from tenant data)
     */
    public function dbLimitGb(): float
    {
        return (float) ($this->db_limit_gb ?? $this->getQuota('storage_gb') ?? 2.0);
    }

    /**
     * Usage percentage
     */
    public function dbUsagePercent(): float
    {
        $limit = $this->dbLimitGb();
        if ($limit <= 0) return 0;
        return round(($this->currentDbUsageGb() / $limit) * 100, 2);
    }

    /**
     * Is tenant near/over quota?
     */
    public function isNearQuota(float $threshold = 80.0): bool
    {
        return $this->dbUsagePercent() >= $threshold;
    }

    public function isOverQuota(): bool
    {
        return $this->currentDbUsageGb() >= $this->dbLimitGb();
    }

    /**
     * Check if the tenant currently has an active trial
     */
    public function isTrialActive(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    /**
     * Check if the tenant can access the dashboard
     */
    public function canAccessDashboard(): bool
    {
        return $this->status === self::STATUS_ACTIVE || $this->isTrialActive();
    }

    /**
     * Upgrade plan â†’ update db_limit_gb
     */
    public function upgradePlan(string $plan): void
    {
        $planModel = \App\Models\SubscriptionPlan::where('plan_key', $plan)->first();
        
        if (!$planModel) {
            // Fallback to static mapping if database plan is missing during testing
            if (!isset(static::$plans[$plan])) {
                throw new \InvalidArgumentException("Unknown plan: {$plan}");
            }
            $storageLimit = static::$plans[$plan]['db_limit_gb'];
        } else {
            $storageLimit = $planModel->quotas['storage_gb'] ?? 2;
        }

        $updateData = [
            'plan'        => $plan,
            'db_limit_gb' => $storageLimit,
        ];

        // Auto-activate if pending payment or billing failed
        if (in_array($this->status, [self::STATUS_PENDING_PAYMENT, self::STATUS_BILLING_FAILED])) {
            $updateData['status'] = self::STATUS_ACTIVE;
        }

        $this->update($updateData);

        // Sync with TenantSubscription record
        $planModel = \App\Models\SubscriptionPlan::where('plan_key', $plan)->first();
        if ($planModel) {
            \App\Models\TenantSubscription::updateOrCreate(
                ['tenant_id' => $this->id],
                [
                    'subscription_plan_id' => $planModel->id,
                    'status' => ($this->status === self::STATUS_ACTIVE) ? 'active' : 'past_due',
                    'billing_cycle' => 'monthly',
                    'renews_at' => now()->addMonth(),
                    'auto_renew' => true,
                ]
            );
        }
    }

    /**
     * Manually set custom quota (enterprise override)
     */
    public function setCustomQuota(float $gb): void
    {
        $this->update(['db_limit_gb' => $gb]);
    }

    /**
     * Check if this tenant's plan includes a specific feature key.
     *
     * Uses the `features` array on SubscriptionPlan (raw key list).
     * Falls back to config/plans.php if the DB record is unavailable.
     *
     * @param  string  $featureKey  e.g. 'logs', 'cookie_keeper', 'monitoring'
     */
    public function hasFeature(string $featureKey): bool
    {
        $planKey = $this->plan ?: 'free';

        try {
            $planModel = \App\Models\SubscriptionPlan::where('plan_key', $planKey)->first();
            if ($planModel) {
                return in_array($featureKey, $planModel->features ?? [], true);
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("hasFeature('{$featureKey}') DB lookup failed for tenant {$this->id}: " . $e->getMessage());
        }

        // Fallback: config/plans.php
        return in_array($featureKey, config("plans.{$planKey}.features", []), true);
    }

    /**
     * Returns the lowest plan tier that unlocks this feature.
     * Returns null if the feature does not exist in any plan.
     */
    public function requiredPlanFor(string $featureKey): ?string
    {
        foreach (self::PLAN_HIERARCHY as $tier) {
            $features = config("plans.{$tier}.features", []);
            if (in_array($featureKey, $features, true)) {
                return $tier;
            }
        }
        return null;
    }

    /**
     * @deprecated  Use hasFeature() instead.
     * Kept for backward compatibility with older code that calls hasCapability().
     */
    public function hasCapability(string $feature): bool
    {
        return $this->hasFeature($feature);
    }

    /**
     * Get a specific quota/limit for the tenant's current plan.
     * Keys: events, log_retention, multi_domains, storage_gb, max_users, max_containers
     */
    public function getQuota(string $key): mixed
    {
        $planKey = $this->plan ?: 'free';

        try {
            $planModel = \App\Models\SubscriptionPlan::where('plan_key', $planKey)->first();
            if ($planModel && isset($planModel->quotas[$key])) {
                return $planModel->quotas[$key];
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("getQuota('{$key}') failed for tenant {$this->id}: " . $e->getMessage());
        }

        // Fallback: static plan map
        return static::$plans[$planKey][$key] ?? match($key) {
            'events'          => 10_000,
            'log_retention'   => 0,
            'multi_domains'   => 1,
            'storage_gb'      => 2,
            'max_users'       => 1,
            'max_containers'  => 1,
            default           => null,
        };
    }

    protected static function booted()
    {
        static::creating(function ($tenant) {
            \Illuminate\Support\Facades\Log::info("MODEL: Creating Tenant - ID: [{$tenant->id}] (type: " . gettype($tenant->id) . ") DB: [{$tenant->database_name}]");
            
            if (empty($tenant->api_key)) {
                $tenant->api_key = 'pxl_' . Str::random(40);
            }

            if (empty($tenant->global_account_secret)) {
                $tenant->global_account_secret = Str::random(32);
            }

            // Auto-calculate DB limit if not set
            if (!$tenant->db_limit_gb) {
                $planModel = \App\Models\SubscriptionPlan::where('plan_key', $tenant->plan ?: 'free')->first();
                $tenant->db_limit_gb = $planModel->quotas['storage_gb'] ?? (static::$plans[$tenant->plan]['db_limit_gb'] ?? 2.0);
            }
        });

        static::created(function ($tenant) {
            // Create initial TenantSubscription record
            try {
                $planModel = \App\Models\SubscriptionPlan::where('plan_key', $tenant->plan ?: 'free')->first();
                if ($planModel) {
                    \App\Models\TenantSubscription::create([
                        'tenant_id' => $tenant->id,
                        'subscription_plan_id' => $planModel->id,
                        'status' => ($tenant->status === self::STATUS_ACTIVE) ? 'active' : 'past_due',
                        'billing_cycle' => 'monthly',
                        'renews_at' => now()->addMonth(),
                        'auto_renew' => true,
                    ]);
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to create initial subscription record for tenant {$tenant->id}: " . $e->getMessage());
            }
        });

        static::saving(function ($tenant) {
            \Illuminate\Support\Facades\Log::info("MODEL: Saving Tenant - ID: [{$tenant->id}] (type: " . gettype($tenant->id) . ") DB: [{$tenant->database_name}]");
        });

        static::updated(function ($tenant) {
            // Sync Subscription Record on Plan or Status Change
            if ($tenant->isDirty(['plan', 'status'])) {
                try {
                    $planModel = \App\Models\SubscriptionPlan::where('plan_key', $tenant->plan)->first();
                    if ($planModel) {
                        \App\Models\TenantSubscription::updateOrCreate(
                            ['tenant_id' => $tenant->id],
                            [
                                'subscription_plan_id' => $planModel->id,
                                'status' => ($tenant->status === self::STATUS_ACTIVE) ? 'active' : 'past_due',
                                'billing_cycle' => 'monthly', // Default or from existing if present
                                'renews_at' => now()->addMonth(), // Default or from existing if present
                                'auto_renew' => true,
                            ]
                        );
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Failed to sync subscription record for tenant {$tenant->id}: " . $e->getMessage());
                }
            }
        });
    }

    /**
     * Stancl/Tenancy uses 'id' by default. We removed the 'tenant_id' override.
     */
    public function getTenantKeyName(): string
    {
        return 'id';
    }

    public function getIncrementing()
    {
        return false;
    }

    public function getKeyType()
    {
        return 'string';
    }

    public function getInternalKeys(): array
    {
        return array_merge(parent::getInternalKeys(), [
            'db_host', 'db_port', 'database_name', 'db_username', 'db_password_encrypted'
        ]);
    }

    public function getAttribute($key)
    {
        if ($key === 'host') return $this->db_host;
        if ($key === 'port') return $this->db_port;
        if ($key === 'database') return $this->database_name;
        if ($key === 'username') return $this->db_username;
        if ($key === 'password') return $this->db_password_encrypted;

        return parent::getAttribute($key);
    }

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'domain',
            'tenant_name',
            'company_name',
            'business_type',
            'business_category',
            'admin_name',
            'admin_email',
            'phone',
            'address',
            'city',
            'country',
            'cr_number',
            'vat_number',
            'database_name',
            'db_host',
            'db_port',
            'db_region',
            'status',
            'provisioning_status',
            'localizations',
            'plan',
            'db_limit_gb',
            'trial_ends_at',
            'timezone',
            'date_format',
            'measurement_unit',
            'logo_url',
            'favicon_url',
            'primary_color',
            'secondary_color',
            'api_key',
            'database_plan_id',
            'data',
        ];
    }
}

