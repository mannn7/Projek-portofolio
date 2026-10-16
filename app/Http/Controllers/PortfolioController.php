<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Experience;
use App\Models\Profile;
use App\Models\Project;
use App\Models\Skill;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function index(): Response
    {
        $profile = Profile::query()->first();
        $title = $profile
            ? "{$profile->name} — {$profile->headline}"
            : 'FA.DEV — Full-Stack Developer';
        $description = str($profile?->bio ?: 'Full-Stack Developer portfolio showcasing selected projects, skills, and experience.')
            ->squish()
            ->limit(155, '')
            ->toString();

        return Inertia::render('portfolio', [
            'profile' => $profile,
            'projects' => Project::query()->with('images')->where('is_published', true)->orderBy('sort_order')->latest('published_at')->get(),
            'skills' => Skill::query()->where('is_active', true)->orderBy('sort_order')->get(),
            'experiences' => Experience::query()->where('is_active', true)->orderByDesc('started_at')->get(),
            'certificates' => Certificate::query()->where('is_active', true)->orderBy('sort_order')->get(),
            'seo' => [
                'title' => $title,
                'description' => $description,
                'canonical' => route('home'),
                'image' => $this->publicMediaUrl($profile?->photo ?: 'images/firman-aji-profile-blue.png'),
                'schema' => array_filter([
                    '@context' => 'https://schema.org',
                    '@type' => 'Person',
                    'name' => $profile?->name,
                    'jobTitle' => $profile?->headline,
                    'description' => $description,
                    'url' => route('home'),
                    'image' => $this->publicMediaUrl($profile?->photo ?: 'images/firman-aji-profile-blue.png'),
                    'email' => $profile?->email ? "mailto:{$profile->email}" : null,
                    'sameAs' => array_values(array_filter([
                        $profile?->github_url,
                        $profile?->linkedin_url,
                    ])),
                ], fn ($value) => $value !== null && $value !== ''),
            ],
        ]);
    }

    public function project(Project $project): Response
    {
        abort_unless($project->is_published, 404);

        $project->load('images');
        $description = str($project->description ?: $project->content ?: $project->title)
            ->squish()
            ->limit(155, '')
            ->toString();

        return Inertia::render('projects/show', [
            'project' => $project,
            'relatedProjects' => Project::query()
                ->where('is_published', true)
                ->whereKeyNot($project->getKey())
                ->when($project->category, fn ($query) => $query->where('category', $project->category))
                ->limit(3)
                ->get(),
            'seo' => [
                'title' => "{$project->title} — FA.DEV",
                'description' => $description,
                'canonical' => route('projects.show', $project),
                'image' => $this->publicMediaUrl($project->image ?: $project->images->first()?->path ?: 'images/firman-aji-profile-blue.png'),
                'publishedAt' => $project->published_at?->toAtomString(),
                'schema' => array_filter([
                    '@context' => 'https://schema.org',
                    '@type' => 'CreativeWork',
                    'name' => $project->title,
                    'description' => $description,
                    'url' => route('projects.show', $project),
                    'image' => $this->publicMediaUrl($project->image ?: $project->images->first()?->path ?: 'images/firman-aji-profile-blue.png'),
                    'keywords' => $project->technologies,
                    'datePublished' => $project->published_at?->toAtomString(),
                ], fn ($value) => $value !== null && $value !== ''),
            ],
        ]);
    }

    private function publicMediaUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        if (is_file(public_path(ltrim($path, '/')))) {
            return asset(ltrim($path, '/'));
        }

        return url(Storage::disk('public')->url(ltrim($path, '/')));
    }
}
