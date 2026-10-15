<?php

namespace App\Http\Responses\Concerns;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

trait RedirectsToCurrentTeam
{
    protected function redirectPathForAuthenticatedUser(Request $request, string $redirect): string
    {
        $user = $request->user();
        $adminEmail = config('portfolio.admin_email');

        if (
            $user &&
            is_string($adminEmail) &&
            $adminEmail !== '' &&
            strcasecmp($user->email, $adminEmail) === 0
        ) {
            return route('admin.index', absolute: false);
        }

        return $this->redirectPathForCurrentTeam($request, $redirect);
    }

    protected function redirectPathForCurrentTeam(Request $request, string $redirect): string
    {
        $team = $this->currentTeam($request);

        URL::defaults(['current_team' => $team->slug]);

        return "/{$team->slug}{$redirect}";
    }

    protected function currentTeam(Request $request): Team
    {
        $user = $request->user();

        abort_if(! $user, 403);

        $team = $user->currentTeam ?? $user->personalTeam();

        abort_if(! $team, 403);

        return $team;
    }
}
