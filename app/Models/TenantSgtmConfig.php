<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TenantSgtmConfig extends Model
{
    use HasFactory;

    protected $connection = 'central';

    protected $fillable = [
        'tenant_id',
        'container_id',
        'api_key',
        'custom_domain',
        'is_active',
        'settings',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'settings' => 'array',
    ];

    /**
     * Get the tenant that owns the sGTM config.
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Boot function to handle automatic key generation if needed.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($config) {
            if (empty($config->api_key)) {
                $config->api_key = \Illuminate\Support\Str::random(32);
            }
        });
    }
}
