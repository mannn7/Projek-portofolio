import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white/85 px-5 text-slate-800 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-7 dark:border-white/5 dark:bg-[#080d18]/90 dark:text-slate-200">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="hidden items-center gap-2 text-[11px] font-medium tracking-[0.15em] text-emerald-400 uppercase sm:flex">
                <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                Secure session
            </div>
        </header>
    );
}
