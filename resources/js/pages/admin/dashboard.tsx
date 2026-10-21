import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Briefcase,
    FileBadge,
    FolderKanban,
    LogOut,
    MailCheck,
    MailOpen,
    Plus,
    Save,
    Search,
    Sparkles,
    Trash2,
    UserRound,
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
};

const sections = [
    ['profile', 'Profile', UserRound],
    ['projects', 'Projects', FolderKanban],
    ['skills', 'Skills', Sparkles],
    ['experiences', 'Experience', Briefcase],
    ['certificates', 'Certificates', FileBadge],
    ['messages', 'Messages', MailOpen],
] as const;

const emptyData: Record<string, RecordData> = {
    profile: {
        name: '',
        headline: '',
        bio: '',
        email: '',
        github_url: '',
        linkedin_url: '',
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
};

const fields: Record<string, Array<[string, string, string]>> = {
    profile: [
        ['name', 'Name', 'text'],
        ['headline', 'Headline', 'text'],
        ['email', 'Public email', 'email'],
        ['location', 'Location', 'text'],
        ['github_url', 'GitHub URL', 'url'],
        ['linkedin_url', 'LinkedIn URL', 'url'],
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
};

const mediaUrl = (path?: unknown) =>
    typeof path === 'string' && path.length > 0
        ? path.startsWith('/')
            ? path
            : `/storage/${path}`
        : undefined;

const isPdfPath = (path?: string) => Boolean(path && /\.pdf$/i.test(path));

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
        gallery: [],
        files: [],
    };
    const { data, setData, post, processing, errors } =
        useForm<RecordData>(normalized);
    const submit = (event: FormEvent) => {
        event.preventDefault();
        const endpoint = initial.id
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
    useEffect(
        () => () => {
            Object.values(previews).forEach((preview) =>
                URL.revokeObjectURL(preview),
            );
            galleryPreviews.forEach((preview) => URL.revokeObjectURL(preview));
        },
        [galleryPreviews, previews],
    );

    const selectFile = (name: string, file: File | null) => {
        setData(name, file);
        if (!file || name === 'cv_file') return;
        setPreviews((current) => {
            if (current[name]) URL.revokeObjectURL(current[name]);
            return { ...current, [name]: URL.createObjectURL(file) };
        });
    };
    const selectMultipleFiles = (name: string, files: FileList | null) => {
        galleryPreviews.forEach((preview) => URL.revokeObjectURL(preview));
        const selected = files ? Array.from(files).slice(0, 8) : [];
        setData(name, selected);
        setGalleryPreviews(selected.map((file) => URL.createObjectURL(file)));
    };
    const clearSelectedFile = (name: string) => {
        if (previews[name]) URL.revokeObjectURL(previews[name]);
        setData(name, null);
        if (fileInputs.current[name]) fileInputs.current[name].value = '';
        setPreviews((current) => {
            const next = { ...current };
            delete next[name];

            return next;
        });
    };
    const removeSelectedMultipleFile = (name: string, index: number) => {
        URL.revokeObjectURL(galleryPreviews[index]);
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
            : resource === 'projects'
              ? [
                    ['is_featured', 'Featured'],
                    ['is_published', 'Published'],
                ]
              : [['is_active', 'Active']];

    return (
        <form
            onSubmit={submit}
            className="grid gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 lg:grid-cols-2"
        >
            {fields[resource].map(([name, label, type]) => (
                <label
                    key={name}
                    className={type === 'textarea' ? 'lg:col-span-2' : ''}
                >
                    <span className="mb-2 block text-xs font-semibold tracking-[.18em] text-slate-400 uppercase">
                        {label}
                    </span>
                    {type === 'textarea' ? (
                        <textarea
                            rows={name === 'content' || name === 'bio' ? 6 : 3}
                            value={data[name] ?? ''}
                            onChange={(e) => setData(name, e.target.value)}
                            className="admin-input resize-y"
                        />
                    ) : type === 'file' ||
                      type === 'multifile' ||
                      type === 'certfiles' ? (
                        <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-4">
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
                                            (resource === 'projects' &&
                                                name === 'image' &&
                                                initial.id)) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (previews[name]) {
                                                        clearSelectedFile(name);
                                                        return;
                                                    }

                                                    router.delete(
                                                        `/admin/projects/${initial.id}/cover`,
                                                        {
                                                            preserveScroll: true,
                                                            onSuccess: () =>
                                                                toast.success(
                                                                    'Cover screenshot deleted.',
                                                                ),
                                                        },
                                                    );
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
                                <a
                                    href={mediaUrl(initial.cv_file)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mb-4 block text-sm text-violet-300 hover:text-white"
                                >
                                    View current CV â†—
                                </a>
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
                                                                        () =>
                                                                            toast.success(
                                                                                'Screenshot deleted.',
                                                                            ),
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
                                    name === 'cv_file'
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
                                {type === 'multifile'
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
                    disabled={processing}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 font-semibold text-white hover:bg-violet-400 disabled:opacity-50"
                >
                    <Save size={17} />
                    {processing ? 'Saving…' : 'Save changes'}
                </button>
                <button
                    type="button"
                    onClick={onDone}
                    className="rounded-xl border border-white/10 px-5 py-3 text-slate-300 hover:bg-white/5"
                >
                    Cancel
                </button>
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
        <div className="min-h-screen bg-[#070a12] text-slate-200">
            <Head title="FA.DEV Admin" />
            <header className="border-b border-white/10 bg-[#0b0f1a]/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
                    <div>
                        <p className="font-black tracking-tight text-white">
                            FA<span className="text-violet-400">.DEV</span>
                        </p>
                        <p className="text-xs text-slate-500">
                            Portfolio control room
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/" className="admin-ghost">
                            <ArrowLeft size={16} />
                            View site
                        </Link>
                        <Link href="/settings/profile" className="admin-ghost">
                            <LogOut size={16} />
                            Account
                        </Link>
                    </div>
                </div>
            </header>
            <main className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[230px_1fr]">
                <aside className="space-y-2">
                    {sections.map(([key, label, Icon]) => (
                        <button
                            key={key}
                            onClick={() => {
                                setActive(key);
                                setEditing(null);
                                setQuery('');
                                setProjectStatus('all');
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition ${active === key ? 'bg-violet-500 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <span className="flex items-center gap-3">
                                <Icon size={17} />
                                {label}
                            </span>
                            <span className="text-xs opacity-70">
                                {key === 'profile'
                                    ? Number(Boolean(props.profile))
                                    : (props.statistics[key] ??
                                      props.statistics[
                                          key.replace(
                                              'experiences',
                                              'experiences',
                                          )
                                      ] ??
                                      0)}
                            </span>
                        </button>
                    ))}
                </aside>
                <section>
                    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold tracking-[.22em] text-violet-400 uppercase">
                                Content management
                            </p>
                            <h1 className="mt-2 text-3xl font-bold text-white">
                                {sections.find(([key]) => key === active)?.[1]}
                            </h1>
                        </div>
                        {active !== 'profile' &&
                            active !== 'messages' &&
                            !editing && (
                                <button
                                    onClick={() =>
                                        setEditing({ ...emptyData[active] })
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950"
                                >
                                    <Plus size={17} />
                                    Add new
                                </button>
                            )}
                    </div>
                    {(editing ||
                        (active === 'profile' && records.length === 0)) && (
                        <Editor
                            resource={active}
                            initial={editing ?? emptyData.profile}
                            onDone={() => setEditing(null)}
                        />
                    )}
                    {!editing && records.length > 0 && active !== 'profile' && (
                        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-3 sm:flex-row">
                            <label className="relative flex-1">
                                <Search
                                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-600"
                                    size={17}
                                />
                                <span className="sr-only">Search content</span>
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
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                </select>
                            )}
                        </div>
                    )}
                    {!editing && records.length > 0 && (
                        <div className="space-y-3">
                            {filteredRecords.map((item) => (
                                <article
                                    key={item.id}
                                    className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:flex-row sm:items-center"
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
                                                onClick={() => setEditing(item)}
                                                className="admin-ghost"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        {active !== 'profile' && (
                                            <button
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
                        active !== 'profile' && (
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
                            onClick={() => setDeleting(null)}
                            className="admin-ghost"
                        >
                            Cancel
                        </button>
                        <button
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
