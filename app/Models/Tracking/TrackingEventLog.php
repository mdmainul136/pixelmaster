<?php

namespace App\Models\Tracking;

use App\Models\TenantBaseModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TrackingEventLog extends TenantBaseModel
{
    use HasFactory;

    protected $table = 'tracking_event_logs';

    protected $fillable = [
        'tenant_id', 'container_id', 'event_id', 'event_name', 'client_id',
        'source_ip', 'user_agent', 'page_url', 'referer',
        'user_hash', 'phone_hash', 'anonymous_id', 'identity_id',
        'value', 'currency', 'order_id',
        'country', 'city', 'region',
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
        'status', 'status_code', 'request_id', 'retry_count',
        'destinations_result', 'payload', 'processed_at',
        // Legacy columns (backward compat)
        'event_type',
    ];

    protected $casts = [
        'destinations_result' => 'array',
        'payload'             => 'array',
        'processed_at'        => 'datetime',
        'value'               => 'float',
        'status_code'         => 'integer',
    ];

    public function container()
    {
        return $this->belongsTo(TrackingContainer::class, 'container_id');
    }

    public function identity()
    {
        return $this->belongsTo(CustomerIdentity::class, 'identity_id');
    }

    public function scopeForContainer($query, int $containerId)
    {
        return $query->where('container_id', $containerId);
    }

    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('processed_at', '>=', now()->subHours($hours));
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'processed' => 'green',
            'received'  => 'blue',
            'deduped'   => 'yellow',
            'failed'    => 'red',
            default     => 'gray',
        };
    }
}
