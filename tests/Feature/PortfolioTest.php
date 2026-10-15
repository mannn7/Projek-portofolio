<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

    public function test_admin_dashboard_requires_the_configured_admin(): void
    {
        $admin = User::factory()->create(['email' => 'admin@example.com', 'email_verified_at' => now()]);
        $other = User::factory()->create(['email_verified_at' => now()]);
        config(['portfolio.admin_email' => $admin->email]);

        $this->get('/admin')->assertRedirect('/login');
        $this->actingAs($other)->get('/admin')->assertForbidden();
        $this->actingAs($admin)->get('/admin')->assertOk()->assertInertia(fn ($page) => $page->component('admin/dashboard'));
    }
}
