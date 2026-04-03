<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SuperAdminInvitation extends Model
{
    protected $fillable = [
        'email', 'token', 'role_id', 'team_id', 'expires_at', 'accepted_at'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'accepted_at' => 'datetime',
    ];

    public function role()
    {
        return $this->belongsTo(PlatformRole::class, 'role_id');
    }

    public function team()
    {
        return $this->belongsTo(PlatformTeam::class, 'team_id');
    }
}
