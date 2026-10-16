<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PortfolioTest extends TestCase
{
    use RefreshDatabase;

    public function test_homepage_is_public_and_database_backed(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('portfolio')
                ->has('projects')
                ->has('skills')
                ->has('experiences')
                ->has('certificates'));
    }

    public function test_only_published_projects_have_public_detail_pages(): void
    {
        $published = Project::query()->create([
            'title' => 'Published project', 'slug' => 'published-project',
            'is_published' => true, 'technologies' => ['Laravel'],
        ]);
        $draft = Project::query()->create([
            'title' => 'Draft project', 'slug' => 'draft-project',
            'is_published' => false,
        ]);

        $this->get(route('projects.show', $published))->assertOk();
        $this->get(route('projects.show', $draft))->assertNotFound();
    }

    public function test_sitemap_only_contains_public_portfolio_pages(): void
    {
        $published = Project::query()->create([
            'title' => 'Public work', 'slug' => 'public-work', 'is_published' => true,
        ]);
        $draft = Project::query()->create([
            'title' => 'Private draft', 'slug' => 'private-draft', 'is_published' => false,
        ]);

        $this->get(route('sitemap'))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
            ->assertSee(route('home'), escape: false)
            ->assertSee(route('projects.show', $published), escape: false)
            ->assertDontSee(route('projects.show', $draft), escape: false);
    }

    public function test_robots_file_points_to_sitemap_and_blocks_private_areas(): void
    {
        $this->get(route('robots'))
            ->assertOk()
            ->assertSee('Sitemap: '.route('sitemap'), escape: false)
            ->assertSee('Disallow: /admin', escape: false)
            ->assertSee('Disallow: /settings', escape: false);
    }

    public function test_admin_dashboard_requires_the_configured_admin(): void
    {
        $admin = User::factory()->create(['email' => 'admin@example.com', 'email_verified_at' => now()]);
        $other = User::factory()->create(['email_verified_at' => now()]);
        config(['portfolio.admin_email' => $admin->email]);

        $this->get('/admin')->assertRedirect('/login');
        $this->actingAs($other)->get('/admin')->assertForbidden();
        $this->actingAs($admin)->get('/admin')->assertOk()->assertInertia(fn ($page) => $page->component('admin/dashboard'));
    }

    public function test_admin_can_toggle_project_publication(): void
    {
        $admin = User::factory()->create(['email' => 'admin@example.com', 'email_verified_at' => now()]);
        $project = Project::query()->create([
            'title' => 'Draft project', 'slug' => 'draft-project', 'is_published' => false,
        ]);
        config(['portfolio.admin_email' => $admin->email]);

        $this->actingAs($admin)
            ->patch(route('admin.projects.toggle', $project))
            ->assertRedirect();

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'is_published' => true,
        ]);
        $this->assertNotNull($project->fresh()->published_at);
    }

    public function test_profile_photo_must_meet_minimum_dimensions(): void
    {
        $admin = User::factory()->create(['email' => 'admin@example.com', 'email_verified_at' => now()]);
        config(['portfolio.admin_email' => $admin->email]);

        $this->actingAs($admin)
            ->post(route('admin.content.store', 'profile'), [
                'name' => 'Firman Aji',
                'available_for_work' => true,
                'photo' => UploadedFile::fake()->image('small.jpg', 120, 120),
            ])
            ->assertSessionHasErrors('photo');
    }

    public function test_admin_can_upload_multiple_project_screenshots(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['email' => 'admin@example.com', 'email_verified_at' => now()]);
        $project = Project::query()->create([
            'title' => 'Gallery project', 'slug' => 'gallery-project', 'is_published' => false,
        ]);
        config(['portfolio.admin_email' => $admin->email]);

        $this->actingAs($admin)
            ->post(route('admin.content.update', ['resource' => 'projects', 'id' => $project->id]), [
                'title' => $project->title,
                'slug' => $project->slug,
                'sort_order' => 0,
                'is_featured' => false,
                'is_published' => false,
                'gallery' => [
                    UploadedFile::fake()->image('screen-one.jpg', 1200, 700),
                    UploadedFile::fake()->image('screen-two.jpg', 1200, 700),
                ],
            ])
            ->assertSessionHasNoErrors();

        $this->assertCount(2, $project->fresh()->images);
        foreach ($project->fresh()->images as $image) {
            Storage::disk('public')->assertExists($image->path);
        }
    }
}
