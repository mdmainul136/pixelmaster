<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class SuperAdmin extends Authenticatable
{
    use HasApiTokens, Notifiable, \App\Traits\HasPlatformAccess;

    protected $connection = 'central'; // Master database

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'profile_image',
        'company_name',
        'company_logo',
        'favicon',
        'company_address',
        'company_city_zip',
        'company_email',
        'company_phone',
        'timezone',
        'locale',
        'date_format',
        'time_format',
        'two_factor_secret',
        'two_factor_enabled',
        'two_factor_confirmed_at',
        'session_lifetime',
        'security_settings',
        'team_id',
        'department_id',
        'notification_preferences',
        'status',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected $casts = [
        'last_login_at' => 'datetime',
        'email_verified_at' => 'datetime',
        'security_settings' => 'array',
        'notification_preferences' => 'array',
        'two_factor_enabled' => 'boolean',
        'two_factor_confirmed_at' => 'datetime',
    ];

    /**
     * Check if the admin account is active
     */
    public function isActive(): bool
    {
        return !isset($this->status) || $this->status === 'active';
    }

    /**
     * Check if 2FA is enabled and confirmed
     */
    public function has2FAEnabled(): bool
    {
        return $this->two_factor_enabled && $this->two_factor_confirmed_at !== null;
    }

    /**
     * Update last login timestamp
     */
    public function updateLastLogin(): void
    {
        $this->update(['last_login_at' => now()]);
    }
}
