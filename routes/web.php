
<?php

use App\Http\Controllers\Admin\PortfolioDashboardController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\SeoController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsurePortfolioAdmin;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Portfolio Routes
|--------------------------------------------------------------------------
| Halaman utama portofolio yang dapat diakses semua pengunjung.
*/

Route::get('/', [PortfolioController::class, 'index'])->name('home');
Route::get('/projects/{project:slug}', [PortfolioController::class, 'project'])->name('projects.show');
Route::get('/sitemap.xml', [SeoController::class, 'sitemap'])->name('sitemap');
Route::get('/robots.txt', [SeoController::class, 'robots'])->name('robots');
Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('contact.store');

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
        Route::post('/content/{resource}', [PortfolioDashboardController::class, 'store'])
            ->whereIn('resource', ['profile', 'projects', 'skills', 'experiences', 'certificates'])
            ->name('content.store');
        Route::post('/content/{resource}/{id}', [PortfolioDashboardController::class, 'update'])
            ->whereIn('resource', ['profile', 'projects', 'skills', 'experiences', 'certificates'])
            ->name('content.update');
        Route::delete('/content/{resource}/{id}', [PortfolioDashboardController::class, 'destroy'])
            ->whereIn('resource', ['projects', 'skills', 'experiences', 'certificates'])
            ->name('content.destroy');
        Route::patch('/projects/{project}/toggle', [PortfolioDashboardController::class, 'toggleProject'])
            ->name('projects.toggle');
        Route::delete('/project-images/{projectImage}', [PortfolioDashboardController::class, 'destroyProjectImage'])
            ->name('project-images.destroy');
        Route::delete('/certificates/{certificate}/files/{index}', [PortfolioDashboardController::class, 'destroyCertificateFile'])
            ->whereNumber('index')
            ->name('certificates.files.destroy');
        Route::patch('/messages/{contactMessage}/read', [PortfolioDashboardController::class, 'markMessageRead'])
            ->name('messages.read');
        Route::delete('/messages/{contactMessage}', [PortfolioDashboardController::class, 'destroyMessage'])
            ->name('messages.destroy');
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

require __DIR__.'/settings.php';
