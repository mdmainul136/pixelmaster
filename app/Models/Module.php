<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Module extends Model
{
    use HasFactory;

    protected $connection = 'central';

    protected $fillable = [
        'module_key',
        'module_name',
        'description',
        'version',
        'is_active',
        'price',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price' => 'decimal:2',
    ];

    /**
     * Relationship: Tenant subscriptions to this module.
     */
    public function tenantModules()
    {
        return $this->hasMany(TenantModule::class);
    }

    /**
     * Scope for active modules.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
