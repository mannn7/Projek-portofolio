import { Head, Link, useForm } from '@inertiajs/react';
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
import type { IconType } from 'react-icons';
import {
    SiGit,
    SiGithub,
    SiInertia,
    SiJavascript,
    SiLaravel,
    SiMysql,
    SiPhp,
    SiReact,
    SiSqlite,
    SiTailwindcss,
    SiTypescript,
} from 'react-icons/si';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SeoData } from '@/types/seo';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

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
    seo: SeoData;
};

const defaults: Profile = {
    name: 'Firman Aji',
    headline: 'Full-Stack Developer',
    bio: 'I build dependable web products with Laravel, React, TypeScript, and thoughtful interface design.',
    photo: '/images/firman-aji-profile-blue.webp',
    location: 'Indonesia',
    available_for_work: true,
};
type Technology = {
    name: string;
    icon: IconType;
    color: string;
    glow: string;
};

const stack: Technology[] = [
    {
        name: 'Laravel 13',
        icon: SiLaravel,
        color: '#ff2d20',
        glow: '255,45,32',
    },
    { name: 'React', icon: SiReact, color: '#61dafb', glow: '97,218,251' },
    {
        name: 'TypeScript',
        icon: SiTypescript,
        color: '#3178c6',
        glow: '49,120,198',
    },
    {
        name: 'Inertia.js',
        icon: SiInertia,
        color: '#9553e9',
        glow: '149,83,233',
    },
    {
        name: 'Tailwind CSS',
        icon: SiTailwindcss,
        color: '#06b6d4',
        glow: '6,182,212',
    },
    { name: 'SQLite', icon: SiSqlite, color: '#7dc9e8', glow: '125,201,232' },
];

const skillIcons: Record<string, IconType> = {
    laravel: SiLaravel,
    react: SiReact,
    typescript: SiTypescript,
    javascript: SiJavascript,
    inertia: SiInertia,
    'inertia.js': SiInertia,
    tailwind: SiTailwindcss,
    'tailwind css': SiTailwindcss,
    php: SiPhp,
    mysql: SiMysql,
    sqlite: SiSqlite,
    git: SiGit,
    github: SiGithub,
};
const nav = [
    ['About', '#about'],
    ['Experience', '#experience'],
    ['Skills', '#skills'],
    ['Projects', '#projects'],
    ['Certificates', '#certificates'],
    ['Contact', '#contact'],
];
const asset = (path?: string) =>
    path ? (path.startsWith('/') ? path : `/storage/${path}`) : undefined;
const formatDate = (value?: string) =>
    value
        ? new Intl.DateTimeFormat('en', {
              month: 'short',
              year: 'numeric',
          }).format(new Date(value))
        : 'Present';

const INTRO_SESSION_KEY = 'fadev-intro-seen-v2';

