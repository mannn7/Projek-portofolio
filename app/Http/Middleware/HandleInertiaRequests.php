<?php

namespace App\Http\Middleware;

use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'currentTeam' => fn () => $user?->currentTeam ? $user->toUserTeam($user->currentTeam) : null,
            'teams' => fn () => $user?->toUserTeams(includeCurrent: true) ?? [],
            'ambientAudio' => fn () => $this->ambientAudioSettings(),
        ];
    }

    /** @return array{source: ?string, volume: int, enabled: bool, loop: bool} */
    private function ambientAudioSettings(): array
    {
        $settings = SiteSetting::query()->first();

        if ($settings === null) {
            return [
                'source' => '/audio/portfolio-ambient.mp3',
                'volume' => 50,
                'enabled' => true,
                'loop' => true,
            ];
        }

        $path = $settings->ambient_audio;

        return [
            'source' => $path
                ? (str_starts_with($path, '/') ? $path : '/storage/'.ltrim($path, '/'))
                : null,
            'volume' => $settings->audio_volume,
            'enabled' => $settings->audio_enabled,
            'loop' => $settings->audio_loop,
        ];
    }
}
