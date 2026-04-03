<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $connection = 'central';

    protected $fillable = [
        'name',
        'name_ar',
        'plan_key',
        'description',
        'price_monthly',
        'price_yearly',
        'currency',
        'is_active',
        'features',
        'features_json',
        'allowed_modules',
        'quotas',
        'prices_ppp',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price_monthly' => 'decimal:2',
        'price_yearly' => 'decimal:2',
        'features' => 'array',
        'features_json' => 'array',
        'allowed_modules' => 'array',
        'quotas' => 'array',
        'prices_ppp' => 'array',
    ];

    /**
     * Scope for active plans
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
