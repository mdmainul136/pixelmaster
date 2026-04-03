<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $connection = 'central';

    protected $fillable = [
        'slug',
        'name',
        'price',
        'allowed_modules',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'allowed_modules' => 'array',
    ];
}
