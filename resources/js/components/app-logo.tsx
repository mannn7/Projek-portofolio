export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl border border-violet-300 bg-gradient-to-br from-violet-100 to-cyan-50 text-xs font-black tracking-tight text-violet-700 shadow-lg shadow-violet-200/40 dark:border-violet-400/25 dark:from-violet-500/20 dark:to-cyan-400/10 dark:text-white dark:shadow-violet-950/20">
                FA
            </div>
            <div className="ml-1 grid flex-1 text-left">
                <span className="truncate text-sm leading-tight font-bold tracking-tight text-slate-900 dark:text-white">
                    FA
                    <span className="text-violet-600 dark:text-violet-400">
                        .DEV
                    </span>
                </span>
                <span className="truncate text-[10px] tracking-[0.16em] text-slate-500 uppercase">
                    Account center
                </span>
            </div>
        </>
    );
}
