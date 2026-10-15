import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowUpRight,
    Code2,
    ExternalLink,
    Github,
} from 'lucide-react';

type Project = {
    id: number;
    title: string;
    slug: string;
    description?: string;
    content?: string;
    category?: string;
    image?: string;
    technologies?: string[];
    github_url?: string;
    demo_url?: string;
};
export default function ProjectShow({
    project,
    relatedProjects,
}: {
    project: Project;
    relatedProjects: Project[];
}) {
    return (
        <div className="min-h-screen bg-[#070910] text-slate-200">
            <Head title={`${project.title} — FA.DEV`}>
                <meta
                    name="description"
                    content={project.description || project.title}
                />
            </Head>
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
            <main>
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
                        <img
                            src={`/storage/${project.image}`}
                            alt={`Screenshot of ${project.title}`}
                            className="mt-14 aspect-video w-full rounded-3xl border border-white/10 object-cover"
                        />
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
                                        className="group rounded-2xl border border-white/10 p-5 hover:border-violet-400/30"
                                    >
                                        <p className="font-semibold text-white">
                                            {item.title}
                                        </p>
                                        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                                            {item.description}
                                        </p>
                                        <ArrowUpRight
                                            className="mt-5 text-violet-400 transition group-hover:translate-x-1"
                                            size={17}
                                        />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
