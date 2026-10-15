export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl border border-violet-400/25 bg-gradient-to-br from-violet-500/20 to-cyan-400/10 text-xs font-black tracking-tight text-white shadow-lg shadow-violet-950/20">
                FA
            </div>
            <div className="ml-1 grid flex-1 text-left">
                <span className="truncate text-sm leading-tight font-bold tracking-tight text-white">
                    FA<span className="text-violet-400">.DEV</span>
                </span>
                <span className="truncate text-[10px] tracking-[0.16em] text-slate-500 uppercase">
                    Account center
                </span>
            </div>
        </>
    );
}
