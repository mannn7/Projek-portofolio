<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    protected $fillable = [
        'name', 'issuer', 'issued_at', 'credential_url', 'image', 'files',
        'sort_order', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'date',
            'files' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
