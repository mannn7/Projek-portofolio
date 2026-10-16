<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;

class SeoController extends Controller
{
    public function sitemap(): Response
    {
        $urls = collect([
            [
                'location' => route('home'),
                'lastModified' => $this->lastProjectUpdate(),
                'priority' => '1.0',
            ],
        ])->merge(
            Project::query()
                ->where('is_published', true)
                ->orderByDesc('updated_at')
                ->get(['slug', 'updated_at'])
                ->map(fn (Project $project) => [
                    'location' => route('projects.show', $project),
                    'lastModified' => $project->updated_at?->toAtomString(),
                    'priority' => '0.8',
                ]),
        );

        $xml = view('sitemap', ['urls' => $urls])->render();

        return response($xml, 200)->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    public function robots(): Response
    {
        $content = implode("\n", [
            'User-agent: *',
            'Allow: /',
            'Disallow: /admin',
            'Disallow: /settings',
            'Disallow: /login',
            'Sitemap: '.route('sitemap'),
            '',
        ]);

        return response($content, 200)->header('Content-Type', 'text/plain; charset=UTF-8');
    }

    private function lastProjectUpdate(): ?string
    {
        $lastModified = Project::query()->where('is_published', true)->max('updated_at');

        return $lastModified ? Carbon::parse($lastModified)->toAtomString() : null;
    }
}
