import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Briefcase,
    FileBadge,
    FolderKanban,
    LogOut,
    Plus,
    Save,
    Sparkles,
    Trash2,
    UserRound,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type RecordData = Record<string, any> & { id?: number };
type Props = {
    statistics: Record<string, number>;
    profile: RecordData | null;
    projects: RecordData[];
    skills: RecordData[];
    experiences: RecordData[];
    certificates: RecordData[];
};

const sections = [
    ['profile', 'Profile', UserRound],
    ['projects', 'Projects', FolderKanban],
    ['skills', 'Skills', Sparkles],
    ['experiences', 'Experience', Briefcase],
    ['certificates', 'Certificates', FileBadge],
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
        category: '',
        technologies: '',
        github_url: '',
        demo_url: '',
        image: null,
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
        ['image', 'Screenshot', 'file'],
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
        ['image', 'Certificate image', 'file'],
        ['sort_order', 'Sort order', 'number'],
    ],
};

function Editor({
    resource,
    initial,
    onDone,
}: {
    resource: string;
    initial: RecordData;
    onDone: () => void;
}) {
    const normalized = {
        ...initial,
        technologies: Array.isArray(initial.technologies)
            ? initial.technologies.join(', ')
            : (initial.technologies ?? ''),
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
            onSuccess: onDone,
        });
    };
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
                    ) : (
                        <input
                            type={type}
                            accept={
                                name === 'cv_file'
                                    ? '.pdf'
                                    : type === 'file'
                                      ? 'image/*'
                                      : undefined
                            }
                            value={
                                type === 'file' ? undefined : (data[name] ?? '')
                            }
                            onChange={(e) =>
                                setData(
                                    name,
                                    type === 'file'
                                        ? (e.target.files?.[0] ?? null)
                                        : type === 'number'
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
    const records = useMemo(
        () =>
            active === 'profile'
                ? props.profile
                    ? [props.profile]
                    : []
                : ((props[active as keyof Props] as RecordData[]) ?? []),
        [active, props],
    );
    const titleFor = (item: RecordData) =>
        item.title || item.name || item.role || 'Item';
    const remove = (item: RecordData) =>
        confirm(`Delete ${titleFor(item)}?`) &&
        router.delete(`/admin/content/${active}/${item.id}`, {
            preserveScroll: true,
        });

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
                        {active !== 'profile' && !editing && (
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
                    {!editing && records.length > 0 && (
                        <div className="space-y-3">
                            {records.map((item) => (
                                <article
                                    key={item.id}
                                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5"
                                >
                                    <div>
                                        <h2 className="font-semibold text-white">
                                            {titleFor(item)}
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {item.category ||
                                                item.company ||
                                                item.issuer ||
                                                item.headline ||
                                                'Portfolio content'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditing(item)}
                                            className="admin-ghost"
                                        >
                                            Edit
                                        </button>
                                        {active !== 'profile' && (
                                            <button
                                                onClick={() => remove(item)}
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
                        records.length === 0 &&
                        active !== 'profile' && (
                            <div className="rounded-3xl border border-dashed border-white/15 p-14 text-center text-slate-500">
                                No {active} yet. Add only verified, real
                                portfolio content.
                            </div>
                        )}
                </section>
            </main>
        </div>
    );
}
