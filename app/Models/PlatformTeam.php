<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformTeam extends Model
{
    protected $fillable = ['name', 'description'];

    public function departments()
    {
        return $this->hasMany(PlatformDepartment::class, 'team_id');
    }

    public function admins()
    {
        return $this->hasMany(SuperAdmin::class, 'team_id');
    }
}
