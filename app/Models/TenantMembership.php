<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantMembership extends Model
{
    protected $connection = 'central';

    protected $fillable = [
        'tenant_id',
        'user_id',
        'email',
        'role',
        'status',
        'invitation_token',
        'invited_at',
        'accepted_at',
        'expires_at',
    ];

    protected $casts = [
        'invited_at' => 'datetime',
        'accepted_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if the membership is currently active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && $this->user_id !== null;
    }

    /**
     * Check if the membership is a pending invitation.
     */
    public function isPending(): bool
    {
        return $this->status === 'invite_pending' && ($this->expires_at === null || $this->expires_at->isFuture());
    }
}
