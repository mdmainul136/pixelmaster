<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformPermission extends Model
{
    protected $fillable = ['name', 'display_name', 'group'];

    public function roles()
    {
        return $this->belongsToMany(PlatformRole::class, 'platform_role_permission', 'permission_id', 'role_id');
    }
}
