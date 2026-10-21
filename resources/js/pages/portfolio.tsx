import { Head, Link, useForm } from '@inertiajs/react';
import {
    AnimatePresence,
    motion,
    useReducedMotion,
    useScroll,
    useSpring,
} from 'motion/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Award,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
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
    SiLivewire,
    SiMysql,
    SiPhp,
    SiReact,
    SiSqlite,
    SiTailwindcss,
    SiTypescript,
    SiVite,
} from 'react-icons/si';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SeoData } from '@/types/seo';
import { PdfThumbnail } from '@/components/pdf-thumbnail';

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
    files?: string[];
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

const isPdfPath = (path?: string) => Boolean(path && /\.pdf$/i.test(path));
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
const skillVisuals: Record<
    string,
    { icon: IconType; color: string; glow: string }
> = {
    laravel: { icon: SiLaravel, color: '#ff2d20', glow: '255,45,32' },
    php: { icon: SiPhp, color: '#777bb4', glow: '119,123,180' },
    livewire: { icon: SiLivewire, color: '#fb70a9', glow: '251,112,169' },
    javascript: {
        icon: SiJavascript,
        color: '#f7df1e',
        glow: '247,223,30',
    },
    react: { icon: SiReact, color: '#61dafb', glow: '97,218,251' },
    typescript: {
        icon: SiTypescript,
        color: '#3178c6',
        glow: '49,120,198',
    },
    inertia: { icon: SiInertia, color: '#9553e9', glow: '149,83,233' },
    'inertia.js': {
        icon: SiInertia,
        color: '#9553e9',
        glow: '149,83,233',
    },
    tailwind: {
        icon: SiTailwindcss,
        color: '#06b6d4',
        glow: '6,182,212',
    },
    'tailwind css': {
        icon: SiTailwindcss,
        color: '#06b6d4',
        glow: '6,182,212',
    },
    blade: { icon: SiLaravel, color: '#ff2d20', glow: '255,45,32' },
    mysql: { icon: SiMysql, color: '#4479a1', glow: '68,121,161' },
    sqlite: { icon: SiSqlite, color: '#7dc9e8', glow: '125,201,232' },
    vite: { icon: SiVite, color: '#bd34fe', glow: '189,52,254' },
    git: { icon: SiGit, color: '#f05032', glow: '240,80,50' },
    github: { icon: SiGithub, color: '#f8fafc', glow: '248,250,252' },
};
const technologyForSkill = (skill: Skill): Technology => {
    const visual =
        skillVisuals[skill.icon?.toLowerCase() ?? ''] ??
        skillVisuals[skill.name.toLowerCase()];

    return {
        name: skill.name,
        icon: visual?.icon ?? skillIcons[skill.name.toLowerCase()] ?? Code2,
        color: visual?.color ?? '#c4b5fd',
        glow: visual?.glow ?? '196,181,253',
    };
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

function SectionAura({ side = 'right' }: { side?: 'left' | 'right' }) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            aria-hidden="true"
            className={`pointer-events-none absolute top-1/2 h-80 w-80 -translate-y-1/2 rounded-full blur-[130px] ${side === 'right' ? '-right-32 bg-violet-600/15' : '-left-32 bg-cyan-500/10'}`}
            animate={
                reduceMotion
                    ? undefined
                    : {
                          y: ['-50%', '-68%', '-35%', '-50%'],
                          scale: [1, 1.25, 0.9, 1],
                          opacity: [0.45, 0.8, 0.5, 0.45],
                      }
            }
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
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

function CertificateMedia({ certificate }: { certificate: Certificate }) {
    const reduceMotion = useReducedMotion();
    const [activeFile, setActiveFile] = useState(0);
    const [direction, setDirection] = useState(1);
    const [paused, setPaused] = useState(false);
    const files = Array.from(
        new Set(
            [certificate.image, ...(certificate.files ?? [])].filter(
                (path): path is string => Boolean(path),
            ),
        ),
    );

    useEffect(() => {
        if (files.length < 2 || paused || reduceMotion) return;
        const timer = window.setTimeout(() => {
            setDirection(1);
            setActiveFile((current) => (current + 1) % files.length);
        }, 4600);
        return () => window.clearTimeout(timer);
    }, [activeFile, files.length, paused, reduceMotion]);

    const showFile = (index: number) => {
        setDirection(index > activeFile ? 1 : -1);
        setActiveFile(index);
    };

    const moveFile = (step: -1 | 1) => {
        setDirection(step);
        setActiveFile(
            (current) => (current + step + files.length) % files.length,
        );
    };

    const currentFile = files[activeFile];
    if (!currentFile) {
        return (
            <div className="flex aspect-[1.414/1] items-center justify-center bg-gradient-to-br from-violet-950/50 to-cyan-950/30">
                <Award
                    className="text-violet-400"
                    size={42}
                    aria-hidden="true"
                />
            </div>
        );
    }

    return (
        <div
            className="group/certificate relative isolate aspect-[1.414/1] overflow-hidden bg-slate-100"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
        >
            <a
                href={asset(currentFile)}
                target="_blank"
                rel="noreferrer"
                className="group/media absolute inset-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-violet-400"
                aria-label={`Open certificate ${certificate.name}, file ${activeFile + 1} of ${files.length}`}
            >
                <AnimatePresence
                    initial={false}
                    custom={direction}
                    mode="popLayout"
                >
                    <motion.div
                        key={currentFile}
                        custom={direction}
                        initial={
                            reduceMotion
                                ? false
                                : {
                                      opacity: 0,
                                      x: direction * 46,
                                      scale: 1.035,
                                      filter: 'blur(5px)',
                                  }
                        }
                        animate={{
                            opacity: 1,
                            x: 0,
                            scale: 1,
                            filter: 'blur(0px)',
                        }}
                        exit={
                            reduceMotion
                                ? undefined
                                : {
                                      opacity: 0,
                                      x: direction * -30,
                                      scale: 0.985,
                                      filter: 'blur(3px)',
                                  }
                        }
                        transition={{
                            x: { type: 'spring', stiffness: 170, damping: 24 },
                            opacity: { duration: 0.42, ease: 'easeOut' },
                            scale: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                            filter: { duration: 0.35 },
                        }}
                        className="absolute inset-0"
                    >
                        {isPdfPath(currentFile) ? (
                            <PdfThumbnail
                                src={asset(currentFile)!}
                                title={`Preview of ${certificate.name}`}
                                className="h-full w-full"
                            />
                        ) : (
                            <img
                                src={asset(currentFile)}
                                alt={`${certificate.name} issued by ${certificate.issuer}`}
                                className="h-full w-full object-cover"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-white/5 opacity-0 transition duration-500 group-hover/media:opacity-100" />
                <span className="absolute inset-x-4 bottom-4 flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-slate-950/80 px-4 py-3 text-center text-xs font-semibold text-white opacity-0 shadow-2xl backdrop-blur-xl transition duration-300 group-hover/media:translate-y-0 group-hover/media:opacity-100 group-focus-visible/media:opacity-100 sm:translate-y-2">
                    Open certificate
                    <ArrowUpRight size={14} aria-hidden="true" />
                </span>
            </a>
            {files.length > 1 && (
                <>
                    <div className="absolute top-3 right-3 z-10 rounded-full border border-white/15 bg-slate-950/70 px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] text-white shadow-lg backdrop-blur-xl">
                        {String(activeFile + 1).padStart(2, '0')} /{' '}
                        {String(files.length).padStart(2, '0')}
                    </div>
                    <button
                        type="button"
                        onClick={() => moveFile(-1)}
                        className="absolute top-1/2 left-3 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-slate-950/65 text-white opacity-0 shadow-xl backdrop-blur-xl transition duration-300 group-hover/certificate:opacity-100 hover:scale-105 hover:bg-violet-600 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-violet-400"
                        aria-label="Show previous certificate file"
                    >
                        <ChevronLeft size={17} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={() => moveFile(1)}
                        className="absolute top-1/2 right-3 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-slate-950/65 text-white opacity-0 shadow-xl backdrop-blur-xl transition duration-300 group-hover/certificate:opacity-100 hover:scale-105 hover:bg-violet-600 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-violet-400"
                        aria-label="Show next certificate file"
                    >
                        <ChevronRight size={17} aria-hidden="true" />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 z-10 flex h-1 bg-slate-950/15">
                        {files.map((file, index) => (
                            <button
                                key={file}
                                type="button"
                                onClick={() => showFile(index)}
                                className="relative h-full flex-1 overflow-hidden bg-white/20"
                                aria-label={`Show certificate file ${index + 1}`}
                                aria-current={
                                    index === activeFile ? 'true' : undefined
                                }
                            >
                                {index === activeFile && (
                                    <motion.span
                                        key={`${activeFile}-${paused}`}
                                        className="absolute inset-0 origin-left bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-400"
                                        initial={{ scaleX: 0 }}
                                        animate={{
                                            scaleX:
                                                paused || reduceMotion ? 0 : 1,
                                        }}
                                        transition={{
                                            duration: 4.6,
                                            ease: 'linear',
                                        }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function AmbientAudio() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const startedRef = useRef(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = 0.5;

        const events: Array<keyof DocumentEventMap> = [
            'pointerdown',
            'touchstart',
            'keydown',
        ];

        const removeUnlockListeners = () => {
            events.forEach((event) =>
                document.removeEventListener(event, startPlayback),
            );
        };

        const startPlayback = () => {
            void audio
                .play()
                .then(() => {
                    startedRef.current = true;
                    removeUnlockListeners();
                })
                .catch(() => {
                    // Browsers require a user gesture before audible autoplay.
                });
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                audio.pause();
            } else if (startedRef.current) {
                startPlayback();
            }
        };

        startPlayback();
        events.forEach((event) =>
            document.addEventListener(event, startPlayback, {
                passive: true,
            }),
        );
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            removeUnlockListeners();
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
            audio.pause();
        };
    }, []);

    return (
        <audio ref={audioRef} loop preload="metadata" aria-hidden="true">
            <source src="/audio/portfolio-ambient.mp3" type="audio/mpeg" />
        </audio>
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
    const { scrollYProgress } = useScroll();
    const smoothScrollProgress = useSpring(scrollYProgress, {
        stiffness: 110,
        damping: 28,
        restDelta: 0.001,
    });
    const profile = {
        ...defaults,
        ...storedProfile,
        photo: storedProfile?.photo || defaults.photo,
    };
    const displayedStack = useMemo(
        () => (skills.length ? skills.map(technologyForSkill) : stack),
        [skills],
    );
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
            <AmbientAudio />
            <AnimatePresence>
                {showIntro && <PortfolioIntro onComplete={completeIntro} />}
            </AnimatePresence>
            <div
                aria-hidden="true"
                className="cosmic-page-background pointer-events-none fixed inset-0 z-0"
            />
            <motion.div
                aria-hidden="true"
                className="pointer-events-none fixed top-[18%] -left-48 z-0 h-[32rem] w-[32rem] rounded-full bg-violet-700/[.09] blur-[150px]"
                animate={
                    reduceMotion
                        ? undefined
                        : { x: [0, 110, 20, 0], y: [0, 80, -25, 0] }
                }
                transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
            <motion.div
                aria-hidden="true"
                className="pointer-events-none fixed right-[-12rem] bottom-[8%] z-0 h-[36rem] w-[36rem] rounded-full bg-cyan-600/[.065] blur-[160px]"
                animate={
                    reduceMotion
                        ? undefined
                        : { x: [0, -90, -20, 0], y: [0, -60, 35, 0] }
                }
                transition={{
                    duration: 26,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
            <motion.div
                aria-hidden="true"
                className="fixed top-20 right-0 left-0 z-50 h-px origin-left bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-300 shadow-[0_0_12px_rgba(34,211,238,.75)]"
                style={{ scaleX: smoothScrollProgress }}
            />
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

            <main
                key={showIntro ? 'intro-active' : 'intro-complete'}
                id="main-content"
                tabIndex={-1}
                className="relative z-10"
            >
                <section className="relative min-h-screen overflow-hidden pt-20">
                    <motion.div
                        aria-hidden="true"
                        className="absolute top-16 left-[55%] h-[34rem] w-[34rem] rounded-full bg-violet-600/20 blur-[140px]"
                        animate={
                            reduceMotion
                                ? undefined
                                : {
                                      x: [0, 90, -25, 0],
                                      y: [0, 45, 80, 0],
                                      scale: [1, 1.18, 0.92, 1],
                                  }
                        }
                        transition={{
                            duration: 14,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.div
                        aria-hidden="true"
                        className="absolute bottom-0 -left-32 h-80 w-80 rounded-full bg-cyan-600/10 blur-[120px]"
                        animate={
                            reduceMotion
                                ? undefined
                                : {
                                      x: [0, 120, 40, 0],
                                      y: [0, -45, -90, 0],
                                      scale: [1, 1.25, 1.05, 1],
                                  }
                        }
                        transition={{
                            duration: 16,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.div
                        aria-hidden="true"
                        className="portfolio-grid absolute inset-0 opacity-40"
                        animate={
                            reduceMotion
                                ? undefined
                                : {
                                      backgroundPosition: [
                                          '0px 0px',
                                          '56px 56px',
                                      ],
                                  }
                        }
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                    <motion.div
                        aria-hidden="true"
                        className="hero-starfield absolute inset-0 opacity-65"
                        animate={
                            reduceMotion
                                ? undefined
                                : {
                                      backgroundPosition: [
                                          '0px 0px, 20px 12px, 8px 28px',
                                          '46px -30px, -24px 52px, 62px 4px',
                                      ],
                                  }
                        }
                        transition={{
                            duration: 24,
                            repeat: Infinity,
                            repeatType: 'mirror',
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.div
                        aria-hidden="true"
                        className="absolute top-[16%] right-[4%] h-[32rem] w-[52rem] rounded-[50%] border border-violet-300/[.07] shadow-[0_0_80px_rgba(139,92,246,.05)]"
                        animate={
                            reduceMotion
                                ? undefined
                                : { rotate: [-8, -3, -8], scale: [1, 1.04, 1] }
                        }
                        transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.div
                        aria-hidden="true"
                        className="absolute top-[31%] right-[10%] h-[22rem] w-[39rem] rounded-[50%] border border-cyan-300/[.055]"
                        animate={
                            reduceMotion
                                ? undefined
                                : { rotate: [7, 12, 7], scale: [1.03, 1, 1.03] }
                        }
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    {Array.from({ length: 24 }).map((_, index) => (
                        <motion.span
                            key={`star-${index}`}
                            aria-hidden="true"
                            className={`absolute rounded-full bg-white ${index % 5 === 0 ? 'size-1 shadow-[0_0_10px_rgba(103,232,249,.9)]' : 'size-0.5'}`}
                            style={{
                                top: `${8 + ((index * 37) % 84)}%`,
                                left: `${2 + ((index * 43) % 96)}%`,
                            }}
                            animate={
                                reduceMotion
                                    ? undefined
                                    : {
                                          opacity: [0.12, 0.75, 0.2],
                                          scale: [0.75, 1.25, 0.85],
                                      }
                            }
                            transition={{
                                duration: 3.4 + (index % 6) * 0.7,
                                delay: (index % 8) * 0.38,
                                repeat: Infinity,
                                repeatType: 'mirror',
                                ease: 'easeInOut',
                            }}
                        />
                    ))}
                    {Array.from({ length: 12 }).map((_, index) => (
                        <motion.span
                            key={index}
                            aria-hidden="true"
                            className="absolute hidden h-px w-20 bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent shadow-[0_0_8px_rgba(34,211,238,.28)] sm:block"
                            style={{
                                top: `${14 + ((index * 19) % 72)}%`,
                                left: `${4 + ((index * 23) % 88)}%`,
                                rotate: '-28deg',
                            }}
                            initial={{ opacity: 0, x: -30, y: 18 }}
                            animate={
                                reduceMotion
                                    ? undefined
                                    : {
                                          opacity: [0, 0.8, 0],
                                          x: [-30, 80],
                                          y: [18, -35],
                                      }
                            }
                            transition={{
                                duration: 2.4 + (index % 4) * 0.5,
                                delay: index * 0.45,
                                repeat: Infinity,
                                repeatDelay: 2.5 + (index % 3),
                                ease: 'easeOut',
                            }}
                        />
                    ))}
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
                                    <motion.span
                                        className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 bg-[length:220%_100%] bg-clip-text text-transparent"
                                        animate={
                                            reduceMotion
                                                ? undefined
                                                : {
                                                      backgroundPosition: [
                                                          '0% 50%',
                                                          '100% 50%',
                                                          '0% 50%',
                                                      ],
                                                  }
                                        }
                                        transition={{
                                            duration: 6,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                    >
                                        effortless.
                                    </motion.span>
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
                            {displayedStack
                                .slice(0, 4)
                                .map((technology, index) => {
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
                                                style={{
                                                    color: technology.color,
                                                }}
                                                aria-hidden="true"
                                            />
                                        </motion.div>
                                    );
                                })}
                            <motion.div
                                className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#101522] p-4 shadow-2xl shadow-black/50"
                                animate={
                                    reduceMotion
                                        ? undefined
                                        : {
                                              y: [0, -10, 0],
                                              rotate: [0, 0.6, 0, -0.5, 0],
                                          }
                                }
                                transition={{
                                    duration: 7,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                whileHover={
                                    reduceMotion
                                        ? undefined
                                        : { scale: 1.015, rotate: 0 }
                                }
                            >
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
                                    <motion.div
                                        aria-hidden="true"
                                        className="absolute inset-y-4 w-24 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent blur-sm"
                                        animate={
                                            reduceMotion
                                                ? undefined
                                                : { x: [-180, 520] }
                                        }
                                        transition={{
                                            duration: 2.2,
                                            delay: 1.5,
                                            repeat: Infinity,
                                            repeatDelay: 5,
                                            ease: 'easeInOut',
                                        }}
                                    />
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
                                    <motion.div
                                        animate={
                                            reduceMotion
                                                ? undefined
                                                : {
                                                      rotate: [0, 14, -10, 0],
                                                      scale: [1, 1.18, 1],
                                                  }
                                        }
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                    >
                                        <Sparkles className="text-violet-400" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        </Reveal>
                    </div>
                    <motion.a
                        href="#about"
                        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[9px] tracking-[.22em] text-slate-500 uppercase transition hover:text-cyan-300 lg:flex"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1, duration: 0.6 }}
                    >
                        Scroll to explore
                        <motion.span
                            animate={
                                reduceMotion ? undefined : { y: [0, 6, 0] }
                            }
                            transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="h-8 w-px bg-gradient-to-b from-violet-400 to-transparent"
                        />
                    </motion.a>
                </section>

                <section
                    className="overflow-hidden border-y border-white/[.07] bg-white/[.025] py-5"
                    aria-label="Core technology stack"
                >
                    <div className="tech-marquee flex w-max gap-4 px-2">
                        {[...displayedStack, ...displayedStack].map(
                            (technology, index) => (
                                <TechMark
                                    key={`${technology.name}-${index}`}
                                    technology={technology}
                                    compact
                                    hiddenFromAssistiveTechnology={
                                        index >= displayedStack.length
                                    }
                                />
                            ),
                        )}
                    </div>
                </section>
                <section
                    id="about"
                    className="relative scroll-mt-24 overflow-hidden px-5 py-28 lg:px-8"
                >
                    <SectionAura side="right" />
                    <div className="relative mx-auto max-w-7xl">
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
                                ].map(([title, copy], index) => (
                                    <motion.div
                                        key={title}
                                        className="group relative overflow-hidden bg-[#0b0e17] p-8"
                                        whileHover={
                                            reduceMotion ? undefined : { y: -7 }
                                        }
                                        transition={{
                                            type: 'spring',
                                            stiffness: 280,
                                            damping: 22,
                                        }}
                                    >
                                        <motion.span
                                            aria-hidden="true"
                                            className="absolute top-0 left-0 h-px w-full origin-left bg-gradient-to-r from-violet-400 to-cyan-300"
                                            initial={{ scaleX: 0 }}
                                            whileInView={{ scaleX: 1 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                duration: 0.8,
                                                delay: index * 0.12,
                                            }}
                                        />
                                        <p className="text-xl font-semibold text-white">
                                            {title}
                                        </p>
                                        <p className="mt-3 leading-7 text-slate-400">
                                            {copy}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </Reveal>
                    </div>
                </section>
                <section
                    id="experience"
                    className="content-auto relative scroll-mt-24 overflow-hidden bg-white/[.02] px-5 py-28 lg:px-8"
                >
                    <SectionAura side="left" />
                    <div className="relative mx-auto max-w-7xl">
                        <Heading
                            eyebrow="02 / Experience"
                            title="Learning. Building. Contributing."
                            copy="A growing timeline of academic projects and professional experience."
                        />
                        {experiences.length > 0 ? (
                            <div className="relative mt-12 space-y-6 before:absolute before:top-8 before:bottom-8 before:left-6 before:w-px before:bg-gradient-to-b before:from-violet-400/70 before:via-cyan-400/25 before:to-transparent md:before:left-8">
                                {experiences.map((item, index) => (
                                    <Reveal
                                        key={item.id}
                                        delay={index * 0.06}
                                        className="relative pl-16 md:pl-24"
                                    >
                                        <motion.div
                                            className="absolute top-8 left-0 flex size-12 items-center justify-center rounded-2xl border border-violet-400/30 bg-[#111526] text-sm font-black text-violet-200 md:size-16"
                                            animate={
                                                reduceMotion
                                                    ? undefined
                                                    : {
                                                          boxShadow: [
                                                              '0 0 24px rgba(139,92,246,.16)',
                                                              '0 0 42px rgba(34,211,238,.25)',
                                                              '0 0 24px rgba(139,92,246,.16)',
                                                          ],
                                                      }
                                            }
                                            transition={{
                                                duration: 3.2,
                                                delay: index * 0.25,
                                                repeat: Infinity,
                                            }}
                                        >
                                            {String(index + 1).padStart(2, '0')}
                                        </motion.div>
                                        <motion.article
                                            whileHover={
                                                reduceMotion
                                                    ? undefined
                                                    : { y: -5 }
                                            }
                                            className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.018))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.16)] transition duration-500 hover:border-violet-400/30 hover:shadow-[0_30px_100px_rgba(76,29,149,.2)] sm:p-8"
                                        >
                                            <div className="pointer-events-none absolute -top-24 -right-20 size-64 rounded-full bg-violet-500/10 blur-3xl transition duration-700 group-hover:bg-cyan-400/10" />
                                            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="flex min-w-0 items-start gap-4">
                                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[.055] text-violet-300 shadow-inner">
                                                        <BriefcaseBusiness
                                                            size={22}
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                    <div>
                                                        <p className="mb-2 font-mono text-[10px] tracking-[.2em] text-violet-300 uppercase">
                                                            Experience{' '}
                                                            {String(
                                                                index + 1,
                                                            ).padStart(2, '0')}
                                                        </p>
                                                        <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                                                            {item.role}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 font-mono text-xs text-violet-200">
                                                    <CalendarDays
                                                        size={14}
                                                        aria-hidden="true"
                                                    />
                                                    {formatDate(
                                                        item.started_at,
                                                    )}{' '}
                                                    —{' '}
                                                    {formatDate(item.ended_at)}
                                                </span>
                                            </div>
                                            <div className="relative mt-7 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/[.07] pt-6 text-sm text-slate-400">
                                                <span className="inline-flex items-center gap-2">
                                                    <Building2
                                                        size={16}
                                                        className="text-cyan-300"
                                                        aria-hidden="true"
                                                    />
                                                    {item.company}
                                                </span>
                                                {item.location && (
                                                    <span className="inline-flex items-center gap-2">
                                                        <MapPin
                                                            size={16}
                                                            className="text-violet-300"
                                                            aria-hidden="true"
                                                        />
                                                        {item.location}
                                                    </span>
                                                )}
                                            </div>
                                            {item.description && (
                                                <p className="relative mt-6 max-w-4xl text-base leading-8 text-slate-400">
                                                    {item.description}
                                                </p>
                                            )}
                                        </motion.article>
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
                    className="relative scroll-mt-24 overflow-hidden px-5 py-28 lg:px-8"
                >
                    <SectionAura side="right" />
                    <div className="relative mx-auto max-w-7xl">
                        <Heading
                            eyebrow="03 / Capabilities"
                            title="Tools for the whole stack."
                            copy="The public list below is managed from the private dashboard."
                        />
                        <div className="grid gap-5 md:grid-cols-2">
                            {Object.entries(groupedSkills).length ? (
                                Object.entries(groupedSkills).map(
                                    ([group, items], index) => (
                                        <Reveal
                                            key={group}
                                            delay={index * 0.06}
                                            className="group/skill rounded-3xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018))] p-7 transition duration-500 hover:-translate-y-1.5 hover:border-violet-400/30 hover:shadow-[0_30px_90px_rgba(76,29,149,.2)] sm:p-8"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <p className="font-mono text-xs tracking-[.22em] text-violet-300 uppercase">
                                                    {group}
                                                </p>
                                                <span className="rounded-full border border-white/10 bg-white/[.04] px-2.5 py-1 font-mono text-[10px] text-slate-500">
                                                    {String(
                                                        items.length,
                                                    ).padStart(2, '0')}
                                                </span>
                                            </div>
                                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                                {items?.map((skill) => {
                                                    const technology =
                                                        technologyForSkill(
                                                            skill,
                                                        );
                                                    const visual =
                                                        skillVisuals[
                                                            skill.icon?.toLowerCase() ??
                                                                ''
                                                        ] ??
                                                        skillVisuals[
                                                            skill.name.toLowerCase()
                                                        ];
                                                    const SkillIcon =
                                                        technology.icon;

                                                    return (
                                                        <motion.div
                                                            key={skill.id}
                                                            whileHover={
                                                                reduceMotion
                                                                    ? undefined
                                                                    : {
                                                                          y: -4,
                                                                          scale: 1.015,
                                                                      }
                                                            }
                                                            className="relative flex min-h-24 items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-4 transition duration-300 hover:border-white/20 hover:bg-white/[.055]"
                                                            style={{
                                                                boxShadow:
                                                                    visual
                                                                        ? `inset 0 1px 0 rgba(255,255,255,.04), 0 14px 35px rgba(${visual.glow},.06)`
                                                                        : undefined,
                                                            }}
                                                        >
                                                            {visual && (
                                                                <span
                                                                    className="pointer-events-none absolute -top-8 -left-8 size-24 rounded-full opacity-20 blur-3xl transition duration-500 group-hover/skill:opacity-35"
                                                                    style={{
                                                                        backgroundColor:
                                                                            visual.color,
                                                                    }}
                                                                />
                                                            )}
                                                            <span
                                                                className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[.055] shadow-inner"
                                                                style={{
                                                                    color: technology.color,
                                                                    boxShadow:
                                                                        visual
                                                                            ? `0 10px 28px rgba(${visual.glow},.16)`
                                                                            : undefined,
                                                                }}
                                                            >
                                                                <SkillIcon
                                                                    size={29}
                                                                    aria-hidden="true"
                                                                />
                                                            </span>
                                                            <span className="relative min-w-0">
                                                                <span className="block text-[10px] font-semibold tracking-[.16em] text-slate-600 uppercase">
                                                                    Technology
                                                                </span>
                                                                <span className="mt-1 block truncate text-base font-semibold text-slate-100">
                                                                    {skill.name}
                                                                </span>
                                                            </span>
                                                        </motion.div>
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
                                            {displayedStack.map(
                                                (technology) => (
                                                    <TechMark
                                                        key={technology.name}
                                                        technology={technology}
                                                        compact
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </Reveal>
                            )}
                        </div>
                    </div>
                </section>
                <section
                    id="projects"
                    className="relative scroll-mt-24 overflow-hidden bg-[#0a0d16]/70 px-5 py-28 backdrop-blur-[2px] lg:px-8"
                >
                    <SectionAura side="left" />
                    <div className="relative mx-auto max-w-7xl">
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
                            className={`grid items-start gap-7 ${visibleProjects.length === 1 ? 'mx-auto max-w-2xl' : 'lg:grid-cols-2'}`}
                        >
                            {visibleProjects.map((project, index) => {
                                return (
                                    <Reveal
                                        key={project.id}
                                        delay={index * 0.05}
                                        className="h-full w-full"
                                    >
                                        <article className="group relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(18,22,37,.96),rgba(10,13,22,.92))] p-2 shadow-[0_24px_80px_rgba(0,0,0,.2)] transition duration-500 hover:-translate-y-1.5 hover:border-violet-400/30 hover:shadow-[0_30px_90px_rgba(76,29,149,.2)]">
                                            <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/80 to-transparent" />
                                            <div className="pointer-events-none absolute -right-24 -bottom-24 size-56 rounded-full bg-violet-500/[.08] blur-3xl transition duration-700 group-hover:bg-cyan-400/[.08]" />
                                            <Link
                                                href={`/projects/${project.slug}`}
                                                className="relative flex h-full flex-col"
                                            >
                                                <div className="relative overflow-hidden rounded-[1.45rem] border border-white/[.08] bg-gradient-to-br from-violet-950 to-slate-950 shadow-[0_18px_50px_rgba(0,0,0,.2)]">
                                                    <div className="flex h-10 items-center justify-between border-b border-white/[.08] bg-[#0c101a]/95 px-4 backdrop-blur">
                                                        <div className="flex gap-1.5">
                                                            <span className="size-2 rounded-full bg-rose-400/80" />
                                                            <span className="size-2 rounded-full bg-amber-300/80" />
                                                            <span className="size-2 rounded-full bg-emerald-400/80" />
                                                        </div>
                                                        <span className="max-w-[62%] truncate rounded-full border border-white/[.07] bg-white/[.035] px-4 py-1 font-mono text-[9px] tracking-wider text-slate-500">
                                                            {project.slug}
                                                        </span>
                                                        <span className="font-mono text-[8px] tracking-[.12em] text-slate-600 uppercase">
                                                            LIVE
                                                        </span>
                                                    </div>
                                                    <div className="relative aspect-[16/8.8] overflow-hidden">
                                                        {project.is_featured && (
                                                            <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-slate-950/80 px-3 py-1.5 text-[10px] font-semibold tracking-[.16em] text-violet-200 uppercase shadow-lg backdrop-blur-md">
                                                                <Sparkles
                                                                    size={12}
                                                                    aria-hidden="true"
                                                                />
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
                                                                className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.035]"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full min-h-72 items-center justify-center">
                                                                <Code2
                                                                    size={54}
                                                                    className="text-violet-400/70"
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#090c14]/35 via-transparent to-transparent" />
                                                    </div>
                                                </div>
                                                <div className="relative flex h-full flex-col px-5 pt-6 pb-5 sm:px-6 sm:pt-7 sm:pb-6">
                                                    <div className="relative flex items-center justify-between gap-4">
                                                        <p className="font-mono text-[10px] tracking-[.22em] text-violet-300 uppercase">
                                                            {project.category ||
                                                                'Project'}
                                                        </p>
                                                        <span className="font-mono text-[10px] tracking-[.12em] text-slate-600">
                                                            {String(
                                                                index + 1,
                                                            ).padStart(2, '0')}
                                                            /
                                                            {String(
                                                                visibleProjects.length,
                                                            ).padStart(2, '0')}
                                                        </span>
                                                    </div>
                                                    <div className="relative mt-4 flex items-start justify-between gap-5">
                                                        <h3 className="text-2xl leading-tight font-semibold tracking-[-.025em] text-white">
                                                            {project.title}
                                                        </h3>
                                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[.045] text-violet-300 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:border-violet-400/30 group-hover:bg-violet-500/15">
                                                            <ArrowUpRight
                                                                size={17}
                                                                aria-hidden="true"
                                                            />
                                                        </span>
                                                    </div>
                                                    <p className="relative mt-3 line-clamp-2 leading-7 text-slate-400">
                                                        {project.description}
                                                    </p>
                                                    <div className="relative mt-5 flex flex-wrap gap-2">
                                                        {project.technologies
                                                            ?.slice(0, 4)
                                                            .map((tech) => (
                                                                <span
                                                                    key={tech}
                                                                    className="rounded-full border border-white/[.08] bg-white/[.04] px-3 py-1.5 text-[11px] text-slate-400 transition group-hover:border-violet-400/20 group-hover:text-slate-300"
                                                                >
                                                                    {tech}
                                                                </span>
                                                            ))}
                                                        {(project.technologies
                                                            ?.length ?? 0) >
                                                            4 && (
                                                            <span className="rounded-full border border-violet-400/15 bg-violet-500/[.07] px-3 py-1.5 text-[11px] text-violet-300">
                                                                +
                                                                {(project
                                                                    .technologies
                                                                    ?.length ??
                                                                    0) - 4}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="relative mt-6 border-t border-white/[.07] pt-5">
                                                        <span className="font-mono text-[10px] tracking-[.18em] text-slate-500 uppercase transition group-hover:text-violet-300">
                                                            Explore case study
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </article>
                                    </Reveal>
                                );
                            })}
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
                    className="content-auto relative scroll-mt-24 overflow-hidden px-5 py-28 lg:px-8"
                >
                    <SectionAura side="right" />
                    <div className="relative mx-auto max-w-7xl">
                        <Heading
                            eyebrow="05 / Certificates"
                            title="Credentials that back the craft."
                            copy="Verified learning milestones across software development and networking."
                        />
                        {certificates.length > 0 ? (
                            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                {certificates.map((item, index) => {
                                    return (
                                        <Reveal
                                            key={item.id}
                                            delay={index * 0.05}
                                            className="h-full"
                                        >
                                            <motion.article
                                                whileHover={
                                                    reduceMotion
                                                        ? undefined
                                                        : { y: -5 }
                                                }
                                                className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0d1019]/85 shadow-[0_20px_60px_rgba(0,0,0,.16)] transition duration-500 hover:border-violet-400/30 hover:shadow-[0_24px_70px_rgba(76,29,149,.16)]"
                                            >
                                                <div className="pointer-events-none absolute inset-x-10 top-0 z-20 h-px bg-gradient-to-r from-transparent via-violet-400/70 to-transparent" />
                                                <div className="relative z-10 overflow-hidden border-b border-white/[.08] bg-white">
                                                    <CertificateMedia
                                                        certificate={item}
                                                    />
                                                </div>
                                                <div className="relative flex flex-1 flex-col p-6">
                                                    <div className="pointer-events-none absolute -right-16 -bottom-16 size-36 rounded-full bg-violet-500/[.07] blur-3xl transition duration-700 group-hover:bg-cyan-400/[.08]" />
                                                    <h3 className="relative text-lg leading-snug font-semibold tracking-tight text-white">
                                                        {item.name}
                                                    </h3>
                                                    <p className="relative mt-2 text-sm text-slate-500">
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
                                                            className="relative mt-auto inline-flex w-fit items-center gap-2 pt-5 text-sm font-semibold text-violet-200 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
                                                        >
                                                            Verify credential
                                                            <ArrowUpRight
                                                                size={15}
                                                                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                                                aria-hidden="true"
                                                            />
                                                        </a>
                                                    )}
                                                </div>
                                            </motion.article>
                                        </Reveal>
                                    );
                                })}
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
