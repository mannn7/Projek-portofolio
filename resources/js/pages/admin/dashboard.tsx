import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Briefcase,
    Database,
    FileBadge,
    FolderKanban,
    MailCheck,
    MailOpen,
    Music2,
    Pause,
    Play,
    Plus,
    Save,
    Search,
    Sparkles,
    Trash2,
    UserRound,
    Volume2,
    Settings2,
    Eye,
    EyeOff,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { PdfThumbnail } from '@/components/pdf-thumbnail';

type RecordData = Record<string, any> & { id?: number };

const primaryMediaFor = (item: RecordData): string | undefined =>
    item.image || item.photo || item.files?.[0] || undefined;
type Props = {
    statistics: Record<string, number>;
    profile: RecordData | null;
    projects: RecordData[];
    skills: RecordData[];
    experiences: RecordData[];
    certificates: RecordData[];
    contactMessages: RecordData[];
    audioSettings: RecordData | null;
};

const sections = [
    ['profile', 'Profile', UserRound],
    ['projects', 'Projects', FolderKanban],
    ['skills', 'Skills', Sparkles],
    ['experiences', 'Experience', Briefcase],
    ['certificates', 'Certificates', FileBadge],
    ['audio', 'Music', Music2],
    ['messages', 'Messages', MailOpen],
] as const;

const sectionDescriptions: Record<string, string> = {
    profile: 'Identitas, kontak, foto, dan CV yang tampil di portofolio.',
    projects: 'Kelola studi kasus serta status publikasi setiap proyek.',
    skills: 'Susun teknologi dan kemampuan yang mendukung profil profesional.',
    experiences: 'Catat pengalaman kerja, organisasi, atau proyek akademik.',
    certificates: 'Kelola kredensial beserta berkas gambar atau PDF.',
    audio: 'Ganti musik latar, atur volume, autoplay, dan pengulangan.',
    messages: 'Tinjau pesan yang masuk dari formulir kontak portofolio.',
};

const emptyData: Record<string, RecordData> = {
    profile: {
        name: '',
        headline: '',
        bio: '',
        email: '',
        github_url: '',
        linkedin_url: '',
        whatsapp_url: '',
        instagram_url: '',
        tiktok_url: '',
        location: '',
        available_for_work: true,
        photo: null,
        cv_file: null,
    },
    projects: {
        title: '',
        slug: '',
        description: '',
        content: '',
        problem: '',
        solution: '',
        role: '',
        outcome: '',
        category: '',
        technologies: '',
        github_url: '',
        demo_url: '',
        image: null,
        gallery: [],
        is_featured: false,
        is_published: false,
        sort_order: 0,
    },
    skills: {
        name: '',
        category: '',
        icon: '',
        sort_order: 0,
        is_active: true,
    },
    experiences: {
        role: '',
        company: '',
        location: '',
        started_at: '',
        ended_at: '',
        description: '',
        sort_order: 0,
        is_active: true,
    },
    certificates: {
        name: '',
        issuer: '',
        issued_at: '',
        credential_url: '',
        image: null,
        files: [],
        sort_order: 0,
        is_active: true,
    },
    audio: {
        ambient_audio: null,
        audio_volume: 50,
        audio_enabled: true,
        audio_loop: true,
    },
};

const fields: Record<string, Array<[string, string, string]>> = {
    profile: [
        ['name', 'Name', 'text'],
        ['headline', 'Headline', 'text'],
        ['email', 'Public email', 'email'],
        ['location', 'Location', 'text'],
        ['github_url', 'GitHub URL', 'url'],
        ['linkedin_url', 'LinkedIn URL', 'url'],
        ['whatsapp_url', 'WhatsApp URL', 'url'],
        ['instagram_url', 'Instagram URL', 'url'],
        ['tiktok_url', 'TikTok URL', 'url'],
        ['bio', 'Biography', 'textarea'],
        ['photo', 'Profile photo', 'file'],
        ['cv_file', 'CV (PDF)', 'file'],
    ],
    projects: [
        ['title', 'Project title', 'text'],
        ['slug', 'Slug', 'text'],
        ['category', 'Category', 'text'],
        ['technologies', 'Technologies (comma separated)', 'text'],
        ['github_url', 'GitHub URL', 'url'],
        ['demo_url', 'Demo URL', 'url'],
        ['description', 'Short description', 'textarea'],
        ['content', 'Full case study', 'textarea'],
        ['problem', 'Problem / context', 'textarea'],
        ['solution', 'Solution', 'textarea'],
        ['role', 'Your role', 'textarea'],
        ['outcome', 'Outcome / result', 'textarea'],
        ['image', 'Cover screenshot', 'file'],
        ['gallery', 'Gallery screenshots', 'multifile'],
        ['sort_order', 'Sort order', 'number'],
    ],
    skills: [
        ['name', 'Skill name', 'text'],
        ['category', 'Category', 'text'],
        ['icon', 'Icon label', 'text'],
        ['sort_order', 'Sort order', 'number'],
    ],
    experiences: [
        ['role', 'Role', 'text'],
        ['company', 'Company', 'text'],
        ['location', 'Location', 'text'],
        ['started_at', 'Start date', 'date'],
        ['ended_at', 'End date (empty = present)', 'date'],
        ['description', 'Description', 'textarea'],
        ['sort_order', 'Sort order', 'number'],
    ],
    certificates: [
        ['name', 'Certificate', 'text'],
        ['issuer', 'Issuer', 'text'],
        ['issued_at', 'Issue date', 'date'],
        ['credential_url', 'Credential URL', 'url'],
        ['files', 'Certificate files (images or PDFs)', 'certfiles'],
        ['sort_order', 'Sort order', 'number'],
    ],
    audio: [
        ['ambient_audio', 'Music file', 'audiofile'],
        ['audio_volume', 'Default volume', 'volume'],
    ],
};

