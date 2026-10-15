
<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Controllers\Admin\PortfolioDashboardController;
use App\Http\Middleware\EnsureTeamMembership;
use App\Http\Middleware\EnsurePortfolioAdmin;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Portfolio Routes
|--------------------------------------------------------------------------
| Halaman utama portofolio yang dapat diakses semua pengunjung.
*/

Route::inertia('/', 'portfolio')->name('home');

/*
|--------------------------------------------------------------------------
| Portfolio Admin Dashboard
|--------------------------------------------------------------------------
| Hanya pengguna yang login, terverifikasi, dan memenuhi
| otorisasi admin yang boleh mengakses dashboard portofolio.
*/

Route::prefix('admin')
    ->name('admin.')
    ->middleware([
        'auth',
        'verified',
        EnsurePortfolioAdmin::class,
    ])
    ->group(function () {

        Route::get('/', [
            PortfolioDashboardController::class,
            'index',
        ])->name('index');
    });

/*
|--------------------------------------------------------------------------
| Laravel Teams Dashboard
|--------------------------------------------------------------------------
| Mempertahankan fitur dashboard bawaan Laravel Starter Kit.
*/

Route::prefix('{current_team}')
    ->middleware([
        'auth',
        'verified',
        EnsureTeamMembership::class,
    ])
    ->group(function () {

        Route::get(
            'dashboard',
            DashboardController::class
        )->name('dashboard');
    });

/*
|--------------------------------------------------------------------------
| Team Invitations
|--------------------------------------------------------------------------
| Fitur menerima dan menolak undangan Teams.
*/

Route::middleware(['auth'])->group(function () {

    Route::post(
        'invitations/{invitation}/accept',
        [TeamInvitationController::class, 'accept']
    )->name('invitations.accept');

    Route::delete(
        'invitations/{invitation}',
        [TeamInvitationController::class, 'decline']
    )->name('invitations.decline');
});

/*
|--------------------------------------------------------------------------
| Account Settings
|--------------------------------------------------------------------------
| Mempertahankan route pengaturan akun Laravel.
*/

require __DIR__ . '/settings.php';
