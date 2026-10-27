<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = [
        'ambient_audio',
        'audio_volume',
        'audio_enabled',
        'audio_loop',
    ];

    protected function casts(): array
    {
        return [
            'audio_volume' => 'integer',
            'audio_enabled' => 'boolean',
            'audio_loop' => 'boolean',
        ];
    }
}
