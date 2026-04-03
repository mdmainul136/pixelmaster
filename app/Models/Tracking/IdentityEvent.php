<?php

namespace App\Models\Tracking;

use App\Models\TenantBaseModel;

class IdentityEvent extends TenantBaseModel
{
    protected $table = 'tracking_identity_events';

    protected $fillable = [
        'tenant_id', 'from_id', 'to_id', 'link_type',
        'source_event', 'event_id', 'identity_id',
        'confidence', 'ip_address', 'user_agent', 'linked_at',
    ];

    protected $casts = [
        'linked_at'  => 'datetime',
        'confidence' => 'integer',
    ];

    public function identity()
    {
        return $this->belongsTo(CustomerIdentity::class, 'identity_id');
    }
}
