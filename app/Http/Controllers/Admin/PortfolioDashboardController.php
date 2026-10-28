<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\ContactMessage;
use App\Models\Experience;
use App\Models\Profile;
use App\Models\Project;
use App\Models\ProjectImage;
use App\Models\SiteSetting;
use App\Models\Skill;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Throwable;

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
            'audioSettings' => SiteSetting::query()->first(),
        ]);
    }

    public function updateAudioSettings(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ambient_audio' => [
                'nullable',
                'file',
                'mimes:mp3,m4a,ogg',
                'mimetypes:audio/mpeg,audio/mp4,audio/x-m4a,audio/ogg,application/ogg',
                'max:15360',
            ],
            'audio_volume' => ['required', 'integer', 'min:0', 'max:100'],
            'audio_enabled' => ['boolean'],
            'audio_loop' => ['boolean'],
        ]);
        $data['audio_enabled'] = $request->boolean('audio_enabled');
        $data['audio_loop'] = $request->boolean('audio_loop');

        $settings = SiteSetting::query()->firstOrCreate([], [
            'ambient_audio' => '/audio/portfolio-ambient.mp3',
            'audio_volume' => 50,
            'audio_enabled' => true,
            'audio_loop' => true,
        ]);
        $oldAudio = $settings->ambient_audio;
        $newAudio = null;

        if ($request->hasFile('ambient_audio')) {
            $newAudio = $this->storeUploadedFile($request->file('ambient_audio'), 'audio');
            $data['ambient_audio'] = $newAudio;
        } else {
            unset($data['ambient_audio']);
        }

        try {
            $settings->update($data);
        } catch (Throwable $exception) {
            if ($newAudio !== null) {
                Storage::disk('public')->delete($newAudio);
            }

            throw $exception;
        }

        if ($newAudio !== null && $oldAudio && ! str_starts_with($oldAudio, '/')) {
            Storage::disk('public')->delete($oldAudio);
        }

        return back()->with('success', 'Music settings updated successfully.');
    }

    public function destroyAmbientAudio(): RedirectResponse
    {
        $settings = SiteSetting::query()->firstOrFail();
        $path = $settings->ambient_audio;

        $settings->update([
            'ambient_audio' => null,
            'audio_enabled' => false,
        ]);

        if ($path && ! str_starts_with($path, '/')) {
            Storage::disk('public')->delete($path);
        }

        return back()->with('success', 'Music file deleted successfully.');
    }

    public function store(Request $request, string $resource): RedirectResponse
    {
        $model = $this->modelFor($resource);
        $data = $this->validated($request, $resource);
        if ($resource === 'projects' && ($data['is_published'] ?? false)) {
    $data['published_at'] = now();
}

        if ($resource === 'profile') {
            $data['user_id'] = $request->user()->id;
            $record = Profile::query()->firstOrNew(['user_id' => $request->user()->id]);
        } else {
            $record = new $model;
        }

        $this->assertUploadCapacity($request, $resource, $record);
        $newFiles = [];
        $replacedFiles = [];

        try {
            DB::transaction(function () use ($request, $resource, &$data, $record, &$newFiles, &$replacedFiles): void {
                $replacedFiles = $this->prepareUploads($request, $resource, $data, $record, $newFiles);
                $record->fill($data)->save();
                $this->storeProjectGallery($request, $resource, $record, $newFiles);
            });
        } catch (Throwable $exception) {
            $this->deleteReplacedFiles($newFiles);

            throw $exception;
        }

        $this->deleteReplacedFiles($replacedFiles);

        return back()->with('success', ucfirst($resource).' saved successfully.');
    }

    public function update(Request $request, string $resource, int $id): RedirectResponse
    {
        $record = $this->modelFor($resource)::query()->findOrFail($id);
        $data = $this->validated($request, $resource, $id);
        $this->assertUploadCapacity($request, $resource, $record);
        $newFiles = [];
        $replacedFiles = [];

        try {
            DB::transaction(function () use ($request, $resource, &$data, $record, &$newFiles, &$replacedFiles): void {
                $replacedFiles = $this->prepareUploads($request, $resource, $data, $record, $newFiles);
                $record->update($data);
                $this->storeProjectGallery($request, $resource, $record, $newFiles);
            });
        } catch (Throwable $exception) {
            $this->deleteReplacedFiles($newFiles);

            throw $exception;
        }

        $this->deleteReplacedFiles($replacedFiles);

        return back()->with('success', ucfirst($resource).' updated successfully.');
    }

    public function destroy(string $resource, int $id): RedirectResponse
    {
        abort_if($resource === 'profile', 405);
        $record = $this->modelFor($resource)::query()->findOrFail($id);
        $paths = [];

        if ($record instanceof Project) {
            $paths = [...$paths, ...$record->images()->pluck('path')->all()];
        }

        foreach (['image', 'photo', 'cv_file'] as $field) {
            $path = $record->getAttribute($field);
            if (is_string($path) && $path !== '') {
                $paths[] = $path;
            }
        }

        if ($record instanceof Certificate) {
            $paths = [...$paths, ...$this->certificateFiles($record)];
        }

        DB::transaction(fn () => $record->delete());
        $this->deleteReplacedFiles(array_values(array_unique($paths)));

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
        $path = $projectImage->path;
        $projectImage->delete();
        Storage::disk('public')->delete($path);

        return back()->with('success', 'Project screenshot deleted.');
    }

    public function destroyProjectCover(Project $project): RedirectResponse
    {
        if ($project->image) {
            $path = $project->image;
            $project->update(['image' => null]);
            Storage::disk('public')->delete($path);
        }

        return back()->with('success', 'Project cover deleted.');
    }

    public function destroyCertificateFile(Certificate $certificate, int $index): RedirectResponse
    {
        $files = $this->certificateFiles($certificate);
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

    public function destroyProfileMedia(Request $request, Profile $profile, string $field): RedirectResponse
    {
        abort_unless(in_array($field, ['photo', 'cv_file'], true), 404);
        abort_unless($profile->user_id === $request->user()->id, 403);

        $path = $profile->getAttribute($field);
        if (is_string($path) && $path !== '') {
            $profile->update([$field => null]);
            Storage::disk('public')->delete($path);
        }

        return back()->with('success', $field === 'photo' ? 'Profile photo deleted.' : 'CV deleted.');
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
                'whatsapp_url' => ['nullable', 'url', 'max:255'],
                'instagram_url' => ['nullable', 'url', 'max:255'],
                'tiktok_url' => ['nullable', 'url', 'max:255'],
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

        if ($resource === 'certificates'
            && $id === null
            && ! $request->hasFile('image')
            && ! $request->hasFile('files')) {
            throw ValidationException::withMessages([
                'files' => 'Upload at least one certificate image or PDF.',
            ]);
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

    /**
     * @param  array<string, mixed>  $data
     * @param  list<string>  $newFiles
     * @return list<string>
     */
    private function prepareUploads(Request $request, string $resource, array &$data, Model $record, array &$newFiles): array
    {
        $replacedFiles = [];

        foreach (['photo', 'cv_file', 'image'] as $field) {
            if ($resource === 'certificates' && $field === 'image') {
                continue;
            }

            if (! $request->hasFile($field)) {
                unset($data[$field]);

                continue;
            }

            $oldPath = $record->getAttribute($field);
            if (is_string($oldPath) && $oldPath !== '') {
                $replacedFiles[] = $oldPath;
            }

            $path = $this->storeUploadedFile($request->file($field), $resource);
            $data[$field] = $path;
            $newFiles[] = $path;
        }

        if ($resource === 'certificates' && $record instanceof Certificate) {
            $certificateFiles = $this->certificateFiles($record);

            if ($request->hasFile('image')) {
                $oldPrimary = $record->image;
                $newPrimary = $this->storeUploadedFile($request->file('image'), 'certificates');
                $newFiles[] = $newPrimary;

                if (is_string($oldPrimary) && $oldPrimary !== '') {
                    $certificateFiles = array_values(array_filter(
                        $certificateFiles,
                        fn (string $path): bool => $path !== $oldPrimary,
                    ));
                    $replacedFiles[] = $oldPrimary;
                }

                array_unshift($certificateFiles, $newPrimary);
                $data['image'] = $newPrimary;
            } else {
                unset($data['image']);
            }

            if ($request->hasFile('files')) {
                foreach ($request->file('files', []) as $file) {
                    $path = $this->storeUploadedFile($file, 'certificates');
                    $certificateFiles[] = $path;
                    $newFiles[] = $path;
                }
            }

            if ($request->hasFile('image') || $request->hasFile('files')) {
                $certificateFiles = array_values(array_unique($certificateFiles));
                $data['files'] = $certificateFiles;
                $data['image'] ??= $certificateFiles[0] ?? null;
            }
        }

        return array_values(array_unique($replacedFiles));
    }

    /** @param array<int, string> $paths */
    private function deleteReplacedFiles(array $paths): void
    {
        if ($paths !== []) {
            Storage::disk('public')->delete($paths);
        }
    }

    /** @param list<string> $newFiles */
    private function storeProjectGallery(Request $request, string $resource, Model $record, array &$newFiles): void
    {
        if ($resource !== 'projects' || ! $record instanceof Project || ! $request->hasFile('gallery')) {
            return;
        }

        $nextOrder = (int) $record->images()->max('sort_order') + 1;
        foreach ($request->file('gallery', []) as $image) {
            $path = $this->storeUploadedFile($image, 'projects/gallery');
            $newFiles[] = $path;
            $record->images()->create([
                'path' => $path,
                'alt_text' => $record->title.' screenshot',
                'sort_order' => $nextOrder++,
            ]);
        }
    }

    private function assertUploadCapacity(Request $request, string $resource, Model $record): void
    {
        if ($resource === 'projects' && $record instanceof Project) {
            $total = $record->images()->count() + count($request->file('gallery', []));

            if ($total > 8) {
                throw ValidationException::withMessages([
                    'gallery' => 'A project can contain a maximum of 8 gallery screenshots in total.',
                ]);
            }
        }

        if ($resource === 'certificates' && $record instanceof Certificate) {
            $existingFiles = $this->certificateFiles($record);
            $total = count($existingFiles) + count($request->file('files', []));

            if ($request->hasFile('image')) {
                $total += in_array($record->image, $existingFiles, true) ? 0 : 1;
            }

            if ($total > 8) {
                throw ValidationException::withMessages([
                    'files' => 'A certificate can contain a maximum of 8 files in total.',
                ]);
            }
        }
    }

    /** @return list<string> */
    private function certificateFiles(Certificate $certificate): array
    {
        return array_values(array_unique(array_filter(
            [$certificate->image, ...($certificate->files ?? [])],
            fn (mixed $path): bool => is_string($path) && $path !== '',
        )));
    }

    private function storeUploadedFile(UploadedFile $file, string $directory): string
    {
        $path = $file->store($directory, 'public');

        if ($path === false) {
            throw new RuntimeException('The uploaded file could not be stored.');
        }

        return $path;
    }
}
