import { Head, Link } from '@inertiajs/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Award,
    BriefcaseBusiness,
    Code2,
    Download,
    Github,
    Linkedin,
    Mail,
    MapPin,
    Menu,
    Sparkles,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type Profile = {
    name: string;
    headline?: string;
    bio?: string;
    photo?: string;
    cv_file?: string;
    email?: string;
    github_url?: string;
    linkedin_url?: string;
    location?: string;
    available_for_work: boolean;
};
type Project = {
    id: number;
    title: string;
    slug: string;
    description?: string;
    category?: string;
    image?: string;
    technologies?: string[];
    github_url?: string;
    demo_url?: string;
    is_featured: boolean;
};
type Skill = { id: number; name: string; category: string; icon?: string };
type Experience = {
    id: number;
    role: string;
    company: string;
    location?: string;
    started_at: string;
    ended_at?: string;
    description?: string;
};
type Certificate = {
    id: number;
    name: string;
    issuer: string;
    issued_at?: string;
    credential_url?: string;
    image?: string;
};
type Props = {
    profile: Profile | null;
    projects: Project[];
    skills: Skill[];
    experiences: Experience[];
    certificates: Certificate[];
};

const defaults: Profile = {
    name: 'Firman Aji',
    headline: 'Full-Stack Developer',
    bio: 'I build dependable web products with Laravel, React, TypeScript, and thoughtful interface design.',
    location: 'Indonesia',
    available_for_work: true,
};
const stack = [
    'Laravel 13',
    'React',
    'TypeScript',
    'Inertia.js',
    'Tailwind CSS',
    'SQLite',
];
const nav = [
    ['About', '#about'],
    ['Experience', '#experience'],
    ['Skills', '#skills'],
    ['Projects', '#projects'],
    ['Certificates', '#certificates'],
    ['Contact', '#contact'],
];
const asset = (path?: string) => (path ? `/storage/${path}` : undefined);
const formatDate = (value?: string) =>
    value
        ? new Intl.DateTimeFormat('en', {
              month: 'short',
              year: 'numeric',
          }).format(new Date(value))
        : 'Present';