const mediaUrl = (path?: unknown) =>
    typeof path === 'string' && path.length > 0
        ? path.startsWith('/')
            ? path
            : `/storage/${path}`
        : undefined;

const isPdfPath = (path?: string) => Boolean(path && /\.pdf$/i.test(path));

const formatAudioTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');

    return `${minutes}:${remainingSeconds}`;
};

function MusicPreview({
    source,
    label,
    volume,
    onRemove,
}: {
    source: string;
    label: string;
    volume: number;
    onRemove: () => void;
}) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
    }, [source]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) audio.volume = Math.min(1, Math.max(0, volume / 100));
    }, [volume]);

    const togglePlayback = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.paused) {
            void audio.play().catch(() => setIsPlaying(false));
        } else {
            audio.pause();
        }
    };

    return (
        <div className="mb-4 overflow-hidden rounded-2xl border border-violet-400/20 bg-[#111827] shadow-[0_16px_36px_rgba(6,8,20,.22)]">
            <audio
                ref={audioRef}
                src={source}
                preload="metadata"
                onLoadedMetadata={(event) =>
                    setDuration(event.currentTarget.duration)
                }
                onTimeUpdate={(event) =>
                    setCurrentTime(event.currentTarget.currentTime)
                }
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                    setIsPlaying(false);
                    setCurrentTime(0);
                }}
            />
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/35 to-indigo-500/15 text-violet-200 ring-1 ring-violet-300/15 ring-inset">
                        <Music2 size={18} />
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                            {label}
                        </p>
                        <p className="text-xs text-slate-500">
                            Preview volume follows the setting below.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    className="rounded-xl border border-rose-400/10 bg-rose-500/[0.07] p-2 text-rose-300 transition hover:border-rose-400/30 hover:bg-rose-500 hover:text-white"
                    aria-label="Remove music"
                >
                    <Trash2 size={16} />
                </button>
            </div>
            <div className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={togglePlayback}
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-500 text-white shadow-[0_8px_20px_rgba(124,58,237,.32)] transition hover:scale-105 hover:bg-violet-400 focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:outline-none"
                        aria-label={
                            isPlaying
                                ? 'Pause music preview'
                                : 'Play music preview'
                        }
                    >
                        {isPlaying ? (
                            <Pause size={16} fill="currentColor" />
                        ) : (
                            <Play size={16} fill="currentColor" />
                        )}
                    </button>
                    <span className="w-[72px] shrink-0 font-mono text-xs text-slate-300 tabular-nums">
                        {formatAudioTime(currentTime)} /{' '}
                        {formatAudioTime(duration)}
                    </span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.1"
                        value={Math.min(currentTime, duration || 0)}
                        onChange={(event) => {
                            const audio = audioRef.current;
                            const nextTime = Number(event.target.value);
                            if (audio) audio.currentTime = nextTime;
                            setCurrentTime(nextTime);
                        }}
                        className="admin-audio-range h-1.5 min-w-0 flex-1 cursor-pointer"
                        aria-label="Music progress"
                    />
                </div>
            </div>
        </div>
    );
}

