<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantPaymentConfig extends Model
{
    use HasFactory;

    protected $connection = 'central';
    protected $table = 'tenant_payment_configs';

    protected $fillable = [
        'tenant_id',
        'gateway_name',
        'mode',
        'credentials',
        'is_active',
    ];

    protected $casts = [
        'credentials' => 'array',
        'is_active' => 'boolean',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }
}
