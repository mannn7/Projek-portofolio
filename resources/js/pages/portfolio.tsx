
import { Head } from '@inertiajs/react';
import { motion } from 'motion/react';
import {
    ArrowDown,
    ArrowRight,
    ArrowUpRight,
    BriefcaseBusiness,
    CalendarCheck2,
    CheckCircle2,
    ChevronRight,
    Code2,
    Database,
    ExternalLink,
    Github,
    Globe2,
    Layers3,
    Mail,
    MapPin,
    Menu,
    ShieldCheck,
    Terminal,
    X,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Contact', href: '#contact' },
];

const technologies = [
    { name: 'Laravel', type: 'Backend Framework', icon: Code2 },
    { name: 'React', type: 'Frontend Library', icon: Layers3 },
    { name: 'MySQL', type: 'Database', icon: Database },
    { name: 'Tailwind CSS', type: 'UI Styling', icon: Globe2 },
    { name: 'Git & GitHub', type: 'Version Control', icon: Github },
    { name: 'REST API', type: 'Backend Integration', icon: Terminal },
];

const fadeUp = {
    hidden: { opacity: 0, y: 26 },
    visible: { opacity: 1, y: 0 },
};

function Reveal({
    children,
    delay = 0,
    className = '',
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            variants={fadeUp}
            transition={{ duration: 0.65, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

function SectionHeading({
    number,
    title,
    description,
}: {
    number: string;
    title: string;
    description: string;
}) {
    return (
        <Reveal className="mb-10">
            <span className="text-sm font-semibold tracking-widest text-indigo-400">
                {number}
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-5xl">
                {title}
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-400">
                {description}
            </p>
        </Reveal>
    );
}

export default function Portfolio() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <Head title="Firman Aji | Full-Stack Developer">
                <meta
                    name="description"
                    content="Personal portfolio of Firman Aji. Web development, Laravel, React, and information systems."
                />
            </Head>

            <div className="min-h-screen overflow-x-hidden bg-[#080D19] font-sans text-slate-200 selection:bg-indigo-500/40">
                {/* NAVBAR */}
                <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#080D19]/80 backdrop-blur-xl">
                    <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
                        <a
                            href="#home"
                            className="flex items-center gap-3 text-xl font-black tracking-tight text-white"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                                <Code2 size={23} />
                            </span>
                            FA<span className="-ml-3 text-indigo-400">.DEV</span>
                        </a>

                        <div className="hidden items-center gap-8 md:flex">
                            {navigation.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="text-sm text-slate-400 transition hover:text-white"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>

                        <a
                            href="#contact"
                            className="hidden items-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-2.5 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/20 md:flex"
                        >
                            Let's Talk <ArrowUpRight size={16} />
                        </a>

                        <button
                            aria-label="Toggle navigation"
                            aria-expanded={mobileMenuOpen}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="rounded-lg border border-white/10 p-2 text-white md:hidden"
                        >
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </nav>

                    {mobileMenuOpen && (
                        <div className="border-t border-white/10 bg-[#0D1526] px-6 py-4 md:hidden">
                            {navigation.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-3 text-sm text-slate-300 hover:text-indigo-400"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    )}
                </header>

                <main>
                    {/* HERO SECTION */}
                    <section
                        id="home"
                        className="relative flex min-h-screen scroll-mt-20 items-center overflow-hidden pt-28"
                    >
                        <div className="pointer-events-none absolute -right-32 top-16 h-125 w-125 rounded-full bg-indigo-600/20 blur-[130px]" />
                        <div className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-blue-700/15 blur-[120px]" />

                        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:px-10">
                            <div>
                                <Reveal>
                                    <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-xs font-medium text-emerald-300">
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                                        Open to Opportunities
                                    </div>
                                </Reveal>

                                <Reveal delay={0.1}>
                                    <p className="mb-4 font-mono text-sm tracking-[0.2em] text-indigo-400">
                                        HELLO, I'M FIRMAN AJI
                                    </p>
                                    <h1 className="text-5xl leading-[1.12] font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
                                        Building
                                        <br />
                                        Digital
                                        <br />
                                        <span className="bg-linear-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                                            Experiences.
                                        </span>
                                    </h1>
                                </Reveal>

                                <Reveal delay={0.2}>
                                    <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">
                                        Full-Stack Web Developer focused on
                                        building clean, functional, and
                                        scalable web applications using
                                        Laravel, React, and modern technology.
                                    </p>
                                </Reveal>

                                <Reveal
                                    delay={0.3}
                                    className="mt-9 flex flex-wrap gap-4"
                                >
                                    <a
                                        href="#projects"
                                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-1 hover:bg-indigo-400"
                                    >
                                        Explore Projects
                                        <ArrowUpRight size={18} />
                                    </a>
                                    <a
                                        href="#contact"
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-indigo-400 hover:bg-white/5"
                                    >
                                        Contact Me <ArrowRight size={17} />
                                    </a>
                                </Reveal>

                                <Reveal delay={0.4}>
                                    <div className="mt-12 flex flex-wrap items-center gap-5 text-sm text-slate-500">
                                        <span className="flex items-center gap-2">
                                            <MapPin size={16} />
                                            Indonesia
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <Code2 size={16} />
                                            Laravel Developer
                                        </span>
                                    </div>
                                </Reveal>
                            </div>

                            {/* TERMINAL CARD */}
                            <Reveal delay={0.2}>
                                <motion.div
                                    whileHover={{ y: -6 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative mx-auto w-full max-w-xl rounded-2xl border border-indigo-400/20 bg-[#111B30] p-1 shadow-2xl shadow-indigo-950/40"
                                >
                                    <div className="rounded-xl bg-[#0B1220]">
                                        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                                            <div className="flex gap-2">
                                                <span className="h-3 w-3 rounded-full bg-red-400" />
                                                <span className="h-3 w-3 rounded-full bg-amber-400" />
                                                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                                            </div>
                                            <span className="font-mono text-xs text-slate-500">
                                                developer.ts
                                            </span>
                                            <Terminal size={16} className="text-slate-500" />
                                        </div>

                                        <div className="overflow-x-auto p-5 font-mono text-xs leading-8 sm:p-7 sm:text-sm">
                                            <p className="text-slate-500">
                                                // About the developer
                                            </p>
                                            <p>
                                                <span className="text-violet-400">
                                                    const
                                                </span>{' '}
                                                <span className="text-cyan-300">
                                                    developer
                                                </span>{' '}
                                                = {'{'}
                                            </p>
                                            <p className="pl-5">
                                                <span className="text-indigo-300">
                                                    name
                                                </span>
                                                :{' '}
                                                <span className="text-emerald-300">
                                                    "Firman Aji"
                                                </span>
                                                ,
                                            </p>
                                            <p className="pl-5">
                                                <span className="text-indigo-300">
                                                    role
                                                </span>
                                                :{' '}
                                                <span className="text-emerald-300">
                                                    "Full-Stack Developer"
                                                </span>
                                                ,
                                            </p>
                                            <p className="pl-5">
                                                <span className="text-indigo-300">
                                                    stack
                                                </span>
                                                : [
                                            </p>
                                            <p className="pl-10 text-emerald-300">
                                                "Laravel", "React",
                                            </p>
                                            <p className="pl-10 text-emerald-300">
                                                "MySQL", "Tailwind"
                                            </p>
                                            <p className="pl-5">],</p>
                                            <p className="pl-5">
                                                <span className="text-indigo-300">
                                                    passion
                                                </span>
                                                :{' '}
                                                <span className="text-emerald-300">
                                                    "Building Solutions"
                                                </span>
                                            </p>
                                            <p>{'}'};</p>

                                            <div className="mt-6 flex items-center gap-2 rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-300">
                                                <CheckCircle2 size={15} />
                                                System ready. Let's build!
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </Reveal>
                        </div>

                        <a
                            href="#about"
                            aria-label="Scroll to about section"
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500 transition hover:text-indigo-400"
                        >
                            <ArrowDown size={22} className="animate-bounce" />
                        </a>
                    </section>

                    {/* ABOUT SECTION */}
                    <section
                        id="about"
                        className="scroll-mt-20 border-t border-white/5 bg-[#0B1220] py-28"
                    >
                        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:px-10">
                            <div>
                                <SectionHeading
                                    number="01 / ABOUT ME"
                                    title="More than just code."
                                    description="I enjoy transforming ideas and real-world problems into useful digital solutions."
                                />

                                <Reveal>
                                    <p className="leading-8 text-slate-400">
                                        I'm Firman Aji, an Information Systems
                                        enthusiast with an interest in backend
                                        development, database design, and
                                        building modern web applications.
                                    </p>
                                    <p className="mt-5 leading-8 text-slate-400">
                                        My work combines system analysis and
                                        software development to create
                                        applications that simplify business
                                        processes and improve efficiency.
                                    </p>
                                </Reveal>
                            </div>

                            <Reveal className="grid gap-4 sm:grid-cols-2">
                                {[
                                    {
                                        icon: Code2,
                                        title: 'Backend Development',
                                        desc: 'Laravel and application logic',
                                    },
                                    {
                                        icon: Database,
                                        title: 'Database Design',
                                        desc: 'Structured and reliable data',
                                    },
                                    {
                                        icon: Layers3,
                                        title: 'Frontend UI',
                                        desc: 'Responsive modern interfaces',
                                    },
                                    {
                                        icon: ShieldCheck,
                                        title: 'System Analysis',
                                        desc: 'Practical software solutions',
                                    },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={item.title}
                                            className="rounded-2xl border border-white/10 bg-[#121D32] p-6 transition hover:border-indigo-400/40 hover:bg-[#17253D]"
                                        >
                                            <Icon
                                                size={24}
                                                className="mb-5 text-indigo-400"
                                            />
                                            <h3 className="font-semibold text-white">
                                                {item.title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                                {item.desc}
                                            </p>
                                        </div>
                                    );
                                })}
                            </Reveal>
                        </div>
                    </section>

                    {/* TECH STACK */}
                    <section
                        id="skills"
                        className="mx-auto max-w-7xl scroll-mt-20 px-6 py-28 lg:px-10"
                    >
                        <SectionHeading
                            number="02 / TECH STACK"
                            title="Tools & Technologies."
                            description="A selection of technologies used to design and develop web applications."
                        />

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {technologies.map((technology, index) => {
                                const Icon = technology.icon;
                                return (
                                    <Reveal key={technology.name} delay={index * 0.06}>
                                        <motion.div
                                            whileHover={{ y: -5 }}
                                            className="flex items-center gap-5 rounded-2xl border border-white/10 bg-[#121C30] p-6 transition-colors hover:border-indigo-400/40"
                                        >
                                            <div className="rounded-xl bg-indigo-500/10 p-4 text-indigo-400">
                                                <Icon size={25} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">
                                                    {technology.name}
                                                </h3>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {technology.type}
                                                </p>
                                            </div>
                                            <ChevronRight
                                                size={16}
                                                className="ml-auto text-slate-600"
                                            />
                                        </motion.div>
                                    </Reveal>
                                );
                            })}
                        </div>
                    </section>

                    {/* PROJECTS */}
                    <section
                        id="projects"
                        className="scroll-mt-20 border-y border-white/5 bg-[#0B1220] py-28"
                    >
                        <div className="mx-auto max-w-7xl px-6 lg:px-10">
                            <SectionHeading
                                number="03 / SELECTED WORK"
                                title="Featured Project."
                                description="A practical system-development project focused on solving operational challenges."
                            />

                            <Reveal>
                                <div className="grid overflow-hidden rounded-3xl border border-indigo-400/20 bg-[#121D32] lg:grid-cols-2">
                                    <div className="relative flex min-h-82.5 items-center justify-center overflow-hidden bg-linear-to-br from-[#1D2C58] via-[#172344] to-[#101829] p-10">
                                        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
                                        <div className="relative w-full max-w-sm rounded-2xl border border-indigo-300/20 bg-[#0D1629] p-5 shadow-2xl">
                                            <div className="mb-5 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CalendarCheck2 className="text-indigo-400" />
                                                    <span className="text-xs font-semibold text-white">
                                                        Attendance System
                                                    </span>
                                                </div>
                                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                            </div>
                                            <div className="mb-3 h-3 w-2/3 rounded-full bg-indigo-300/20" />
                                            <div className="mb-6 h-3 w-1/2 rounded-full bg-slate-400/15" />
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="rounded-xl bg-indigo-500/10 p-4">
                                                    <CalendarCheck2 className="mb-3 text-indigo-300" />
                                                    <div className="h-2 w-16 rounded bg-indigo-300/30" />
                                                </div>
                                                <div className="rounded-xl bg-emerald-500/10 p-4">
                                                    <ShieldCheck className="mb-3 text-emerald-300" />
                                                    <div className="h-2 w-16 rounded bg-emerald-300/30" />
                                                </div>
                                            </div>
                                            <p className="mt-5 text-center text-[11px] text-slate-500">
                                                UI illustration — replace with actual screenshot
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center p-8 md:p-12">
                                        <div className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-widest text-indigo-400">
                                            <BriefcaseBusiness size={15} />
                                            WEB APPLICATION
                                        </div>
                                        <h3 className="text-3xl font-bold text-white">
                                            Employee Attendance Management System
                                        </h3>
                                        <p className="mt-5 leading-8 text-slate-400">
                                            A Laravel-based attendance system
                                            integrating daily check-ins,
                                            geolocation validation, field
                                            assignments, leave requests, and
                                            administrative approval workflows.
                                        </p>

                                        <div className="mt-7 flex flex-wrap gap-2">
                                            {['Laravel', 'MySQL', 'GPS', 'Role-Based Access'].map(
                                                (tag) => (
                                                    <span
                                                        key={tag}
                                                        className="rounded-lg border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-300"
                                                    >
                                                        {tag}
                                                    </span>
                                                ),
                                            )}
                                        </div>

                                        <a
                                            href="#contact"
                                            className="mt-9 inline-flex items-center gap-2 font-semibold text-indigo-300 transition hover:text-white"
                                        >
                                            Ask About This Project
                                            <ExternalLink size={17} />
                                        </a>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </section>

                    {/* CONTACT */}
                    <section
                        id="contact"
                        className="mx-auto max-w-7xl scroll-mt-20 px-6 py-28 lg:px-10"
                    >
                        <Reveal>
                            <div className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-linear-to-br from-[#19264B] to-[#10182B] px-7 py-16 text-center md:px-16">
                                <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-indigo-500/15 blur-[90px]" />
                                <div className="relative">
                                    <p className="mb-4 font-mono text-sm tracking-widest text-indigo-300">
                                        04 / CONTACT
                                    </p>
                                    <h2 className="text-4xl font-extrabold text-white md:text-6xl">
                                        Let's build something
                                        <br />
                                        <span className="text-indigo-400">
                                            amazing together.
                                        </span>
                                    </h2>
                                    <p className="mx-auto mt-6 max-w-xl leading-8 text-slate-400">
                                        Interested in collaborating or
                                        discussing a web development project?
                                        Let's connect.
                                    </p>
                                    <div className="mt-9 flex flex-wrap justify-center gap-4">
                                        <a
                                            href="mailto:firmanaji432@gmail.com"
                                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-7 py-4 font-semibold text-white transition hover:bg-indigo-400"
                                        >
                                            <Mail size={19} />
                                            Send an Email
                                        </a>
                                        <a
                                            href="https://github.com/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-7 py-4 font-semibold text-white transition hover:bg-white/10"
                                        >
                                            <Github size={19} />
                                            GitHub
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </section>
                </main>

                {/* FOOTER */}
                <footer className="border-t border-white/10 py-9">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 md:flex-row lg:px-10">
                        <p>© {new Date().getFullYear()} FA.DEV. Built with Laravel & React.</p>
                        <div className="flex items-center gap-5">
                            <a href="#home" className="hover:text-white">
                                Back to top ↑
                            </a>
                            <span>Designed with purpose.</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