function Editor({
    resource,
    initial,
    onDone,
}: {
    resource: string;
    initial: RecordData;
    onDone: () => void;
}) {
    const [previews, setPreviews] = useState<Record<string, string>>({});
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
    const objectUrls = useRef(new Set<string>());
    const normalized = {
        ...initial,
        technologies: Array.isArray(initial.technologies)
            ? initial.technologies.join(', ')
            : (initial.technologies ?? ''),
        // Existing media paths are previews, not new browser uploads. Keeping
        // them in form data makes Laravel validate a string as an image/file.
        photo: null,
        cv_file: null,
        image: null,
        ambient_audio: null,
        gallery: [],
        files: [],
    };
    const { data, setData, post, processing, errors } =
        useForm<RecordData>(normalized);
    const submit = (event: FormEvent) => {
        event.preventDefault();
        const endpoint =
            resource === 'audio'
                ? '/admin/audio-settings'
                : initial.id
                  ? `/admin/content/${resource}/${initial.id}`
                  : `/admin/content/${resource}`;
        post(endpoint, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Content saved successfully.');
                onDone();
            },
        });
    };
    useEffect(() => {
        const urls = objectUrls.current;

        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
            urls.clear();
        };
    }, []);

    const createObjectUrl = (file: File) => {
        const url = URL.createObjectURL(file);
        objectUrls.current.add(url);

        return url;
    };

    const revokeObjectUrl = (url?: string) => {
        if (!url || !objectUrls.current.has(url)) return;
        URL.revokeObjectURL(url);
        objectUrls.current.delete(url);
    };

    const selectFile = (name: string, file: File | null) => {
        setData(name, file);
        if (!file || name === 'cv_file') return;
        setPreviews((current) => {
            revokeObjectUrl(current[name]);
            return { ...current, [name]: createObjectUrl(file) };
        });
    };
    const selectMultipleFiles = (name: string, files: FileList | null) => {
        galleryPreviews.forEach(revokeObjectUrl);
        const existingCount =
            name === 'files'
                ? new Set(
                      [initial.image, ...(initial.files ?? [])].filter(Boolean),
                  ).size
                : (initial.images?.length ?? 0);
        const remainingSlots = Math.max(0, 8 - existingCount);
        const chosen = files ? Array.from(files) : [];
        const selected = chosen.slice(0, remainingSlots);

        if (chosen.length > remainingSlots) {
            toast.error(
                remainingSlots === 0
                    ? 'Delete an existing file before adding another one.'
                    : `Only ${remainingSlots} more file${remainingSlots === 1 ? '' : 's'} can be added.`,
            );
        }

        setData(name, selected);
        setGalleryPreviews(selected.map(createObjectUrl));
    };
    const clearSelectedFile = (name: string) => {
        revokeObjectUrl(previews[name]);
        setData(name, null);
        if (fileInputs.current[name]) fileInputs.current[name].value = '';
        setPreviews((current) => {
            const next = { ...current };
            delete next[name];

            return next;
        });
    };
    const removeSelectedMultipleFile = (name: string, index: number) => {
        revokeObjectUrl(galleryPreviews[index]);
        setData(
            name,
            ((data[name] as File[] | undefined) ?? []).filter(
                (_, fileIndex) => fileIndex !== index,
            ),
        );
        if (fileInputs.current[name]) fileInputs.current[name].value = '';
        setGalleryPreviews((current) =>
            current.filter((_, fileIndex) => fileIndex !== index),
        );
    };
    const certificateFiles = Array.from(
        new Set(
            [initial.image, ...(initial.files ?? [])].filter(
                (path): path is string => Boolean(path),
            ),
        ),
    );
    const toggles =
        resource === 'profile'
            ? [['available_for_work', 'Available for work']]
            : resource === 'audio'
              ? [
                    ['audio_enabled', 'Autoplay music'],
                    ['audio_loop', 'Loop continuously'],
                ]
              : resource === 'projects'
                ? [
                      ['is_featured', 'Featured'],
                      ['is_published', 'Published'],
                  ]
                : [['is_active', 'Active']];
    const editorLabel =
        resource === 'audio'
            ? 'Portfolio music settings'
            : initial.title || initial.name || initial.role || initial.subject;

    return (
        <form
            onSubmit={submit}
            className="grid gap-5 rounded-[1.75rem] border border-white/10 bg-[#0d121e]/88 p-5 shadow-[0_24px_80px_rgba(0,0,0,.22)] sm:p-7 lg:grid-cols-2"
        >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/8 pb-5 lg:col-span-2">
                <div>
                    <p className="font-mono text-[10px] tracking-[.24em] text-violet-300 uppercase">
                        {initial.id ? 'Edit content' : 'New content'}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
                        {editorLabel || `Add ${resource.replace(/s$/, '')}`}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Periksa kembali informasi sebelum menyimpan perubahan.
                    </p>
                </div>
                {resource !== 'audio' && (
                    <button
                        type="button"
                        onClick={onDone}
                        className="admin-ghost"
                    >
                        Cancel
                    </button>
                )}
            </div>
            {fields[resource].map(([name, label, type]) => (
                <label
                    key={name}
                    className={
                        type === 'textarea' || type === 'audiofile'
                            ? 'lg:col-span-2'
                            : ''
                    }
                >
                    <span className="mb-2 block text-xs font-semibold tracking-[.18em] text-slate-400 uppercase">
                        {label}
                    </span>
                    {type === 'volume' ? (
                        <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                            <Volume2 className="size-4 shrink-0 text-violet-300" />
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={data[name] ?? 50}
                                onChange={(event) =>
                                    setData(name, Number(event.target.value))
                                }
                                className="admin-audio-range h-1.5 w-full cursor-pointer"
                                aria-label="Music volume"
                            />
                            <output className="w-12 text-right font-mono text-xs text-violet-200">
                                {data[name] ?? 50}%
                            </output>
                        </div>
                    ) : type === 'textarea' ? (
                        <textarea
                            rows={name === 'content' || name === 'bio' ? 6 : 3}
                            value={data[name] ?? ''}
                            onChange={(e) => setData(name, e.target.value)}
                            className="admin-input resize-y"
                        />
                    ) : type === 'file' ||
                      type === 'multifile' ||
                      type === 'certfiles' ||
                      type === 'audiofile' ? (
                        <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 transition focus-within:border-violet-400/40">
                            {type === 'audiofile' &&
                                (previews[name] || mediaUrl(initial[name])) && (
                                    <MusicPreview
                                        source={
                                            previews[name] ||
                                            mediaUrl(initial[name]) ||
                                            ''
                                        }
                                        label={
                                            previews[name]
                                                ? 'New music preview'
                                                : 'Current portfolio music'
                                        }
                                        volume={Number(data.audio_volume ?? 50)}
                                        onRemove={() => {
                                            if (previews[name]) {
                                                clearSelectedFile(name);
                                                return;
                                            }

                                            router.delete(
                                                '/admin/audio-settings/file',
                                                {
                                                    preserveScroll: true,
                                                    onSuccess: () => {
                                                        toast.success(
                                                            'Music file deleted.',
                                                        );
                                                        onDone();
                                                    },
                                                },
                                            );
                                        }}
                                    />
                                )}
                            {type === 'file' &&
                                name !== 'cv_file' &&
                                !(
                                    resource === 'certificates' &&
                                    ((data[name] instanceof File &&
                                        data[name].type ===
                                            'application/pdf') ||
                                        (!previews[name] &&
                                            isPdfPath(initial[name])))
                                ) &&
                                (previews[name] || mediaUrl(initial[name])) && (
                                    <div className="group/file relative mb-4 aspect-video overflow-hidden rounded-xl">
                                        <img
                                            src={
                                                previews[name] ||
                                                mediaUrl(initial[name])
                                            }
                                            alt={`${label} preview`}
                                            className="h-full w-full object-cover"
                                        />
                                        {(previews[name] ||
                                            ((resource === 'projects' ||
                                                resource === 'profile') &&
                                                initial.id)) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (previews[name]) {
                                                        clearSelectedFile(name);
                                                        return;
                                                    }

                                                    const endpoint =
                                                        resource === 'profile'
                                                            ? `/admin/profiles/${initial.id}/media/${name}`
                                                            : `/admin/projects/${initial.id}/cover`;

                                                    router.delete(endpoint, {
                                                        preserveScroll: true,
                                                        onSuccess: () => {
                                                            toast.success(
                                                                resource ===
                                                                    'profile'
                                                                    ? 'Profile photo deleted.'
                                                                    : 'Cover screenshot deleted.',
                                                            );
                                                            onDone();
                                                        },
                                                    });
                                                }}
                                                className="absolute top-2 right-2 rounded-lg bg-black/80 p-2 text-rose-300 shadow-lg transition hover:bg-rose-500 hover:text-white"
                                                aria-label={
                                                    previews[name]
                                                        ? `Remove selected ${label}`
                                                        : `Delete current ${label}`
                                                }
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            {resource === 'certificates' &&
                                name === 'image' &&
                                ((data[name] instanceof File &&
                                    data[name].type === 'application/pdf') ||
                                    (!previews[name] &&
                                        isPdfPath(initial[name]))) && (
                                    <div className="relative mb-4 aspect-video overflow-hidden rounded-xl border border-violet-400/20 bg-white">
                                        <PdfThumbnail
                                            src={
                                                previews[name] ||
                                                mediaUrl(initial[name])!
                                            }
                                            title="Certificate PDF preview"
                                            className="pointer-events-none h-full w-full"
                                        />
                                        <a
                                            href={
                                                previews[name] ||
                                                mediaUrl(initial[name])
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="absolute right-3 bottom-3 rounded-full border border-white/20 bg-slate-950/85 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur transition hover:bg-violet-600"
                                        >
                                            Open full PDF
                                        </a>
                                    </div>
                                )}
                            {name === 'cv_file' && initial.cv_file && (
                                <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                    <a
                                        href={mediaUrl(initial.cv_file)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-violet-300 hover:text-white"
                                    >
                                        View current CV ↗
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.delete(
                                                `/admin/profiles/${initial.id}/media/cv_file`,
                                                {
                                                    preserveScroll: true,
                                                    onSuccess: () => {
                                                        toast.success(
                                                            'CV deleted.',
                                                        );
                                                        onDone();
                                                    },
                                                },
                                            )
                                        }
                                        className="rounded-lg bg-black/60 p-2 text-rose-300 transition hover:bg-rose-500 hover:text-white"
                                        aria-label="Delete current CV"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                            {type === 'multifile' &&
                                galleryPreviews.length > 0 && (
                                    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {galleryPreviews.map(
                                            (preview, index) => (
                                                <div
                                                    key={preview}
                                                    className="group/file relative aspect-video overflow-hidden rounded-lg"
                                                >
                                                    <img
                                                        src={preview}
                                                        alt={`New screenshot ${index + 1}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeSelectedMultipleFile(
                                                                name,
                                                                index,
                                                            )
                                                        }
                                                        className="absolute top-2 right-2 rounded-lg bg-black/80 p-2 text-rose-300 shadow-lg transition hover:bg-rose-500 hover:text-white"
                                                        aria-label={`Remove selected screenshot ${index + 1}`}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            {type === 'multifile' &&
                                initial.images?.length > 0 && (
                                    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {initial.images.map(
                                            (image: RecordData) => (
                                                <div
                                                    key={image.id}
                                                    className="group relative"
                                                >
                                                    <img
                                                        src={mediaUrl(
                                                            image.path,
                                                        )}
                                                        alt={
                                                            image.alt_text ||
                                                            'Project screenshot'
                                                        }
                                                        className="aspect-video w-full rounded-lg object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.delete(
                                                                `/admin/project-images/${image.id}`,
                                                                {
                                                                    preserveScroll: true,
                                                                    onSuccess:
                                                                        () => {
                                                                            toast.success(
                                                                                'Screenshot deleted.',
                                                                            );
                                                                            onDone();
                                                                        },
                                                                },
                                                            )
                                                        }
                                                        className="absolute top-2 right-2 rounded-lg bg-black/75 p-2 text-rose-300 transition hover:bg-rose-500 hover:text-white"
                                                        aria-label="Delete screenshot"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            {type === 'certfiles' && (
                                <div className="mb-4 grid gap-3 sm:grid-cols-2">
                                    {certificateFiles.map((path, index) => (
                                        <div
                                            key={path}
                                            className="group/file relative aspect-[1.414/1] overflow-hidden rounded-xl border border-white/10 bg-white"
                                        >
                                            <a
                                                href={mediaUrl(path)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block h-full w-full"
                                            >
                                                {isPdfPath(path) ? (
                                                    <PdfThumbnail
                                                        src={mediaUrl(path)!}
                                                        title={`Certificate file ${index + 1}`}
                                                        className="h-full w-full"
                                                    />
                                                ) : (
                                                    <img
                                                        src={mediaUrl(path)}
                                                        alt={`Certificate file ${index + 1}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                )}
                                            </a>
                                            {certificateFiles.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.delete(
                                                            `/admin/certificates/${initial.id}/files/${index}`,
                                                            {
                                                                preserveScroll: true,
                                                                onSuccess:
                                                                    () => {
                                                                        toast.success(
                                                                            'Certificate file deleted.',
                                                                        );
                                                                        onDone();
                                                                    },
                                                            },
                                                        )
                                                    }
                                                    className="absolute top-2 right-2 rounded-lg bg-black/80 p-2 text-rose-300 opacity-100 shadow-lg transition hover:bg-rose-500 hover:text-white focus:opacity-100 sm:opacity-0 sm:group-hover/file:opacity-100"
                                                    aria-label={`Delete certificate file ${index + 1}`}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            {certificateFiles.length === 1 && (
                                                <span className="pointer-events-none absolute right-2 bottom-2 rounded-md bg-black/75 px-2 py-1 text-[10px] text-slate-300">
                                                    Upload a replacement before
                                                    deleting
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                    {galleryPreviews.map((preview, index) => (
                                        <div
                                            key={preview}
                                            className="group/file relative aspect-[1.414/1] overflow-hidden rounded-xl border border-violet-400/20 bg-white"
                                        >
                                            {data.files[index]?.type ===
                                            'application/pdf' ? (
                                                <PdfThumbnail
                                                    src={preview}
                                                    title={`New certificate file ${index + 1}`}
                                                    className="h-full w-full"
                                                />
                                            ) : (
                                                <img
                                                    src={preview}
                                                    alt={`New certificate file ${index + 1}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeSelectedMultipleFile(
                                                        name,
                                                        index,
                                                    )
                                                }
                                                className="absolute top-2 right-2 rounded-lg bg-black/80 p-2 text-rose-300 opacity-100 shadow-lg transition hover:bg-rose-500 hover:text-white focus:opacity-100 sm:opacity-0 sm:group-hover/file:opacity-100"
                                                aria-label={`Remove new certificate file ${index + 1}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <input
                                ref={(input) => {
                                    fileInputs.current[name] = input;
                                }}
                                type="file"
                                multiple={
                                    type === 'multifile' || type === 'certfiles'
                                }
                                accept={
                                    type === 'audiofile'
                                        ? 'audio/mpeg,audio/mp4,audio/x-m4a,audio/ogg,application/ogg,.mp3,.m4a,.ogg'
                                        : name === 'cv_file'
                                          ? '.pdf'
                                          : type === 'certfiles'
                                            ? 'image/jpeg,image/png,image/webp,application/pdf'
                                            : 'image/jpeg,image/png,image/webp'
                                }
                                onChange={(event) =>
                                    type === 'multifile' || type === 'certfiles'
                                        ? selectMultipleFiles(
                                              name,
                                              event.target.files,
                                          )
                                        : selectFile(
                                              name,
                                              event.target.files?.[0] ?? null,
                                          )
                                }
                                className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-500/15 file:px-4 file:py-2 file:font-semibold file:text-violet-200 hover:file:bg-violet-500/25"
                            />
                            <p className="mt-3 text-xs text-slate-600">
                                {type === 'audiofile'
                                    ? 'MP3, M4A, or OGG · maximum 15 MB. Uploading a new file replaces the current music.'
                                    : type === 'multifile'
                                      ? 'Up to 8 images · minimum 1000×500 each · maximum 6 MB each.'
                                      : name === 'cv_file'
                                        ? 'PDF only, maximum 10 MB.'
                                        : name === 'photo'
                                          ? 'JPG, PNG or WebP · minimum 500×500 · maximum 4 MB.'
                                          : resource === 'certificates'
                                            ? 'Choose up to 8 JPG, PNG, WebP or PDF files · maximum 8 MB each.'
                                            : resource === 'projects'
                                              ? 'JPG, PNG or WebP · minimum 1000×500 · maximum 6 MB.'
                                              : 'JPG, PNG or WebP · minimum 600×400 · maximum 4 MB.'}
                            </p>
                        </div>
                    ) : (
                        <input
                            type={type}
                            value={data[name] ?? ''}
                            onChange={(e) =>
                                setData(
                                    name,
                                    type === 'number'
                                        ? Number(e.target.value)
                                        : e.target.value,
                                )
                            }
                            className="admin-input"
                        />
                    )}
                    {errors[name] && (
                        <span className="mt-1 block text-xs text-rose-400">
                            {errors[name]}
                        </span>
                    )}
                </label>
            ))}
            <div className="flex flex-wrap items-center gap-5 lg:col-span-2">
                {toggles.map(([name, label]) => (
                    <label
                        key={name}
                        className="flex items-center gap-2 text-sm text-slate-300"
                    >
                        <input
                            type="checkbox"
                            checked={Boolean(data[name])}
                            onChange={(e) => setData(name, e.target.checked)}
                            className="size-4 accent-violet-500"
                        />
                        {label}
                    </label>
                ))}
            </div>
            <div className="flex gap-3 lg:col-span-2">
                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 px-5 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,.2)] transition hover:from-violet-400 hover:to-violet-500 disabled:opacity-50"
                >
                    <Save size={17} />
                    {processing ? 'Saving…' : 'Save changes'}
                </button>
                {resource !== 'audio' && (
                    <button
                        type="button"
                        onClick={onDone}
                        className="rounded-xl border border-white/10 px-5 py-3 text-slate-300 hover:bg-white/5"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}

export default function AdminDashboard(props: Props) {
    const [active, setActive] = useState('profile');
    const [editing, setEditing] = useState<RecordData | null>(null);
    const [query, setQuery] = useState('');
    const [projectStatus, setProjectStatus] = useState('all');
    const [deleting, setDeleting] = useState<RecordData | null>(null);
    const records = useMemo(
        () =>
            active === 'messages'
                ? props.contactMessages
                : active === 'audio'
                  ? [props.audioSettings ?? emptyData.audio]
                  : active === 'profile'
                    ? props.profile
                        ? [props.profile]
                        : []
                    : ((props[active as keyof Props] as RecordData[]) ?? []),
        [active, props],
    );
    const filteredRecords = useMemo(
        () =>
            records.filter((item) => {
                const haystack = [
                    item.title,
                    item.name,
                    item.role,
                    item.company,
                    item.category,
                    item.issuer,
                    item.email,
                    item.subject,
                    item.message,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                const matchesQuery = haystack.includes(query.toLowerCase());
                const matchesStatus =
                    active !== 'projects' ||
                    projectStatus === 'all' ||
                    (projectStatus === 'published'
                        ? item.is_published
                        : !item.is_published);

                return matchesQuery && matchesStatus;
            }),
        [active, projectStatus, query, records],
    );
    const titleFor = (item: RecordData) =>
        item.title || item.subject || item.name || item.role || 'Message';
    const remove = () => {
        if (!deleting) return;
        const url =
            active === 'messages'
                ? `/admin/messages/${deleting.id}`
                : `/admin/content/${active}/${deleting.id}`;
        router.delete(url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Content deleted.');
                setDeleting(null);
            },
        });
    };
    const toggleProject = (item: RecordData) =>
        router.patch(
            `/admin/projects/${item.id}/toggle`,
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(
                        item.is_published
                            ? 'Project moved to draft.'
                            : 'Project published.',
                    ),
            },
        );
    const toggleMessageRead = (item: RecordData) =>
        router.patch(
            `/admin/messages/${item.id}/read`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Message status updated.'),
            },
        );

    return (
        <div className="admin-shell relative min-h-screen overflow-x-hidden bg-[#070a12] text-slate-200">
            <Head title="FA.DEV Admin" />
            <div className="admin-grid pointer-events-none fixed inset-0" />
            <div className="pointer-events-none fixed -top-48 right-[12%] size-[32rem] rounded-full bg-violet-600/10 blur-[150px]" />
            <header className="sticky top-0 z-30 border-b border-white/8 bg-[#080c15]/85 backdrop-blur-2xl">
                <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300 shadow-[0_0_30px_rgba(139,92,246,.12)]">
                            <Database size={17} />
                        </div>
                        <div>
                            <p className="font-black tracking-tight text-white">
                                FA<span className="text-violet-400">.DEV</span>
                            </p>
                            <p className="text-[11px] text-slate-500">
                                Portfolio control room
                            </p>
                        </div>
                        <span className="ml-3 hidden items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1 text-[10px] font-semibold tracking-wide text-emerald-300 uppercase md:inline-flex">
                            <span className="size-1.5 rounded-full bg-emerald-300" />
                            System ready
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/" className="admin-ghost">
                            <ArrowLeft size={16} />
                            <span className="hidden sm:inline">View site</span>
                        </Link>
                        <Link href="/settings/profile" className="admin-ghost">
                            <Settings2 size={16} />
                            <span className="hidden sm:inline">Account</span>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="relative mx-auto grid max-w-[1480px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:py-9">
                <aside className="lg:sticky lg:top-28 lg:self-start">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-2 backdrop-blur-xl lg:p-3">
                        <div className="mb-2 hidden px-3 pt-2 lg:block">
                            <p className="font-mono text-[10px] tracking-[.22em] text-slate-600 uppercase">
                                Workspace
                            </p>
                        </div>
                        <nav
                            className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
                            aria-label="Admin sections"
                        >
                            {sections.map(([key, label, Icon]) => {
                                const count =
                                    key === 'profile'
                                        ? Number(Boolean(props.profile))
                                        : key === 'audio'
                                          ? Number(
                                                Boolean(
                                                    props.audioSettings
                                                        ?.ambient_audio,
                                                ),
                                            )
                                          : (props.statistics[key] ?? 0);

                                return (
                                    <button
                                        type="button"
                                        key={key}
                                        onClick={() => {
                                            setActive(key);
                                            setEditing(null);
                                            setQuery('');
                                            setProjectStatus('all');
                                        }}
                                        className={`group flex shrink-0 items-center justify-between gap-5 rounded-xl border px-3.5 py-3 text-sm transition lg:w-full ${active === key ? 'border-violet-400/25 bg-gradient-to-r from-violet-500/20 to-cyan-400/[0.06] text-white shadow-[inset_3px_0_0_#8b5cf6]' : 'border-transparent text-slate-500 hover:border-white/8 hover:bg-white/[0.035] hover:text-slate-200'}`}
                                        aria-current={
                                            active === key ? 'page' : undefined
                                        }
                                    >
                                        <span className="flex items-center gap-3">
                                            <Icon
                                                className={
                                                    active === key
                                                        ? 'text-violet-300'
                                                        : 'transition group-hover:text-slate-300'
                                                }
                                                size={17}
                                            />
                                            {label}
                                        </span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] ${active === key ? 'bg-violet-400/15 text-violet-200' : 'bg-white/[0.035] text-slate-600'}`}
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                        <div className="mt-3 hidden border-t border-white/8 px-3 pt-4 pb-2 lg:block">
                            <p className="text-xs leading-5 text-slate-600">
                                Semua perubahan tersimpan langsung ke CMS
                                portofolio.
                            </p>
                        </div>
                    </div>
                </aside>
                <section className="min-w-0">
                    <div className="relative mb-6 overflow-hidden rounded-[1.75rem] border border-white/8 bg-gradient-to-br from-white/[0.055] to-white/[0.018] p-5 sm:p-7">
                        <div className="pointer-events-none absolute top-0 right-0 h-40 w-64 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,.14),transparent_65%)]" />
                        <div className="relative flex flex-wrap items-end justify-between gap-5">
                            <div>
                                <p className="font-mono text-[10px] tracking-[.25em] text-violet-300 uppercase">
                                    Content management
                                </p>
                                <h1 className="mt-2 text-3xl font-bold tracking-[-.035em] text-white sm:text-4xl">
                                    {
                                        sections.find(
                                            ([key]) => key === active,
                                        )?.[1]
                                    }
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                    {sectionDescriptions[active]}
                                </p>
                            </div>
                            {active !== 'profile' &&
                                active !== 'audio' &&
                                active !== 'messages' &&
                                !editing && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditing({ ...emptyData[active] })
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_12px_30px_rgba(255,255,255,.08)] transition hover:bg-violet-100"
                                    >
                                        <Plus size={17} />
                                        Add new
                                    </button>
                                )}
                        </div>
                    </div>
                    {(active === 'audio' ||
                        editing ||
                        (active === 'profile' && records.length === 0)) && (
                        <Editor
                            resource={active}
                            initial={
                                active === 'audio'
                                    ? (props.audioSettings ?? emptyData.audio)
                                    : (editing ?? emptyData.profile)
                            }
                            onDone={() => setEditing(null)}
                        />
                    )}
                    {!editing &&
                        records.length > 0 &&
                        active !== 'profile' &&
                        active !== 'audio' && (
                            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-3 sm:flex-row">
                                <label className="relative flex-1">
                                    <Search
                                        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-600"
                                        size={17}
                                    />
                                    <span className="sr-only">
                                        Search content
                                    </span>
                                    <input
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                        placeholder={`Search ${active}…`}
                                        className="admin-input pl-10"
                                    />
                                </label>
                                {active === 'projects' && (
                                    <select
                                        value={projectStatus}
                                        onChange={(event) =>
                                            setProjectStatus(event.target.value)
                                        }
                                        className="admin-input sm:w-44"
                                        aria-label="Filter project status"
                                    >
                                        <option value="all">All status</option>
                                        <option value="published">
                                            Published
                                        </option>
                                        <option value="draft">Draft</option>
                                    </select>
                                )}
                            </div>
                        )}
                    {!editing && records.length > 0 && active !== 'audio' && (
                        <div className="space-y-3">
                            {filteredRecords.map((item) => (
                                <article
                                    key={item.id}
                                    className="group flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-white/8 bg-[#0d121d]/75 p-4 transition hover:-translate-y-0.5 hover:border-violet-400/20 hover:bg-[#101625] sm:flex-row sm:items-center sm:p-5"
                                >
                                    <div className="flex min-w-0 items-center gap-4">
                                        {primaryMediaFor(item) &&
                                        isPdfPath(primaryMediaFor(item)) ? (
                                            <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                                                <FileBadge size={23} />
                                                <span className="mt-0.5 text-[9px] font-bold tracking-wider">
                                                    PDF
                                                </span>
                                            </div>
                                        ) : primaryMediaFor(item) ? (
                                            <img
                                                src={mediaUrl(
                                                    primaryMediaFor(item),
                                                )}
                                                alt=""
                                                className="size-14 shrink-0 rounded-xl object-cover"
                                            />
                                        ) : item.name && item.issuer ? (
                                            <div
                                                className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-300"
                                                title="No certificate file uploaded"
                                            >
                                                <FileBadge size={23} />
                                            </div>
                                        ) : null}
                                        <div className="min-w-0">
                                            <h2 className="font-semibold text-white">
                                                {titleFor(item)}
                                            </h2>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {item.category ||
                                                    item.company ||
                                                    item.issuer ||
                                                    item.email ||
                                                    item.headline ||
                                                    'Portfolio content'}
                                            </p>
                                            {active === 'messages' && (
                                                <p className="mt-3 max-w-2xl text-sm leading-6 whitespace-pre-line text-slate-300">
                                                    {item.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap justify-end gap-2">
                                        {active === 'projects' && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleProject(item)
                                                }
                                                className={`admin-ghost ${item.is_published ? 'text-emerald-300' : ''}`}
                                                title={
                                                    item.is_published
                                                        ? 'Move to draft'
                                                        : 'Publish project'
                                                }
                                            >
                                                {item.is_published ? (
                                                    <Eye size={16} />
                                                ) : (
                                                    <EyeOff size={16} />
                                                )}
                                                <span className="hidden xl:inline">
                                                    {item.is_published
                                                        ? 'Published'
                                                        : 'Draft'}
                                                </span>
                                            </button>
                                        )}
                                        {active === 'messages' && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleMessageRead(item)
                                                }
                                                className={`admin-ghost ${item.read_at ? 'text-slate-400' : 'text-emerald-300'}`}
                                            >
                                                <MailCheck size={16} />
                                                {item.read_at
                                                    ? 'Mark unread'
                                                    : 'Mark read'}
                                            </button>
                                        )}
                                        {active !== 'messages' && (
                                            <button
                                                type="button"
                                                onClick={() => setEditing(item)}
                                                className="admin-ghost"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        {active !== 'profile' && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeleting(item)
                                                }
                                                className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10"
                                                aria-label={`Delete ${titleFor(item)}`}
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                    {!editing &&
                        records.length > 0 &&
                        filteredRecords.length === 0 && (
                            <div className="rounded-3xl border border-dashed border-white/15 p-12 text-center text-slate-500">
                                No content matches your search.
                            </div>
                        )}
                    {!editing &&
                        records.length === 0 &&
                        active !== 'profile' &&
                        active !== 'audio' && (
                            <div className="rounded-3xl border border-dashed border-white/15 p-14 text-center text-slate-500">
                                No {active} yet. Add only verified, real
                                portfolio content.
                            </div>
                        )}
                </section>
            </main>
            <Dialog
                open={Boolean(deleting)}
                onOpenChange={(open) => !open && setDeleting(null)}
            >
                <DialogContent className="border-white/10 bg-[#101522] text-white">
                    <DialogHeader>
                        <DialogTitle>
                            Delete {deleting ? titleFor(deleting) : 'content'}?
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            This permanently removes the database record and its
                            uploaded media. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => setDeleting(null)}
                            className="admin-ghost"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={remove}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400"
                        >
                            <Trash2 size={16} /> Delete permanently
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
