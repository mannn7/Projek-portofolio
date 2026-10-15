<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\Project;
use App\Models\Skill;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioDashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'statistics' => [
                'projects' => Project::count(),
                'published' => Project::where('is_published', true)->count(),
                'drafts' => Project::where('is_published', false)->count(),
                'skills' => Skill::count(),
                'profiles' => Profile::count(),
            ],

            'recentProjects' => Project::query()
                ->latest()
                ->limit(5)
                ->get([
                    'id',
                    'title',
                    'slug',
                    'is_published',
                    'created_at',
                ]),
        ]);
    }
}
