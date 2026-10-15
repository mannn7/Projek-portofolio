<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePortfolioAdmin
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        $adminEmail = config('portfolio.admin_email');

        if (
            ! is_string($adminEmail) ||
            $adminEmail === '' ||
            strcasecmp($user->email, $adminEmail) !== 0
        ) {
            abort(403, 'Unauthorized access.');
        }

        return $next($request);
    }
}
