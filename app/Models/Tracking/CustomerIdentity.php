<?php

namespace App\Models\Tracking;

use App\Models\TenantBaseModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CustomerIdentity extends TenantBaseModel
{
    use HasFactory;

    protected $table      = 'tracking_customer_identity';

    protected $fillable = [
        'tenant_id', 'user_id', 'email_hash', 'phone_hash',
        'primary_anonymous_id', 'merged_anonymous_ids',
        'devices', 'browsers', 'ip_addresses',
        'order_count', 'total_spent', 'avg_order_value',
        'first_order_at', 'last_order_at', 'days_since_last_order',
        'customer_segment', 'segment_updated_at',
        'first_touch_source', 'first_touch_medium', 'first_touch_campaign',
        'last_touch_source', 'last_touch_medium',
        'phone_order_count', 'whatsapp_click_count', 'last_whatsapp_click_at',
        'device_count', 'is_cross_device',
    ];

    protected $casts = [
        'merged_anonymous_ids'  => 'array',
        'devices'               => 'array',
        'browsers'              => 'array',
        'ip_addresses'          => 'array',
        'is_cross_device'       => 'boolean',
        'total_spent'           => 'float',
        'avg_order_value'       => 'float',
        'first_order_at'        => 'datetime',
        'last_order_at'         => 'datetime',
        'last_whatsapp_click_at'=> 'datetime',
        'segment_updated_at'    => 'datetime',
    ];

    public function events()
    {
        return $this->hasMany(TrackingEventLog::class, 'identity_id');
    }

    public function identityLinks()
    {
        return $this->hasMany(IdentityEvent::class, 'identity_id');
    }

    /** Scope to a specific tenant */
    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    /** Scope by segment */
    public function scopeSegment($query, string $segment)
    {
        return $query->where('customer_segment', $segment);
    }

    /** Segment badge color for UI */
    public function getSegmentColorAttribute(): string
    {
        return match ($this->customer_segment) {
            'vip'          => 'purple',
            'loyal'        => 'blue',
            'returning'    => 'green',
            'new_customer' => 'teal',
            'churned'      => 'red',
            'prospect'     => 'gray',
            default        => 'gray',
        };
    }
}
