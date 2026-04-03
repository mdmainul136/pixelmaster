<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformDepartment extends Model
{
    protected $fillable = ['team_id', 'name'];

    public function team()
    {
        return $this->belongsTo(PlatformTeam::class, 'team_id');
    }

    public function admins()
    {
        return $this->hasMany(SuperAdmin::class, 'department_id');
    }
}
