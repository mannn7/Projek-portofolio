<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\ContactMessage;
use App\Models\Experience;
use App\Models\Profile;
use App\Models\Project;
use App\Models\ProjectImage;
use App\Models\Skill;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
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
                'experiences' => Experience::count(),
                'certificates' => Certificate::count(),
                'messages' => ContactMessage::count(),
            ],
            'profile' => Profile::query()->first(),
            'projects' => Project::query()->with('images')->orderBy('sort_order')->latest()->get(),
            'skills' => Skill::query()->orderBy('sort_order')->get(),
            'experiences' => Experience::query()->orderByDesc('started_at')->get(),
            'certificates' => Certificate::query()->orderBy('sort_order')->get(),
            'contactMessages' => ContactMessage::query()->latest()->get(),
        ]);
    }

    public function store(Request $request, string $resource): RedirectResponse
    {
        $model = $this->modelFor($resource);
        $data = $this->validated($request, $resource);

        if ($resource === 'profile') {
            $data['user_id'] = $request->user()->id;
            $record = Profile::query()->firstOrNew(['user_id' => $request->user()->id]);
        } else {
            $record = new $model;
        }

        $replacedFiles = $this->prepareUploads($request, $resource, $data, $record);
        $record->fill($data)->save();
        $this->storeProjectGallery($request, $resource, $record);
        $this->deleteReplacedFiles($replacedFiles);

        return back()->with('success', ucfirst($resource).' saved successfully.');
    }

    public function update(Request $request, string $resource, int $id): RedirectResponse
    {
        $record = $this->modelFor($resource)::query()->findOrFail($id);
        $data = $this->validated($request, $resource, $id);
        $replacedFiles = $this->prepareUploads($request, $resource, $data, $record);
        $record->update($data);
        $this->storeProjectGallery($request, $resource, $record);
        $this->deleteReplacedFiles($replacedFiles);

        return back()->with('success', ucfirst($resource).' updated successfully.');
    }

    public function destroy(string $resource, int $id): RedirectResponse
    {
        abort_if($resource === 'profile', 405);
        $record = $this->modelFor($resource)::query()->findOrFail($id);

        if ($record instanceof Project) {
            Storage::disk('public')->delete($record->images()->pluck('path')->all());
        }

        foreach (['image', 'photo', 'cv_file'] as $field) {
            if ($record->getAttribute($field)) {
                Storage::disk('public')->delete($record->getAttribute($field));
            }
        }

        if ($record instanceof Certificate) {
            Storage::disk('public')->delete($record->files ?? []);
        }

        $record->delete();

        return back()->with('success', 'Item deleted successfully.');
    }

    public function toggleProject(Project $project): RedirectResponse
    {
        $project->update([
            'is_published' => ! $project->is_published,
            'published_at' => $project->is_published ? null : now(),
        ]);

        return back()->with('success', $project->is_published ? 'Project published.' : 'Project moved to draft.');
    }

    public function destroyProjectImage(ProjectImage $projectImage): RedirectResponse
    {
        Storage::disk('public')->delete($projectImage->path);
        $projectImage->delete();

        return back()->with('success', 'Project screenshot deleted.');
    }

    public function destroyProjectCover(Project $project): RedirectResponse
    {
        if ($project->image) {
            Storage::disk('public')->delete($project->image);
            $project->update(['image' => null]);
        }

        return back()->with('success', 'Project cover deleted.');
    }

    public function destroyCertificateFile(Certificate $certificate, int $index): RedirectResponse
    {
        $files = array_values(array_unique(array_filter([
            $certificate->image,
            ...($certificate->files ?? []),
        ])));
        abort_unless(array_key_exists($index, $files), 404);

        if (count($files) === 1) {
            return back()->withErrors([
                'files' => 'A certificate must keep at least one file. Upload a replacement before deleting this file.',
            ]);
        }

        $removedFile = $files[$index];
        array_splice($files, $index, 1);
        $certificate->update([
            'image' => $files[0] ?? null,
            'files' => $files,
        ]);
        Storage::disk('public')->delete($removedFile);

        return back()->with('success', 'Certificate file deleted.');
    }

    public function markMessageRead(ContactMessage $contactMessage): RedirectResponse
    {
        $contactMessage->update([
            'read_at' => $contactMessage->read_at ? null : now(),
        ]);

        return back()->with('success', 'Message status updated.');
    }

    public function destroyMessage(ContactMessage $contactMessage): RedirectResponse
    {
        $contactMessage->delete();

        return back()->with('success', 'Message deleted.');
    }

    /** @return class-string<Model> */
    private function modelFor(string $resource): string
    {
        return match ($resource) {
            'profile' => Profile::class,
            'projects' => Project::class,
            'skills' => Skill::class,
            'experiences' => Experience::class,
            'certificates' => Certificate::class,
            default => abort(404),
        };
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, string $resource, ?int $id = null): array
    {
        $rules = match ($resource) {
            'profile' => [
                'name' => ['required', 'string', 'max:100'],
                'headline' => ['nullable', 'string', 'max:160'],
                'bio' => ['nullable', 'string', 'max:3000'],
                'email' => ['nullable', 'email', 'max:255'],
                'github_url' => ['nullable', 'url', 'max:255'],
                'linkedin_url' => ['nullable', 'url', 'max:255'],
                'location' => ['nullable', 'string', 'max:160'],
                'available_for_work' => ['boolean'],
                'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'dimensions:min_width=500,min_height=500', 'max:4096'],
                'cv_file' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            ],
            'projects' => [
                'title' => ['required', 'string', 'max:160'],
                'slug' => ['required', 'alpha_dash', 'max:180', Rule::unique('projects', 'slug')->ignore($id)],
                'description' => ['nullable', 'string', 'max:1000'],
                'content' => ['nullable', 'string', 'max:20000'],
                'problem' => ['nullable', 'string', 'max:5000'],
                'solution' => ['nullable', 'string', 'max:5000'],
                'role' => ['nullable', 'string', 'max:2000'],
                'outcome' => ['nullable', 'string', 'max:5000'],
                'category' => ['nullable', 'string', 'max:80'],
                'technologies' => ['nullable', 'string', 'max:1000'],
                'github_url' => ['nullable', 'url', 'max:255'],
                'demo_url' => ['nullable', 'url', 'max:255'],
                'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'dimensions:min_width=1000,min_height=500', 'max:6144'],
                'gallery' => ['nullable', 'array', 'max:8'],
                'gallery.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'dimensions:min_width=1000,min_height=500', 'max:6144'],
                'is_featured' => ['boolean'], 'is_published' => ['boolean'],
                'sort_order' => ['integer', 'min:0', 'max:9999'],
            ],
            'skills' => [
                'name' => ['required', 'string', 'max:100'],
                'category' => ['required', 'string', 'max:80'],
                'icon' => ['nullable', 'string', 'max:100'],
                'sort_order' => ['integer', 'min:0', 'max:9999'], 'is_active' => ['boolean'],
            ],
            'experiences' => [
                'role' => ['required', 'string', 'max:160'], 'company' => ['required', 'string', 'max:160'],
                'location' => ['nullable', 'string', 'max:160'], 'started_at' => ['required', 'date'],
                'ended_at' => ['nullable', 'date', 'after_or_equal:started_at'],
                'description' => ['nullable', 'string', 'max:3000'],
                'sort_order' => ['integer', 'min:0', 'max:9999'], 'is_active' => ['boolean'],
            ],
            'certificates' => [
                'name' => ['required', 'string', 'max:160'], 'issuer' => ['required', 'string', 'max:160'],
                'issued_at' => ['nullable', 'date'], 'credential_url' => ['nullable', 'url', 'max:255'],
                'image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:8192'],
                'files' => ['nullable', 'array', 'max:8'],
                'files.*' => ['file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:8192'],
                'sort_order' => ['integer', 'min:0', 'max:9999'], 'is_active' => ['boolean'],
            ],
            default => abort(404),
        };

        if ($resource === 'certificates'
            && $request->hasFile('image')
            && $request->file('image')->getMimeType() !== 'application/pdf') {
            $rules['image'][] = 'dimensions:min_width=600,min_height=400';
        }

        // Existing media URLs can be present in older CMS form payloads. They
        // mean "keep the current file" and must not be validated as uploads.
        foreach (['photo', 'cv_file', 'image'] as $field) {
            if (array_key_exists($field, $rules) && ! $request->hasFile($field)) {
                $request->request->remove($field);
            }
        }

        $data = $request->validate($rules);
        foreach (['available_for_work', 'is_featured', 'is_published', 'is_active'] as $field) {
            if (array_key_exists($field, $rules)) {
                $data[$field] = $request->boolean($field);
            }
        }
        if ($resource === 'projects' && isset($data['technologies'])) {
            $data['technologies'] = array_values(array_filter(array_map('trim', explode(',', $data['technologies']))));
        }
        unset($data['gallery'], $data['files']);

        return $data;
    }

    /** @param array<string, mixed> $data */
    private function prepareUploads(Request $request, string $resource, array &$data, Model $record): array
    {
        $replacedFiles = [];

        foreach (['photo', 'cv_file', 'image'] as $field) {
            if (! $request->hasFile($field)) {
                unset($data[$field]);

                continue;
            }
            if ($record->getAttribute($field)) {
                $replacedFiles[] = $record->getAttribute($field);
            }
            $data[$field] = $request->file($field)->store($resource, 'public');
        }

        if ($resource === 'certificates' && $record instanceof Certificate && $request->hasFile('files')) {
            $existingFiles = array_values(array_unique(array_filter([
                $record->image,
                ...($record->files ?? []),
            ])));
            $uploadedFiles = array_map(
                fn ($file) => $file->store('certificates', 'public'),
                $request->file('files', []),
            );
            $data['files'] = array_values(array_unique([...$existingFiles, ...$uploadedFiles]));

            if (! $record->image && $uploadedFiles !== []) {
                $data['image'] = $uploadedFiles[0];
            }
        }

        return $replacedFiles;
    }

    /** @param array<int, string> $paths */
    private function deleteReplacedFiles(array $paths): void
    {
        if ($paths !== []) {
            Storage::disk('public')->delete($paths);
        }
    }

    private function storeProjectGallery(Request $request, string $resource, Model $record): void
    {
        if ($resource !== 'projects' || ! $record instanceof Project || ! $request->hasFile('gallery')) {
            return;
        }

        $nextOrder = (int) $record->images()->max('sort_order') + 1;
        foreach ($request->file('gallery', []) as $image) {
            $record->images()->create([
                'path' => $image->store('projects/gallery', 'public'),
                'alt_text' => $record->title.' screenshot',
                'sort_order' => $nextOrder++,
            ]);
        }
    }
}
