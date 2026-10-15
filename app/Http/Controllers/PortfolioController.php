<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Experience;
use App\Models\Profile;
use App\Models\Project;
use App\Models\Skill;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('portfolio', [
            'profile' => Profile::query()->first(),
            'projects' => Project::query()->with('images')->where('is_published', true)->orderBy('sort_order')->latest('published_at')->get(),
            'skills' => Skill::query()->where('is_active', true)->orderBy('sort_order')->get(),
            'experiences' => Experience::query()->where('is_active', true)->orderByDesc('started_at')->get(),
            'certificates' => Certificate::query()->where('is_active', true)->orderBy('sort_order')->get(),
        ]);
    }

    public function project(Project $project): Response
    {
        abort_unless($project->is_published, 404);

        return Inertia::render('projects/show', [
            'project' => $project->load('images'),
            'relatedProjects' => Project::query()
                ->where('is_published', true)
                ->whereKeyNot($project->getKey())
                ->when($project->category, fn ($query) => $query->where('category', $project->category))
                ->limit(3)
                ->get(),
        ]);
    }
}
