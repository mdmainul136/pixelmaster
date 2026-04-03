<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantSubscription extends Model
{
    protected $connection = 'central';

    protected $fillable = [
        'tenant_id',
        'subscription_plan_id',
        'status',
        'billing_cycle',
        'trial',
        'trial_started_at',
        'trial_ends_at',
        'renews_at',
        'canceled_at',
        'ends_at',
        'auto_renew',
        'dunning_attempts',
        'provider',
        'provider_subscription_id',
        'provider_customer_id',
        'current_period_start',
        'current_period_end',
    ];

    protected $casts = [
        'trial'            => 'boolean',
        'auto_renew'       => 'boolean',
        'trial_started_at' => 'datetime',
        'trial_ends_at'    => 'datetime',
        'renews_at'        => 'datetime',
        'canceled_at'      => 'datetime',
        'ends_at'          => 'datetime',
        'dunning_attempts' => 'integer',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    // ─── Status Helpers ───────────────────────────────────────────────────────

    /**
     * Is this subscription in an active (or grace-period) state?
     */
    public function isActive(): bool
    {
        if ($this->status === 'expired') {
            return false;
        }

        if ($this->status === 'canceled' && $this->ends_at?->isPast()) {
            return false;
        }

        if ($this->isTrialing()) {
            return true;
        }

        return $this->status === 'active' && (!$this->ends_at || $this->ends_at->isFuture());
    }

    /**
     * Is the subscription actively in a trial right now?
     */
    public function isTrialing(): bool
    {
        return $this->trial === true
            && $this->status === 'trialing'
            && $this->trial_ends_at
            && $this->trial_ends_at->isFuture();
    }

    /**
     * Has the trial period expired (but status not yet transitioned)?
     */
    public function isTrialExpired(): bool
    {
        return $this->trial_ends_at
            && $this->trial_ends_at->isPast()
            && in_array($this->status, ['trialing', 'trial']);
    }

    /**
     * Is this subscription past due (missed renewal)?
     */
    public function isPastDue(): bool
    {
        return $this->status === 'past_due';
    }

    /**
     * Is this subscription canceled?
     */
    public function isCanceled(): bool
    {
        return $this->status === 'canceled';
    }

    /**
     * Days remaining in trial (null if not trialing).
     */
    public function getTrialDaysRemainingAttribute(): ?int
    {
        if (!$this->isTrialing()) {
            return null;
        }
        return (int) now()->diffInDays($this->trial_ends_at, false);
    }

    // ─── Query Scopes ─────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeTrialing($query)
    {
        return $query->where('status', 'trialing');
    }

    public function scopePastDue($query)
    {
        return $query->where('status', 'past_due');
    }

    public function scopeCanceled($query)
    {
        return $query->where('status', 'canceled');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    /**
     * Trials expiring within N days.
     */
    public function scopeTrialExpiringSoon($query, int $days = 14)
    {
        return $query->trialing()
            ->whereBetween('trial_ends_at', [now(), now()->addDays($days)]);
    }

    // ─── Revenue Helper ───────────────────────────────────────────────────────

    /**
     * Normalized Monthly Recurring Revenue for this subscription.
     * Yearly plans are divided by 12; trial subscriptions return 0.
     */
    public function getMonthlyRevenueAttribute(): float
    {
        if (!$this->plan || $this->status !== 'active') {
            return 0.0;
        }

        if ($this->billing_cycle === 'yearly') {
            return (float) ($this->plan->price_yearly / 12);
        }

        return (float) $this->plan->price_monthly;
    }
}
