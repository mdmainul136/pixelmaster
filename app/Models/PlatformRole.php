<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformRole extends Model
{
    protected $connection = 'central';
    protected $fillable = ['name', 'display_name', 'description'];

    public function permissions()
    {
        return $this->belongsToMany(PlatformPermission::class, 'platform_role_permission', 'role_id', 'permission_id');
    }

    public function admins()
    {
        return $this->belongsToMany(SuperAdmin::class, 'platform_admin_role', 'role_id', 'admin_id');
    }
}
