import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Palette,
    ShieldCheck,
    UserRound,
    UsersRound,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import { index as teams } from '@/routes/teams';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: UserRound,
    },
    {
        title: 'Security',
        href: editSecurity(),
        icon: ShieldCheck,
    },
    {
        title: 'Teams',
        href: teams(),
        icon: UsersRound,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden px-4 py-8 sm:px-7 lg:px-10 lg:py-12">
            <div className="pointer-events-none absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-violet-600/10 blur-[110px]" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 -z-10 h-72 w-72 rounded-full bg-cyan-500/5 blur-[100px]" />

            <div className="mx-auto max-w-6xl">
                <Link
                    href="/admin"
                    className="mb-7 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-violet-300"
                >
                    <ArrowLeft className="size-4" />
                    Back to portfolio CMS
                </Link>

                <div className="mb-9 max-w-2xl">
                    <p className="mb-3 text-xs font-bold tracking-[0.28em] text-violet-400 uppercase">
                        FA.DEV / Account center
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Account settings
                    </h1>
                    <p className="mt-3 leading-relaxed text-slate-400">
                        Manage your identity, access security, workspace, and
                        interface preferences.
                    </p>
                </div>

                <div className="grid gap-7 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
                    <aside className="w-full">
                        <nav
                            className="flex gap-2 overflow-x-auto rounded-2xl border border-white/8 bg-white/[0.025] p-2 lg:flex-col"
                            aria-label="Settings"
                        >
                            {sidebarNavItems.map((item, index) => (
                                <Link
                                    key={`${toUrl(item.href)}-${index}`}
                                    href={item.href}
                                    className={cn(
                                        'flex min-w-max items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white lg:w-full',
                                        isCurrentOrParentUrl(item.href) &&
                                            'bg-gradient-to-r from-violet-500/20 to-violet-500/5 text-violet-200 ring-1 ring-violet-400/15',
                                    )}
                                >
                                    {item.icon && (
                                        <item.icon className="size-4" />
                                    )}
                                    {item.title}
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    <div className="min-w-0">
                        <section className="space-y-6 [&>div]:rounded-2xl [&>div]:border [&>div]:border-white/8 [&>div]:bg-white/[0.025] [&>div]:p-5 [&>div]:shadow-2xl [&>div]:shadow-black/10 sm:[&>div]:p-7">
                            {children}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