function Reveal({
    children,
    className = '',
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    const reduce = useReducedMotion();
    return (
        <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 28 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.14 }}
            transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

function Heading({
    eyebrow,
    title,
    copy,
}: {
    eyebrow: string;
    title: string;
    copy?: string;
}) {
    return (
        <Reveal className="mb-10 md:mb-14">
            <p className="mb-4 font-mono text-xs tracking-[.28em] text-violet-400 uppercase">
                {eyebrow}
            </p>
            <div className="grid gap-5 md:grid-cols-[1fr_.75fr] md:items-end">
                <h2 className="text-4xl font-bold tracking-[-.04em] text-white md:text-6xl">
                    {title}
                </h2>
                {copy && <p className="leading-7 text-slate-400">{copy}</p>}
            </div>
        </Reveal>
    );
}

export default function Portfolio({
    profile: storedProfile,
    projects,
    skills,
    experiences,
    certificates,
}: Props) {
    const profile = { ...defaults, ...storedProfile };
    const [menu, setMenu] = useState(false);
    const categories = useMemo(
        () => [
            'All',
            ...Array.from(
                new Set(
                    projects
                        .map((project) => project.category)
                        .filter(Boolean) as string[],
                ),
            ),
        ],
        [projects],
    );
    const [category, setCategory] = useState('All');
    const visibleProjects =
        category === 'All'
            ? projects
            : projects.filter((project) => project.category === category);
    const groupedSkills = useMemo(
        () =>
            skills.reduce<Record<string, Skill[]>>((groups, skill) => {
                const categoryName = skill.category || 'Other';
                (groups[categoryName] ??= []).push(skill);

                return groups;
            }, {}),
        [skills],
    );

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#070910] text-slate-200 selection:bg-violet-500/40">
            <Head title={`${profile.name} — ${profile.headline}`}>
                <meta
                    name="description"
                    content={
                        profile.bio?.slice(0, 155) ||
                        `${profile.name}, Full-Stack Developer portfolio.`
                    }
                />
                <meta
                    property="og:title"
                    content={`${profile.name} — ${profile.headline}`}
                />
                <meta property="og:description" content={profile.bio || ''} />
            </Head>
            <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[.07] bg-[#070910]/80 backdrop-blur-2xl">
                <nav
                    aria-label="Primary navigation"
                    className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8"
                >
                    <a
                        href="#top"
                        className="text-lg font-black tracking-tight text-white"
                    >
                        FA<span className="text-violet-400">.DEV</span>
                    </a>
                    <div className="hidden items-center gap-7 lg:flex">
                        {nav.map(([label, href]) => (
                            <a
                                key={href}
                                href={href}
                                className="text-sm text-slate-400 transition hover:text-white"
                            >
                                {label}
                            </a>
                        ))}
                    </div>
                    <a
                        href="#contact"
                        className="hidden rounded-full border border-violet-400/30 bg-violet-500/10 px-5 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20 sm:block"
                    >
                        Start a conversation
                    </a>
                    <button
                        className="rounded-lg border border-white/10 p-2 lg:hidden"
                        aria-expanded={menu}
                        aria-label="Toggle navigation"
                        onClick={() => setMenu(!menu)}
                    >
                        {menu ? <X /> : <Menu />}
                    </button>
                </nav>
                <AnimatePresence>
                    {menu && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-white/10 bg-[#0b0e18] px-5 py-4 lg:hidden"
                        >
                            {nav.map(([label, href]) => (
                                <a
                                    key={href}
                                    href={href}
                                    onClick={() => setMenu(false)}
                                    className="block py-3 text-slate-300"
                                >
                                    {label}
                                </a>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main id="top">
                <section className="relative min-h-screen overflow-hidden pt-20">
                    <div className="absolute top-16 left-[55%] h-[34rem] w-[34rem] rounded-full bg-violet-600/20 blur-[140px]" />
                    <div className="absolute bottom-0 -left-32 h-80 w-80 rounded-full bg-cyan-600/10 blur-[120px]" />
                    <div className="portfolio-grid absolute inset-0 opacity-30" />
                    <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
                        <div>
                            <Reveal>
                                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-xs text-slate-300">
                                    <span
                                        className={`size-2 rounded-full ${profile.available_for_work ? 'animate-pulse bg-emerald-400' : 'bg-amber-400'}`}
                                    />
                                    {profile.available_for_work
                                        ? 'Available for selected opportunities'
                                        : 'Currently focused on active projects'}
                                </div>
                            </Reveal>
                            <Reveal delay={0.08}>
                                <p className="mb-5 font-mono text-sm tracking-[.22em] text-violet-400">
                                    HELLO — I&apos;M{' '}
                                    {profile.name.toUpperCase()}
                                </p>
                                <h1 className="max-w-4xl text-5xl leading-[.98] font-black tracking-[-.055em] text-white sm:text-7xl lg:text-[5.7rem]">
                                    I build digital products that feel{' '}
                                    <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                                        effortless.
                                    </span>
                                </h1>
                            </Reveal>
                            <Reveal delay={0.16}>
                                <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
                                    {profile.bio}
                                </p>
                            </Reveal>
                            <Reveal
                                delay={0.24}
                                className="mt-9 flex flex-wrap gap-3"
                            >
                                <a
                                    href="#projects"
                                    className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-950"
                                >
                                    Explore work{' '}
                                    <ArrowDownRight
                                        className="transition group-hover:translate-x-1 group-hover:translate-y-1"
                                        size={17}
                                    />
                                </a>
                                {profile.cv_file && (
                                    <a
                                        href={asset(profile.cv_file)}
                                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-white"
                                    >
                                        <Download size={17} />
                                        Download CV
                                    </a>
                                )}
                            </Reveal>
                        </div>
                        <Reveal
                            delay={0.18}
                            className="relative mx-auto w-full max-w-md"
                        >
                            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-violet-500/30 to-cyan-500/10 blur-2xl" />
                            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#101522] p-4 shadow-2xl shadow-black/50">
                                <div className="aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-violet-950 to-slate-950">
                                    {profile.photo ? (
                                        <img
                                            src={asset(profile.photo)}
                                            alt={`Portrait of ${profile.name}`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center">
                                            <Code2
                                                size={72}
                                                className="text-violet-400"
                                            />
                                            <p className="mt-5 font-mono text-sm text-slate-500">
                                                {profile.headline}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between px-2 pt-5 pb-1">
                                    <div>
                                        <p className="font-semibold text-white">
                                            {profile.headline}
                                        </p>
                                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                            <MapPin size={12} />
                                            {profile.location}
                                        </p>
                                    </div>
                                    <Sparkles className="text-violet-400" />
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>

                <section className="border-y border-white/[.07] bg-white/[.025] py-6">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5">
                        {stack.map((item) => (
                            <span
                                key={item}
                                className="font-mono text-xs tracking-[.16em] text-slate-500 uppercase"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </section>
                <section id="about" className="scroll-mt-24 px-5 py-28 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <Heading
                            eyebrow="01 / About"
                            title="Engineering with intent."
                            copy="Clean architecture, useful interfaces, and maintainable delivery — from database design to the final interaction."
                        />
                        <Reveal>
                            <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-3">
                                {[
                                    [
                                        'Full-stack',
                                        'A connected view across Laravel backends and React frontends.',
                                    ],
                                    [
                                        'Product-minded',
                                        'Technical decisions anchored to the visitor and business goal.',
                                    ],
                                    [
                                        'Built to last',
                                        'Accessible, responsive systems that stay pleasant to maintain.',
                                    ],
                                ].map(([title, copy]) => (
                                    <div
                                        key={title}
                                        className="bg-[#0b0e17] p-8"
                                    >
                                        <p className="text-xl font-semibold text-white">
                                            {title}
                                        </p>
                                        <p className="mt-3 leading-7 text-slate-400">
                                            {copy}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Reveal>
                    </div>
                </section>
                {experiences.length > 0 && (
                    <section
                        id="experience"
                        className="scroll-mt-24 bg-white/[.02] px-5 py-28 lg:px-8"
                    >
                        <div className="mx-auto max-w-7xl">
                            <Heading
                                eyebrow="02 / Experience"
                                title="Where I’ve contributed."
                            />
                            <div className="border-l border-white/10">
                                {experiences.map((item, index) => (
                                    <Reveal
                                        key={item.id}
                                        delay={index * 0.06}
                                        className="relative grid gap-4 border-b border-white/[.07] py-8 pl-8 md:grid-cols-[.35fr_1fr]"
                                    >
                                        <span className="absolute top-10 -left-1.5 size-3 rounded-full border-2 border-[#090c14] bg-violet-400" />
                                        <p className="font-mono text-xs text-violet-300">
                                            {formatDate(item.started_at)} —{' '}
                                            {formatDate(item.ended_at)}
                                        </p>
                                        <div>
                                            <h3 className="text-xl font-semibold text-white">
                                                {item.role}
                                            </h3>
                                            <p className="mt-1 text-slate-400">
                                                {item.company}
                                                {item.location
                                                    ? ` · ${item.location}`
                                                    : ''}
                                            </p>
                                            {item.description && (
                                                <p className="mt-4 max-w-3xl leading-7 text-slate-500">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
                <section
                    id="skills"
                    className="scroll-mt-24 px-5 py-28 lg:px-8"
                >
                    <div className="mx-auto max-w-7xl">
                        <Heading
                            eyebrow="03 / Capabilities"
                            title="Tools for the whole stack."
                            copy="The public list below is managed from the private dashboard."
                        />
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(groupedSkills).length ? (
                                Object.entries(groupedSkills).map(
                                    ([group, items], index) => (
                                        <Reveal
                                            key={group}
                                            delay={index * 0.06}
                                            className="rounded-3xl border border-white/10 bg-white/[.035] p-7"
                                        >
                                            <p className="font-mono text-xs tracking-[.2em] text-violet-400 uppercase">
                                                {group}
                                            </p>
                                            <div className="mt-5 flex flex-wrap gap-2">
                                                {items?.map((skill) => (
                                                    <span
                                                        key={skill.id}
                                                        className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-300"
                                                    >
                                                        {skill.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </Reveal>
                                    ),
                                )
                            ) : (
                                <Reveal className="md:col-span-2 lg:col-span-3">
                                    <div className="rounded-3xl border border-white/10 p-8">
                                        <p className="text-slate-400">
                                            Current stack
                                        </p>
                                        <div className="mt-5 flex flex-wrap gap-2">
                                            {stack.map((item) => (
                                                <span
                                                    key={item}
                                                    className="rounded-full border border-white/10 px-4 py-2 text-sm"
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </Reveal>
                            )}
                        </div>
                    </div>
                </section>
                <section
                    id="projects"
                    className="scroll-mt-24 bg-[#0a0d16] px-5 py-28 lg:px-8"
                >
                    <div className="mx-auto max-w-7xl">
                        <Heading
                            eyebrow="04 / Selected work"
                            title="Projects, up close."
                            copy="Real work and case studies published from the portfolio CMS."
                        />
                        {categories.length > 1 && (
                            <div
                                className="mb-9 flex flex-wrap gap-2"
                                role="group"
                                aria-label="Filter projects"
                            >
                                {categories.map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => setCategory(item)}
                                        aria-pressed={category === item}
                                        className={`rounded-full px-4 py-2 text-sm transition ${category === item ? 'bg-violet-500 text-white' : 'border border-white/10 text-slate-400 hover:text-white'}`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        )}
                        <motion.div
                            layout
                            className="grid gap-6 md:grid-cols-2"
                        >
                            {visibleProjects.map((project, index) => (
                                <Reveal key={project.id} delay={index * 0.05}>
                                    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.035]">
                                        <Link
                                            href={`/projects/${project.slug}`}
                                            className="block"
                                        >
                                            <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-violet-950 to-slate-950">
                                                {project.image ? (
                                                    <img
                                                        src={asset(
                                                            project.image,
                                                        )}
                                                        alt={`Screenshot of ${project.title}`}
                                                        loading="lazy"
                                                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center">
                                                        <Code2
                                                            size={54}
                                                            className="text-violet-400/70"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-7">
                                                <div className="flex items-start justify-between gap-5">
                                                    <div>
                                                        <p className="mb-2 font-mono text-xs tracking-[.2em] text-violet-400 uppercase">
                                                            {project.category ||
                                                                'Project'}
                                                        </p>
                                                        <h3 className="text-2xl font-semibold text-white">
                                                            {project.title}
                                                        </h3>
                                                    </div>
                                                    <ArrowUpRight className="text-slate-500 transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-white" />
                                                </div>
                                                <p className="mt-4 line-clamp-2 leading-7 text-slate-400">
                                                    {project.description}
                                                </p>
                                                <div className="mt-6 flex flex-wrap gap-2">
                                                    {project.technologies
                                                        ?.slice(0, 5)
                                                        .map((tech) => (
                                                            <span
                                                                key={tech}
                                                                className="rounded-full bg-white/[.06] px-3 py-1 text-xs text-slate-400"
                                                            >
                                                                {tech}
                                                            </span>
                                                        ))}
                                                </div>
                                            </div>
                                        </Link>
                                    </article>
                                </Reveal>
                            ))}
                        </motion.div>
                        {projects.length === 0 && (
                            <div className="rounded-3xl border border-dashed border-white/15 p-14 text-center">
                                <BriefcaseBusiness
                                    className="mx-auto text-violet-400"
                                    size={36}
                                />
                                <p className="mt-4 text-slate-500">
                                    Project case studies are being prepared in
                                    the CMS.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
                {certificates.length > 0 && (
                    <section
                        id="certificates"
                        className="scroll-mt-24 px-5 py-28 lg:px-8"
                    >
                        <div className="mx-auto max-w-7xl">
                            <Heading
                                eyebrow="05 / Certificates"
                                title="Continuous learning."
                            />
                            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                {certificates.map((item) => (
                                    <Reveal key={item.id}>
                                        <a
                                            href={
                                                item.credential_url || undefined
                                            }
                                            target={
                                                item.credential_url
                                                    ? '_blank'
                                                    : undefined
                                            }
                                            rel="noreferrer"
                                            className="block rounded-3xl border border-white/10 bg-white/[.03] p-7 transition hover:-translate-y-1 hover:border-violet-400/30"
                                        >
                                            <Award className="text-violet-400" />
                                            <h3 className="mt-7 text-lg font-semibold text-white">
                                                {item.name}
                                            </h3>
                                            <p className="mt-2 text-sm text-slate-500">
                                                {item.issuer}
                                                {item.issued_at
                                                    ? ` · ${formatDate(item.issued_at)}`
                                                    : ''}
                                            </p>
                                        </a>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
                <section
                    id="contact"
                    className="scroll-mt-24 px-5 pt-24 pb-12 lg:px-8"
                >
                    <Reveal className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-violet-400/20 bg-gradient-to-br from-violet-950/80 via-[#121529] to-cyan-950/40 px-7 py-16 text-center md:px-16 md:py-24">
                        <p className="font-mono text-xs tracking-[.25em] text-violet-300 uppercase">
                            Let’s make something useful
                        </p>
                        <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-black tracking-[-.04em] text-white md:text-7xl">
                            Have a problem worth solving?
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl leading-7 text-slate-300">
                            Tell me what you’re building, what’s getting in the
                            way, and where you want to go next.
                        </p>
                        {profile.email && (
                            <a
                                href={`mailto:${profile.email}`}
                                className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 font-bold text-slate-950"
                            >
                                <Mail size={18} />
                                Email {profile.name.split(' ')[0]}
                            </a>
                        )}
                        <div className="mt-10 flex justify-center gap-3">
                            {profile.github_url && (
                                <a
                                    href={profile.github_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="GitHub"
                                    className="rounded-full border border-white/15 p-3"
                                >
                                    <Github />
                                </a>
                            )}
                            {profile.linkedin_url && (
                                <a
                                    href={profile.linkedin_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="LinkedIn"
                                    className="rounded-full border border-white/15 p-3"
                                >
                                    <Linkedin />
                                </a>
                            )}
                        </div>
                    </Reveal>
                </section>
            </main>
            <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <p>
                    © {new Date().getFullYear()} FA.DEV · Built with Laravel and
                    React.
                </p>
                <a href="#top" className="text-slate-400 hover:text-white">
                    Back to top ↑
                </a>
            </footer>
        </div>
    );
}