function PortfolioIntro({ onComplete }: { onComplete: () => void }) {
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        const forceReplay = new URLSearchParams(window.location.search).has(
            'intro',
        );
        const hasSeenIntro = sessionStorage.getItem(INTRO_SESSION_KEY) === '1';

        if ((hasSeenIntro && !forceReplay) || reduceMotion) {
            onComplete();

            return;
        }

        document.body.style.overflow = 'hidden';
        const timer = window.setTimeout(() => {
            sessionStorage.setItem(INTRO_SESSION_KEY, '1');
            onComplete();
        }, 4300);

        return () => {
            window.clearTimeout(timer);
            document.body.style.overflow = '';
        };
    }, [onComplete, reduceMotion]);

    const finish = () => {
        sessionStorage.setItem(INTRO_SESSION_KEY, '1');
        document.body.style.overflow = '';
        onComplete();
    };

    return (
        <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="FA.DEV portfolio introduction"
            className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_38%,#312e81_0%,#172554_28%,#071426_62%,#030712_100%)] text-white"
            initial={{ clipPath: 'circle(150% at 50% 38%)' }}
            animate={{
                clipPath: [
                    'circle(150% at 50% 38%)',
                    'circle(150% at 50% 38%)',
                    'circle(0% at 50% 38%)',
                ],
            }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            transition={{
                duration: 4.3,
                times: [0, 0.82, 1],
                ease: [0.65, 0, 0.35, 1],
            }}
        >
            <div
                className="absolute inset-0 opacity-70"
                aria-hidden="true"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(167,139,250,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(103,232,249,.15) 1px, transparent 1px)',
                    backgroundSize: '56px 56px',
                    maskImage:
                        'radial-gradient(circle at center, black 15%, transparent 72%)',
                }}
            />
            <motion.div
                aria-hidden="true"
                className="absolute -top-32 -left-24 size-96 rounded-full bg-fuchsia-500/30 blur-[100px]"
                animate={{ x: [0, 80, 0], y: [0, 45, 0], scale: [1, 1.2, 1] }}
                transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
            <motion.div
                aria-hidden="true"
                className="absolute -right-24 -bottom-36 size-[30rem] rounded-full bg-cyan-400/25 blur-[110px]"
                animate={{
                    x: [0, -70, 0],
                    y: [0, -30, 0],
                    scale: [1, 1.15, 1],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
            {Array.from({ length: 18 }).map((_, index) => (
                <motion.span
                    key={index}
                    aria-hidden="true"
                    className="absolute size-1 rounded-full bg-cyan-200 shadow-[0_0_12px_#67e8f9]"
                    style={{
                        left: `${8 + ((index * 17) % 84)}%`,
                        top: `${10 + ((index * 29) % 78)}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0, 0.9, 0],
                        scale: [0, 1.6, 0],
                        y: [10, -35],
                    }}
                    transition={{
                        duration: 1.8 + (index % 4) * 0.35,
                        delay: (index % 7) * 0.18,
                        repeat: Infinity,
                    }}
                />
            ))}
            <motion.div
                aria-hidden="true"
                className="absolute h-[38rem] w-[38rem] rounded-full border border-violet-300/30 shadow-[inset_0_0_80px_rgba(139,92,246,.12)]"
                initial={{ scale: 0.35, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 45 }}
                transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
                aria-hidden="true"
                className="absolute h-80 w-80 rounded-full border border-dashed border-cyan-200/50"
                animate={{ rotate: 180 }}
                transition={{ duration: 5, ease: 'linear', repeat: Infinity }}
            />
            <motion.div
                aria-hidden="true"
                className="absolute h-72 w-72 rounded-full bg-violet-500/45 blur-[90px]"
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 1.5, opacity: [0, 0.8, 0.4] }}
                transition={{ duration: 2.2 }}
            />

            <motion.div
                className="relative z-10 w-full max-w-2xl px-7 text-center"
                animate={{
                    scale: [1, 1, 1.16],
                    opacity: [1, 1, 0],
                    filter: ['blur(0px)', 'blur(0px)', 'blur(10px)'],
                }}
                transition={{
                    duration: 4.3,
                    times: [0, 0.82, 1],
                    ease: [0.65, 0, 0.35, 1],
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.55, rotate: -12 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                        type: 'spring',
                        stiffness: 150,
                        damping: 15,
                        delay: 0.15,
                    }}
                    className="relative mx-auto mb-5 size-32 sm:size-40"
                >
                    <motion.div
                        aria-hidden="true"
                        className="absolute -inset-4 rounded-full border border-dashed border-cyan-200/60"
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                    <motion.div
                        aria-hidden="true"
                        className="absolute -inset-2 rounded-full bg-gradient-to-tr from-violet-500 via-fuchsia-400 to-cyan-300 p-px shadow-[0_0_50px_rgba(34,211,238,.55)]"
                        animate={{ rotate: -360 }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                    <div className="relative h-full overflow-hidden rounded-full border-2 border-white/70 bg-gradient-to-br from-violet-500/40 to-cyan-400/30 shadow-[0_0_55px_rgba(139,92,246,.7)]">
                        <img
                            src="/images/fadev-intro-profile.jpeg"
                            alt="FA.DEV developer avatar"
                            fetchPriority="high"
                            decoding="async"
                            className="h-full w-full object-cover object-top"
                        />
                    </div>
                    <motion.span
                        aria-hidden="true"
                        className="absolute right-1 bottom-2 size-4 rounded-full border-2 border-white bg-emerald-400 shadow-[0_0_16px_#34d399]"
                        animate={{ scale: [1, 1.35, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                    />
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.55 }}
                    className="mb-2 font-mono text-xs font-semibold tracking-[.34em] text-cyan-200 uppercase sm:text-sm"
                >
                    Welcome to my portfolio
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.85, duration: 0.5 }}
                    className="mb-2 flex items-center justify-center gap-3 font-mono text-[9px] tracking-[.2em] text-emerald-300 uppercase sm:text-[10px]"
                >
                    <span className="size-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_14px_#34d399]" />
                    Portfolio experience ready
                </motion.div>

                <div className="relative mx-auto flex h-20 items-center justify-center overflow-hidden sm:h-24">
                    <motion.span
                        initial={{ x: -80, opacity: 0, filter: 'blur(12px)' }}
                        animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
                        transition={{ delay: 1.05, duration: 0.8 }}
                        className="text-5xl font-black tracking-[-.08em] sm:text-6xl"
                    >
                        FA
                    </motion.span>
                    <motion.span
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            delay: 1.45,
                            type: 'spring',
                            stiffness: 220,
                            damping: 16,
                        }}
                        className="mx-1 text-5xl font-black text-violet-300 sm:text-6xl"
                    >
                        .
                    </motion.span>
                    <motion.span
                        initial={{ x: 80, opacity: 0, filter: 'blur(12px)' }}
                        animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        className="bg-gradient-to-r from-fuchsia-300 via-violet-200 to-cyan-200 bg-clip-text text-5xl font-black tracking-[-.08em] text-transparent drop-shadow-[0_0_24px_rgba(34,211,238,.45)] sm:text-6xl"
                    >
                        DEV
                    </motion.span>
                    <motion.span
                        aria-hidden="true"
                        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_18px_#22d3ee]"
                        initial={{ top: '0%', opacity: 0 }}
                        animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
                        transition={{ delay: 1.25, duration: 1.3 }}
                    />
                </div>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.75, duration: 0.55 }}
                    className="font-mono text-[10px] tracking-[.24em] text-slate-300 uppercase sm:text-xs"
                >
                    Crafting modern digital experiences.
                </motion.p>

                <div className="mx-auto mt-6 max-w-sm">
                    <div className="mb-3 flex justify-between font-mono text-[10px] tracking-widest text-slate-300 uppercase">
                        <span>System ready</span>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 3.2 }}
                        >
                            100%
                        </motion.span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/15 shadow-[0_0_14px_rgba(255,255,255,.12)]">
                        <motion.div
                            className="h-full origin-left rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-300 shadow-[0_0_18px_rgba(34,211,238,.65)]"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{
                                delay: 0.55,
                                duration: 3.05,
                                ease: [0.65, 0, 0.35, 1],
                            }}
                        />
                    </div>
                </div>
            </motion.div>

            <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute top-[38%] left-1/2 z-20 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-100 shadow-[0_0_45px_18px_rgba(103,232,249,.5)]"
                animate={{
                    scale: [1, 1, 14],
                    opacity: [0, 0, 0.9, 0],
                }}
                transition={{
                    duration: 4.3,
                    times: [0, 0.78, 0.86, 1],
                    ease: [0.16, 1, 0.3, 1],
                }}
            />

            <button
                type="button"
                onClick={finish}
                className="absolute right-6 bottom-6 z-20 rounded-full border border-white/25 bg-white/10 px-4 py-2 font-mono text-[10px] tracking-[.18em] text-white/80 uppercase shadow-lg backdrop-blur-md transition hover:border-cyan-200/60 hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 sm:right-9 sm:bottom-9"
            >
                Skip intro
            </button>
        </motion.div>
    );
}

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

function TechMark({
    technology,
    compact = false,
    hiddenFromAssistiveTechnology = false,
}: {
    technology: Technology;
    compact?: boolean;
    hiddenFromAssistiveTechnology?: boolean;
}) {
    const Icon = technology.icon;
    return (
        <span
            aria-hidden={hiddenFromAssistiveTechnology || undefined}
            className={`group/tech inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b0f19]/80 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 ${compact ? 'px-4 py-3' : 'px-5 py-4'}`}
            style={{ boxShadow: `0 14px 45px rgba(${technology.glow}, .08)` }}
        >
            <span className="grid size-9 place-items-center rounded-xl bg-white/[.06]">
                <Icon
                    size={compact ? 18 : 21}
                    style={{ color: technology.color }}
                    aria-hidden="true"
                />
            </span>
            <span className="font-mono text-xs font-semibold tracking-[.08em] text-slate-300 uppercase">
                {technology.name}
            </span>
        </span>
    );
}

export default function Portfolio({
    profile: storedProfile,
    projects,
    skills,
    experiences,
    certificates,
    seo,
}: Props) {
    const reduceMotion = useReducedMotion();
    const [showIntro, setShowIntro] = useState(true);
    const completeIntro = useCallback(() => setShowIntro(false), []);
    const profile = {
        ...defaults,
        ...storedProfile,
        photo: storedProfile?.photo || defaults.photo,
    };
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
    const projectCounts = useMemo(
        () =>
            projects.reduce<Record<string, number>>(
                (counts, project) => {
                    counts.All += 1;
                    if (project.category) {
                        counts[project.category] =
                            (counts[project.category] ?? 0) + 1;
                    }

                    return counts;
                },
                { All: 0 },
            ),
        [projects],
    );
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
    const contactForm = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        website: '',
    });
    const submitContact = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        contactForm.post('/contact', {
            preserveScroll: true,
            onSuccess: () => contactForm.reset(),
        });
    };

    return (
        <div
            id="top"
            className="min-h-screen overflow-x-hidden bg-[#070910] text-slate-200 selection:bg-violet-500/40"
        >
            <AnimatePresence>
                {showIntro && <PortfolioIntro onComplete={completeIntro} />}
            </AnimatePresence>
            <Head title={seo.title}>
                <meta name="description" content={seo.description} />
                <link rel="canonical" href={seo.canonical} />
                <meta property="og:type" content="profile" />
                <meta property="og:title" content={seo.title} />
                <meta property="og:description" content={seo.description} />
                <meta property="og:url" content={seo.canonical} />
                <meta property="og:site_name" content="FA.DEV" />
                {seo.image && <meta property="og:image" content={seo.image} />}
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
                        type="button"
                        className="rounded-lg border border-white/10 p-2 lg:hidden"
                        aria-expanded={menu}
                        aria-controls="mobile-navigation"
                        aria-label="Toggle navigation"
                        onClick={() => setMenu(!menu)}
                    >
                        {menu ? <X /> : <Menu />}
                    </button>
                </nav>
                <AnimatePresence>
                    {menu && (
                        <motion.div
                            id="mobile-navigation"
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

            <main id="main-content" tabIndex={-1}>
                <section className="relative min-h-screen overflow-hidden pt-20">
                    <div
                        aria-hidden="true"
                        className="absolute top-16 left-[55%] h-[34rem] w-[34rem] rounded-full bg-violet-600/20 blur-[140px]"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute bottom-0 -left-32 h-80 w-80 rounded-full bg-cyan-600/10 blur-[120px]"
                    />
                    <div
                        aria-hidden="true"
                        className="portfolio-grid absolute inset-0 opacity-30"
                    />
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
                            {stack.slice(0, 4).map((technology, index) => {
                                const Icon = technology.icon;
                                const positions = [
                                    '-left-8 top-16',
                                    '-right-8 top-28',
                                    '-left-10 bottom-28',
                                    '-right-8 bottom-16',
                                ];

                                return (
                                    <motion.div
                                        key={technology.name}
                                        className={`absolute z-20 hidden size-14 items-center justify-center rounded-2xl border border-white/15 bg-[#0b1020]/90 shadow-2xl backdrop-blur-xl sm:flex ${positions[index]}`}
                                        animate={
                                            reduceMotion
                                                ? undefined
                                                : { y: [0, -7, 0] }
                                        }
                                        transition={{
                                            duration: 3.4 + index * 0.4,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                            delay: index * 0.3,
                                        }}
                                        title={technology.name}
                                    >
                                        <Icon
                                            size={25}
                                            style={{ color: technology.color }}
                                            aria-hidden="true"
                                        />
                                    </motion.div>
                                );
                            })}
                            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#101522] p-4 shadow-2xl shadow-black/50">
                                <div className="aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-violet-950 to-slate-950">
                                    {profile.photo ? (
                                        <img
                                            src={asset(profile.photo)}
                                            alt={`Portrait of ${profile.name}`}
                                            width={1086}
                                            height={1448}
                                            fetchPriority="high"
                                            decoding="async"
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

                <section
                    className="overflow-hidden border-y border-white/[.07] bg-white/[.025] py-5"
                    aria-label="Core technology stack"
                >
                    <div className="tech-marquee flex w-max gap-4 px-2">
                        {[...stack, ...stack].map((technology, index) => (
                            <TechMark
                                key={`${technology.name}-${index}`}
                                technology={technology}
                                compact
                                hiddenFromAssistiveTechnology={
                                    index >= stack.length
                                }
                            />
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
                <section
                    id="experience"
                    className="content-auto scroll-mt-24 bg-white/[.02] px-5 py-28 lg:px-8"
                >
                    <div className="mx-auto max-w-7xl">
                        <Heading
                            eyebrow="02 / Experience"
                            title="Where I’ve contributed."
                            copy="Professional experience published from the private portfolio CMS."
                        />
                        {experiences.length > 0 ? (
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
                        ) : (
                            <Reveal>
                                <div className="rounded-3xl border border-dashed border-white/15 bg-white/[.02] p-12 text-center sm:p-16">
                                    <BriefcaseBusiness
                                        className="mx-auto text-violet-400"
                                        size={38}
                                        aria-hidden="true"
                                    />
                                    <h3 className="mt-5 text-xl font-semibold text-white">
                                        Experience is being prepared
                                    </h3>
                                    <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-500">
                                        Verified roles and contributions will
                                        appear here after they are added and
                                        activated in the CMS.
                                    </p>
                                </div>
                            </Reveal>
                        )}
                    </div>
                </section>
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
                                                {items?.map((skill) => {
                                                    const SkillIcon =
                                                        skillIcons[
                                                            skill.name.toLowerCase()
                                                        ] || Code2;

                                                    return (
                                                        <span
                                                            key={skill.id}
                                                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-500/10"
                                                        >
                                                            <SkillIcon
                                                                size={15}
                                                                className="text-violet-300"
                                                                aria-hidden="true"
                                                            />
                                                            {skill.name}
                                                        </span>
                                                    );
                                                })}
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
                                            {stack.map((technology) => (
                                                <TechMark
                                                    key={technology.name}
                                                    technology={technology}
                                                    compact
                                                />
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
                                        type="button"
                                        onClick={() => setCategory(item)}
                                        aria-pressed={category === item}
                                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${category === item ? 'bg-violet-500 text-white' : 'border border-white/10 text-slate-400 hover:border-white/20 hover:text-white'}`}
                                    >
                                        {item}
                                        <span
                                            className={`rounded-full px-1.5 py-0.5 text-[10px] ${category === item ? 'bg-white/15 text-white' : 'bg-white/[.06] text-slate-500'}`}
                                        >
                                            {projectCounts[item] ?? 0}
                                        </span>
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
                                            <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-violet-950 to-slate-950">
                                                {project.is_featured && (
                                                    <span className="absolute z-10 m-4 rounded-full border border-white/15 bg-slate-950/75 px-3 py-1 text-[10px] font-semibold tracking-[.16em] text-violet-200 uppercase backdrop-blur-md">
                                                        Featured
                                                    </span>
                                                )}
                                                {project.image ? (
                                                    <img
                                                        src={asset(
                                                            project.image,
                                                        )}
                                                        alt={`Screenshot of ${project.title}`}
                                                        loading="lazy"
                                                        decoding="async"
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
                        {projects.length > 0 &&
                            visibleProjects.length === 0 && (
                                <div className="rounded-3xl border border-dashed border-white/15 p-14 text-center">
                                    <p className="text-slate-400">
                                        No projects found in this category.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setCategory('All')}
                                        className="mt-4 text-sm font-semibold text-violet-300 hover:text-white"
                                    >
                                        View all projects
                                    </button>
                                </div>
                            )}
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
                <section
                    id="certificates"
                    className="content-auto scroll-mt-24 px-5 py-28 lg:px-8"
                >
                    <div className="mx-auto max-w-7xl">
                        <Heading
                            eyebrow="05 / Certificates"
                            title="Continuous learning."
                            copy="Verified certificates and credentials managed from the private portfolio CMS."
                        />
                        {certificates.length > 0 ? (
                            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                {certificates.map((item) => (
                                    <Reveal key={item.id}>
                                        <article className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.03] transition hover:-translate-y-1 hover:border-violet-400/30">
                                            {item.image ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden bg-slate-950 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-violet-400"
                                                            aria-label={`Preview certificate ${item.name}`}
                                                        >
                                                            <img
                                                                src={asset(
                                                                    item.image,
                                                                )}
                                                                alt={`${item.name} issued by ${item.issuer}`}
                                                                loading="lazy"
                                                                decoding="async"
                                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                                            />
                                                            <span className="absolute inset-x-4 bottom-4 rounded-full border border-white/15 bg-slate-950/75 px-4 py-2 text-center text-xs font-semibold text-white opacity-0 backdrop-blur-md transition group-focus-within:opacity-100 group-hover:opacity-100">
                                                                Click to view
                                                                certificate
                                                            </span>
                                                        </button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-h-[92vh] max-w-6xl overflow-auto border-white/10 bg-[#0b0e18] p-3 text-white sm:p-5">
                                                        <DialogTitle className="pr-10 text-lg">
                                                            {item.name}
                                                        </DialogTitle>
                                                        <DialogDescription className="text-slate-400">
                                                            Issued by{' '}
                                                            {item.issuer}
                                                            {item.issued_at
                                                                ? ` · ${formatDate(item.issued_at)}`
                                                                : ''}
                                                        </DialogDescription>
                                                        <img
                                                            src={asset(
                                                                item.image,
                                                            )}
                                                            alt={`${item.name} issued by ${item.issuer}`}
                                                            className="max-h-[72vh] w-full rounded-xl bg-white object-contain"
                                                        />
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-violet-950/50 to-cyan-950/30">
                                                    <Award
                                                        className="text-violet-400"
                                                        size={42}
                                                        aria-hidden="true"
                                                    />
                                                </div>
                                            )}
                                            <div className="p-6">
                                                <h3 className="text-lg font-semibold text-white">
                                                    {item.name}
                                                </h3>
                                                <p className="mt-2 text-sm text-slate-500">
                                                    {item.issuer}
                                                    {item.issued_at
                                                        ? ` · ${formatDate(item.issued_at)}`
                                                        : ''}
                                                </p>
                                                {item.credential_url && (
                                                    <a
                                                        href={
                                                            item.credential_url
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-5 inline-flex items-center gap-2 rounded-full border border-violet-400/30 px-4 py-2 text-sm font-semibold text-violet-200 transition hover:border-violet-300 hover:bg-violet-400/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
                                                    >
                                                        Verify credential
                                                        <ArrowUpRight
                                                            size={15}
                                                            aria-hidden="true"
                                                        />
                                                    </a>
                                                )}
                                            </div>
                                        </article>
                                    </Reveal>
                                ))}
                            </div>
                        ) : (
                            <Reveal>
                                <div className="rounded-3xl border border-dashed border-white/15 bg-white/[.02] p-12 text-center sm:p-16">
                                    <Award
                                        className="mx-auto text-violet-400"
                                        size={38}
                                        aria-hidden="true"
                                    />
                                    <h3 className="mt-5 text-xl font-semibold text-white">
                                        Certificates are being prepared
                                    </h3>
                                    <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-500">
                                        Verified certificates will appear here
                                        after they are added and activated in
                                        the CMS.
                                    </p>
                                </div>
                            </Reveal>
                        )}
                    </div>
                </section>
                <section
                    id="contact"
                    className="scroll-mt-24 px-5 pt-24 pb-12 lg:px-8"
                >
                    <Reveal className="mx-auto grid max-w-7xl overflow-hidden rounded-[2.5rem] border border-violet-400/20 bg-gradient-to-br from-violet-950/80 via-[#121529] to-cyan-950/40 lg:grid-cols-[.85fr_1.15fr]">
                        <div className="p-8 sm:p-12 lg:p-16">
                            <p className="font-mono text-xs tracking-[.25em] text-violet-300 uppercase">
                                Let’s make something useful
                            </p>
                            <h2 className="mt-5 text-4xl font-black tracking-[-.04em] text-white md:text-6xl">
                                Have a problem worth solving?
                            </h2>
                            <p className="mt-6 max-w-xl leading-7 text-slate-300">
                                Tell me what you’re building, what’s getting in
                                the way, and where you want to go next.
                            </p>
                            {profile.email && (
                                <a
                                    href={`mailto:${profile.email}`}
                                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-violet-200 transition hover:text-white"
                                >
                                    <Mail size={18} />
                                    {profile.email}
                                </a>
                            )}
                            <div className="mt-8 flex gap-3">
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
                        </div>
                        <form
                            onSubmit={submitContact}
                            className="border-t border-white/10 bg-black/20 p-8 text-left sm:p-12 lg:border-t-0 lg:border-l lg:p-16"
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <label className="grid gap-2 text-sm font-medium text-slate-300">
                                    Name
                                    <input
                                        name="name"
                                        value={contactForm.data.name}
                                        onChange={(event) =>
                                            contactForm.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        autoComplete="name"
                                        required
                                        className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-violet-400"
                                        placeholder="Your name"
                                    />
                                    {contactForm.errors.name && (
                                        <span className="text-xs text-rose-300">
                                            {contactForm.errors.name}
                                        </span>
                                    )}
                                </label>
                                <label className="grid gap-2 text-sm font-medium text-slate-300">
                                    Email
                                    <input
                                        type="email"
                                        name="email"
                                        value={contactForm.data.email}
                                        onChange={(event) =>
                                            contactForm.setData(
                                                'email',
                                                event.target.value,
                                            )
                                        }
                                        autoComplete="email"
                                        required
                                        className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-violet-400"
                                        placeholder="you@example.com"
                                    />
                                    {contactForm.errors.email && (
                                        <span className="text-xs text-rose-300">
                                            {contactForm.errors.email}
                                        </span>
                                    )}
                                </label>
                            </div>
                            <label className="mt-5 grid gap-2 text-sm font-medium text-slate-300">
                                Subject{' '}
                                <span className="sr-only">optional</span>
                                <input
                                    name="subject"
                                    value={contactForm.data.subject}
                                    onChange={(event) =>
                                        contactForm.setData(
                                            'subject',
                                            event.target.value,
                                        )
                                    }
                                    className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-violet-400"
                                    placeholder="Project or collaboration"
                                />
                            </label>
                            <label className="mt-5 grid gap-2 text-sm font-medium text-slate-300">
                                Message
                                <textarea
                                    name="message"
                                    value={contactForm.data.message}
                                    onChange={(event) =>
                                        contactForm.setData(
                                            'message',
                                            event.target.value,
                                        )
                                    }
                                    required
                                    minLength={10}
                                    rows={5}
                                    className="resize-y rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-violet-400"
                                    placeholder="Tell me a little about your idea…"
                                />
                                {contactForm.errors.message && (
                                    <span className="text-xs text-rose-300">
                                        {contactForm.errors.message}
                                    </span>
                                )}
                            </label>
                            <div
                                className="absolute -left-[9999px]"
                                aria-hidden="true"
                            >
                                <label>
                                    Website
                                    <input
                                        name="website"
                                        value={contactForm.data.website}
                                        onChange={(event) =>
                                            contactForm.setData(
                                                'website',
                                                event.target.value,
                                            )
                                        }
                                        tabIndex={-1}
                                        autoComplete="off"
                                    />
                                </label>
                            </div>
                            <div className="mt-6 flex flex-wrap items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={contactForm.processing}
                                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-bold text-slate-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Mail size={18} />
                                    {contactForm.processing
                                        ? 'Sending…'
                                        : 'Send message'}
                                </button>
                                {contactForm.recentlySuccessful && (
                                    <p
                                        role="status"
                                        className="text-sm font-medium text-emerald-300"
                                    >
                                        Message received. Thank you!
                                    </p>
                                )}
                            </div>
                        </form>
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
