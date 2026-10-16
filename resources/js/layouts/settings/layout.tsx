import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { PropsWithChildren } from 'react';

export default function SettingsLayout({ children }: PropsWithChildren) {
    return (
        <div className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden px-4 py-8 sm:px-7 lg:px-10 lg:py-12">
            <div className="pointer-events-none absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-violet-300/25 blur-[110px] dark:bg-violet-600/10" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 -z-10 h-72 w-72 rounded-full bg-cyan-200/20 blur-[100px] dark:bg-cyan-500/5" />

            <div className="mx-auto max-w-6xl">
                <Link
                    href="/admin"
                    className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-violet-700 dark:text-slate-500 dark:hover:text-violet-300"
                >
                    <ArrowLeft className="size-4" />
                    Back to portfolio CMS
                </Link>

                <div className="mb-9 max-w-2xl">
                    <p className="mb-3 text-xs font-bold tracking-[0.28em] text-violet-600 uppercase dark:text-violet-400">
                        FA.DEV / Account center
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                        Account settings
                    </h1>
                    <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
                        Manage your identity, access security, workspace, and
                        interface preferences.
                    </p>
                </div>

                <section className="max-w-3xl space-y-6 [&>div]:rounded-2xl [&>div]:border [&>div]:border-slate-200 [&>div]:bg-white [&>div]:p-5 [&>div]:shadow-xl [&>div]:shadow-slate-200/40 sm:[&>div]:p-7 dark:[&>div]:border-white/8 dark:[&>div]:bg-white/[0.025] dark:[&>div]:shadow-2xl dark:[&>div]:shadow-black/10">
                    {children}
                </section>
            </div>
        </div>
    );
}
