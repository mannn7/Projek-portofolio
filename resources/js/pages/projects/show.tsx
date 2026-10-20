import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    Code2,
    ExternalLink,
    Github,
    Images,
    Lightbulb,
    Target,
    TrendingUp,
    UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { SeoData } from '@/types/seo';

type ProjectImage = { id: number; path: string; alt_text?: string };
type PreviewImage = { key: string; path: string; alt: string };

type Project = {
    id: number;
    title: string;
    slug: string;
    description?: string;
    content?: string;
    problem?: string;
    solution?: string;
    role?: string;
    outcome?: string;
    category?: string;
    image?: string;
    technologies?: string[];
    github_url?: string;
    demo_url?: string;
    images?: ProjectImage[];
};

const asset = (path?: string) => {
    if (!path) return undefined;
    if (/^https?:\/\//.test(path) || path.startsWith('/')) return path;

    return `/storage/${path}`;
};

export default function ProjectShow({
    project,
    relatedProjects,
    seo,
}: {
    project: Project;
    relatedProjects: Project[];
    seo: SeoData;
}) {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
        null,
    );
    const previewImages = useMemo<PreviewImage[]>(
        () => [
            ...(project.image
                ? [
                      {
                          key: 'cover',
                          path: project.image,
                          alt: `Cover screenshot of ${project.title}`,
                      },
                  ]
                : []),
            ...(project.images ?? []).map((image, index) => ({
                key: `gallery-${image.id}`,
                path: image.path,
                alt:
                    image.alt_text ||
                    `${project.title} screenshot ${index + 1}`,
            })),
        ],
        [project.image, project.images, project.title],
    );
    const selectedImage =
        selectedImageIndex === null ? null : previewImages[selectedImageIndex];
    const showPreviousImage = () =>
        setSelectedImageIndex((current) =>
            current === null
                ? null
                : (current - 1 + previewImages.length) % previewImages.length,
        );
    const showNextImage = () =>
        setSelectedImageIndex((current) =>
            current === null ? null : (current + 1) % previewImages.length,
        );
    const caseStudy = [
        { label: 'The problem', value: project.problem, icon: Target },
        { label: 'The solution', value: project.solution, icon: Lightbulb },
        { label: 'My role', value: project.role, icon: UserRound },
        { label: 'The outcome', value: project.outcome, icon: TrendingUp },
    ].filter((item) => item.value);

    return (
        <div className="min-h-screen bg-[#070910] text-slate-200">
            <Head title={seo.title}>
                <meta name="description" content={seo.description} />
                <link rel="canonical" href={seo.canonical} />
                <meta property="og:type" content="article" />
                <meta property="og:title" content={seo.title} />
                <meta property="og:description" content={seo.description} />
                <meta property="og:url" content={seo.canonical} />
                <meta property="og:site_name" content="FA.DEV" />
                {seo.image && <meta property="og:image" content={seo.image} />}
                {seo.publishedAt && (
                    <meta
                        property="article:published_time"
                        content={seo.publishedAt}
                    />
                )}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seo.title} />
                <meta name="twitter:description" content={seo.description} />
                {seo.image && <meta name="twitter:image" content={seo.image} />}
                <script type="application/ld+json">
                    {JSON.stringify(seo.schema)}
                </script>
            </Head>
            <a
                href="#main-content"
                className="sr-only z-[100] rounded-lg bg-white px-4 py-3 font-semibold text-slate-950 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
            >
                Skip to main content
            </a>
            <header className="border-b border-white/10">
                <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
                    <Link
                        href="/#projects"
                        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
                    >
                        <ArrowLeft size={17} />
                        All projects
                    </Link>
                    <span className="font-black text-white">
                        FA<span className="text-violet-400">.DEV</span>
                    </span>
                </div>
            </header>
            <main id="main-content" tabIndex={-1}>
                <section className="mx-auto max-w-6xl px-5 py-20">
                    <p className="font-mono text-xs tracking-[.25em] text-violet-400 uppercase">
                        {project.category || 'Case study'}
                    </p>
                    <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-[-.05em] text-white md:text-7xl">
                        {project.title}
                    </h1>
                    <p className="mt-7 max-w-3xl text-xl leading-8 text-slate-400">
                        {project.description}
                    </p>
                    <div className="mt-9 flex flex-wrap gap-3">
                        {project.demo_url && (
                            <a
                                href={project.demo_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-slate-950"
                            >
                                Live demo <ExternalLink size={16} />
                            </a>
                        )}
                        {project.github_url && (
                            <a
                                href={project.github_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 font-semibold"
                            >
                                <Github size={16} />
                                Source
                            </a>
                        )}
                    </div>
                    {project.image ? (
                        <button
                            type="button"
                            onClick={() => setSelectedImageIndex(0)}
                            className="group relative mt-14 block aspect-video w-full cursor-zoom-in overflow-hidden rounded-3xl border border-white/10 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
                            aria-label={`Preview cover screenshot of ${project.title}`}
                        >
                            <img
                                src={asset(project.image)}
                                alt={`Screenshot of ${project.title}`}
                                fetchPriority="high"
                                decoding="async"
                                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.015]"
                            />
                            <span className="absolute right-5 bottom-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
                                <Images size={16} aria-hidden="true" />
                                View full image
                            </span>
                        </button>
                    ) : (
                        <div className="mt-14 flex aspect-video items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950 to-slate-950">
                            <Code2 size={64} className="text-violet-400" />
                        </div>
                    )}
                    <div className="mt-16 grid gap-10 md:grid-cols-[1fr_260px]">
                        <div className="text-lg leading-9 whitespace-pre-line text-slate-300">
                            {project.content || project.description}
                        </div>
                        <aside>
                            <p className="text-xs font-semibold tracking-[.2em] text-slate-500 uppercase">
                                Built with
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {project.technologies?.map((item) => (
                                    <span
                                        key={item}
                                        className="rounded-full border border-white/10 px-3 py-2 text-sm"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </aside>
                    </div>
                    {caseStudy.length > 0 && (
                        <div className="mt-20 grid gap-5 md:grid-cols-2">
                            {caseStudy.map(({ label, value, icon: Icon }) => (
                                <article
                                    key={label}
                                    className="rounded-3xl border border-white/10 bg-white/[.035] p-7 md:p-9"
                                >
                                    <span className="grid size-11 place-items-center rounded-2xl bg-violet-500/10 text-violet-300">
                                        <Icon size={20} aria-hidden="true" />
                                    </span>
                                    <h2 className="mt-7 text-sm font-semibold tracking-[.2em] text-violet-300 uppercase">
                                        {label}
                                    </h2>
                                    <p className="mt-4 leading-8 whitespace-pre-line text-slate-300">
                                        {value}
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                    {project.images && project.images.length > 0 && (
                        <section
                            className="mt-24"
                            aria-labelledby="gallery-title"
                        >
                            <div className="flex items-center gap-3">
                                <Images className="text-violet-400" />
                                <h2
                                    id="gallery-title"
                                    className="text-3xl font-bold text-white"
                                >
                                    Project gallery
                                </h2>
                            </div>
                            <p className="mt-3 text-slate-500">
                                A closer look at the interface and key product
                                flows.
                            </p>
                            <div className="mt-8 grid gap-5 md:grid-cols-2">
                                {project.images.map((image, index) => (
                                    <button
                                        key={image.id}
                                        type="button"
                                        onClick={() =>
                                            setSelectedImageIndex(
                                                index + (project.image ? 1 : 0),
                                            )
                                        }
                                        className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[.03] text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 ${index === 0 && project.images!.length % 2 === 1 ? 'md:col-span-2' : ''}`}
                                    >
                                        <img
                                            src={asset(image.path)}
                                            alt={
                                                image.alt_text ||
                                                `${project.title} screenshot ${index + 1}`
                                            }
                                            loading="lazy"
                                            decoding="async"
                                            className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                                        />
                                        <span className="absolute right-4 bottom-4 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 group-focus-visible:opacity-100">
                                            View image
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}
                </section>
                {relatedProjects.length > 0 && (
                    <section className="border-t border-white/10 px-5 py-16">
                        <div className="mx-auto max-w-6xl">
                            <h2 className="text-2xl font-bold text-white">
                                Related work
                            </h2>
                            <div className="mt-6 grid gap-4 md:grid-cols-3">
                                {relatedProjects.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/projects/${item.slug}`}
                                        className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[.02] hover:border-violet-400/30"
                                    >
                                        <div className="aspect-video overflow-hidden bg-gradient-to-br from-violet-950 to-slate-950">
                                            {item.image || item.images?.[0] ? (
                                                <img
                                                    src={asset(
                                                        item.image ||
                                                            item.images?.[0]
                                                                .path,
                                                    )}
                                                    alt={`Screenshot of ${item.title}`}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <Code2 className="text-violet-400/70" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <p className="text-xs tracking-[.15em] text-violet-400 uppercase">
                                                {item.category || 'Project'}
                                            </p>
                                            <p className="mt-2 font-semibold text-white">
                                                {item.title}
                                            </p>
                                            <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                                                {item.description}
                                            </p>
                                            <ArrowUpRight
                                                className="mt-5 text-violet-400 transition group-hover:translate-x-1"
                                                size={17}
                                            />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
            <Dialog
                open={selectedImageIndex !== null}
                onOpenChange={(open) => !open && setSelectedImageIndex(null)}
            >
                <DialogContent className="max-w-6xl border-white/10 bg-[#090c15] p-3 text-white sm:max-w-6xl sm:p-5">
                    <DialogTitle className="sr-only">
                        Project screenshot preview
                    </DialogTitle>
                    {selectedImage && (
                        <div>
                            <img
                                src={asset(selectedImage.path)}
                                alt={selectedImage.alt}
                                decoding="async"
                                className="max-h-[76vh] w-full rounded-xl object-contain"
                            />
                            <div className="mt-3 flex items-center justify-between gap-4 px-1">
                                <p className="min-w-0 truncate text-sm text-slate-400">
                                    {selectedImage.alt}
                                </p>
                                {previewImages.length > 1 && (
                                    <div className="flex shrink-0 items-center gap-2">
                                        <span className="text-xs text-slate-500">
                                            {selectedImageIndex! + 1} /{' '}
                                            {previewImages.length}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={showPreviousImage}
                                            className="grid size-9 place-items-center rounded-full border border-white/10 hover:bg-white/10"
                                            aria-label="Previous screenshot"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={showNextImage}
                                            className="grid size-9 place-items-center rounded-full border border-white/10 hover:bg-white/10"
                                            aria-label="Next screenshot"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
