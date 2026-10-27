<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Profile extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'headline',
        'bio',
        'photo',
        'cv_file',
        'email',
        'github_url',
        'linkedin_url',
        'whatsapp_url',
        'instagram_url',
        'tiktok_url',
        'location',
        'available_for_work',
    ];

    protected function casts(): array
    {
        return [
            'available_for_work' => 'boolean',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
