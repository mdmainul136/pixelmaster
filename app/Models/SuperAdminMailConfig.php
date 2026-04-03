<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class SuperAdminMailConfig extends Model
{
    protected $fillable = ['provider', 'config_data', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function setConfigDataAttribute($value)
    {
        $this->attributes['config_data'] = Crypt::encryptString(json_encode($value));
    }

    public function getConfigDataAttribute($value)
    {
        return json_decode(Crypt::decryptString($value), true);
    }
}
