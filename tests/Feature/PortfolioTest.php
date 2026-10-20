<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use App\Models\Certificate;
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

    public function test_project_detail_fills_related_work_from_other_categories(): void
    {
        $project = Project::query()->create([
            'title' => 'Main project', 'slug' => 'main-project',
            'category' => 'Web App', 'is_published' => true,
        ]);
        Project::query()->create([
            'title' => 'Related web app', 'slug' => 'related-web-app',
            'category' => 'Web App', 'is_published' => true,
        ]);
        Project::query()->create([
            'title' => 'Mobile project', 'slug' => 'mobile-project',
            'category' => 'Mobile', 'is_published' => true,
        ]);
        Project::query()->create([
            'title' => 'API project', 'slug' => 'api-project',
            'category' => 'API', 'is_published' => true,
        ]);

        $this->get(route('projects.show', $project))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('projects/show')
                ->has('relatedProjects', 3)
                ->where('relatedProjects.0.category', 'Web App'));
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

    public function test_admin_can_create_experience_and_certificate_content(): void
    {
        $admin = User::factory()->create(['email' => 'admin@example.com', 'email_verified_at' => now()]);
        config(['portfolio.admin_email' => $admin->email]);

        $this->actingAs($admin)
            ->post(route('admin.content.store', 'experiences'), [
                'role' => 'Software Engineer',
                'company' => 'Example Company',
                'started_at' => '2025-01-01',
                'sort_order' => 0,
                'is_active' => true,
            ])
            ->assertSessionHasNoErrors();

        $this->actingAs($admin)
            ->post(route('admin.content.store', 'certificates'), [
                'name' => 'Verified Certificate',
                'issuer' => 'Example Issuer',
                'issued_at' => '2025-02-01',
                'sort_order' => 0,
                'is_active' => true,
            ])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('experiences', [
            'role' => 'Software Engineer',
            'is_active' => true,
        ]);
        $this->assertDatabaseHas('certificates', [
            'name' => 'Verified Certificate',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_edit_certificate_without_uploading_its_image_again(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('certificates/existing.jpg', 'existing certificate');
        $admin = User::factory()->create(['email' => 'admin@example.com', 'email_verified_at' => now()]);
        $certificate = Certificate::query()->create([
            'name' => 'Existing Certificate',
            'issuer' => 'BNSP',
            'image' => 'certificates/existing.jpg',
            'sort_order' => 0,
            'is_active' => true,
        ]);
        config(['portfolio.admin_email' => $admin->email]);

        $this->actingAs($admin)
            ->post(route('admin.content.update', ['resource' => 'certificates', 'id' => $certificate->id]), [
                'name' => 'Updated Certificate',
                'issuer' => 'BNSP',
                'image' => 'certificates/existing.jpg',
                'sort_order' => 5,
                'is_active' => true,
            ])
            ->assertSessionHasNoErrors();

        $certificate->refresh();
        $this->assertSame('Updated Certificate', $certificate->name);
        $this->assertSame('certificates/existing.jpg', $certificate->image);
        Storage::disk('public')->assertExists('certificates/existing.jpg');
    }

    public function test_admin_can_upload_a_pdf_certificate(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['email' => 'admin@example.com', 'email_verified_at' => now()]);
        config(['portfolio.admin_email' => $admin->email]);

        $this->actingAs($admin)
            ->post(route('admin.content.store', 'certificates'), [
                'name' => 'PDF Certificate',
                'issuer' => 'Example Issuer',
                'image' => UploadedFile::fake()->create('certificate.pdf', 512, 'application/pdf'),
                'sort_order' => 0,
                'is_active' => true,
            ])
            ->assertSessionHasNoErrors();

        $certificate = Certificate::query()->where('name', 'PDF Certificate')->firstOrFail();
        $this->assertStringEndsWith('.pdf', $certificate->image);
        Storage::disk('public')->assertExists($certificate->image);
    }

    public function test_public_contact_form_stores_a_valid_message(): void
    {
        $this->post(route('contact.store'), [
            'name' => 'Portfolio Visitor',
            'email' => 'visitor@example.com',
            'subject' => 'Project enquiry',
            'message' => 'I would like to discuss a new web project.',
            'website' => '',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('contact_messages', [
            'email' => 'visitor@example.com',
            'subject' => 'Project enquiry',
        ]);
    }

    public function test_contact_form_rejects_spam_honeypot_and_short_messages(): void
    {
        $this->post(route('contact.store'), [
            'name' => 'Spam Bot',
            'email' => 'bot@example.com',
            'message' => 'short',
            'website' => 'https://spam.example.com',
        ])->assertSessionHasErrors(['message', 'website']);

        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_admin_can_manage_contact_message_status(): void
    {
        $admin = User::factory()->create(['email' => 'admin@example.com', 'email_verified_at' => now()]);
        $message = ContactMessage::query()->create([
            'name' => 'Portfolio Visitor',
            'email' => 'visitor@example.com',
            'message' => 'A valid message for the portfolio owner.',
        ]);
        config(['portfolio.admin_email' => $admin->email]);

        $this->actingAs($admin)
            ->patch(route('admin.messages.read', $message))
            ->assertRedirect();

        $this->assertNotNull($message->fresh()->read_at);
    }
}
