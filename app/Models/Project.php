<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property Carbon|null $published_at
 * @property-read Collection<int, ProjectImage> $images
 */
class Project extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'description',
        'category',
        'content',
        'problem',
        'solution',
        'role',
        'outcome',
        'image',
        'technologies',
        'github_url',
        'demo_url',
        'is_featured',
        'is_published',
        'sort_order',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'technologies' => 'array',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    /** @return HasMany<ProjectImage, $this> */
    public function images(): HasMany
    {
        return $this->hasMany(ProjectImage::class)->orderBy('sort_order');
    }
}
