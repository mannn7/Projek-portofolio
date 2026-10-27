import { Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Code2, ShieldCheck } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const assurances = [
    'Akses khusus pengelola portofolio',
    'Sesi aman dengan perlindungan Laravel',
    'Konten publik tetap terpisah dari panel admin',
];

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <main className="auth-shell relative min-h-svh overflow-hidden bg-[#060810] text-slate-100">
            <div className="auth-grid pointer-events-none absolute inset-0" />
            <div className="pointer-events-none absolute -top-40 left-[12%] size-[30rem] rounded-full bg-violet-600/15 blur-[130px]" />
            <div className="pointer-events-none absolute right-[-12rem] bottom-[-12rem] size-[34rem] rounded-full bg-cyan-500/10 blur-[140px]" />
            <div className="auth-beam pointer-events-none absolute top-[18%] -left-32 h-px w-[38rem] -rotate-[18deg]" />
            <div className="auth-beam pointer-events-none absolute right-[-10rem] bottom-[20%] h-px w-[34rem] rotate-[24deg]" />

            <div className="relative mx-auto flex min-h-svh w-full max-w-[1440px] flex-col px-5 py-5 sm:px-8 lg:px-12">
                <header className="flex items-center justify-between">
                    <Link
                        href={home()}
                        className="group inline-flex items-center gap-3"
                        aria-label="Kembali ke beranda FA.DEV"
                    >
                        <span className="relative size-10 overflow-hidden rounded-full border border-white/20 bg-white/[0.055] p-0.5 shadow-[0_10px_35px_rgba(0,0,0,.28)] transition group-hover:border-cyan-300/60">
                            <img
                                src="/images/fadev-intro-profile.jpeg"
                                alt=""
                                className="h-full w-full rounded-full object-cover object-top"
                            />
                        </span>
                        <span className="text-lg font-black tracking-tight text-white">
                            FA<span className="text-violet-400">.DEV</span>
                        </span>
                    </Link>

                    <Link
                        href={home()}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                    >
                        <ArrowLeft className="size-4" />
                        <span className="hidden sm:inline">
                            Kembali ke portofolio
                        </span>
                        <span className="sm:hidden">Kembali</span>
                    </Link>
                </header>

                <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,510px)] lg:py-14">
                    <section className="hidden max-w-2xl lg:block">
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-300">
                            <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.8)]" />
                            Private workspace
                        </div>
                        <div className="flex items-center gap-7">
                            <div className="relative size-32 shrink-0 xl:size-36">
                                <span className="auth-logo-orbit absolute -inset-3 rounded-full border border-dashed border-cyan-200/45" />
                                <span className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-violet-500 via-fuchsia-400 to-cyan-300 p-px shadow-[0_0_45px_rgba(34,211,238,.28)]">
                                    <span className="block h-full w-full rounded-full bg-[#090d18]" />
                                </span>
                                <img
                                    src="/images/fadev-intro-profile.jpeg"
                                    alt="Firman Aji — FA.DEV"
                                    className="relative h-full w-full rounded-full border-2 border-white/60 object-cover object-top"
                                />
                                <span className="absolute right-1 bottom-2 size-4 rounded-full border-2 border-white bg-emerald-400 shadow-[0_0_16px_#34d399]" />
                            </div>
                            <div>
                                <p className="font-mono text-xs tracking-[.3em] text-cyan-200 uppercase">
                                    Welcome back
                                </p>
                                <div className="mt-2 text-6xl font-black tracking-[-.08em] text-white xl:text-7xl">
                                    FA
                                    <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
                                        .DEV
                                    </span>
                                </div>
                            </div>
                        </div>

                        <h1 className="mt-9 max-w-xl text-5xl leading-[1.04] font-black tracking-[-.045em] text-white xl:text-6xl">
                            Kendali penuh, tanpa distraksi.
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
                            Satu ruang privat untuk memperbarui proyek,
                            keterampilan, pengalaman, dan sertifikat sebelum
                            tampil di portofolio publik.
                        </p>

                        <ul className="mt-9 grid gap-3 text-sm text-slate-300">
                            {assurances.map((assurance) => (
                                <li
                                    key={assurance}
                                    className="flex items-center gap-3"
                                >
                                    <CheckCircle2 className="size-4 text-cyan-300" />
                                    {assurance}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-9 flex items-center gap-3 text-xs text-slate-600">
                            <span className="flex size-8 items-center justify-center rounded-lg border border-white/8 bg-white/[0.025] text-violet-300">
                                <Code2 className="size-3.5" />
                            </span>
                            Laravel-powered content workspace
                        </div>
                    </section>

                    <section className="mx-auto w-full max-w-[510px]">
                        <div className="auth-login-card relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d111d]/88 p-6 shadow-[0_30px_100px_rgba(0,0,0,.52)] backdrop-blur-2xl sm:p-9">
                            <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-violet-400 to-cyan-300" />
                            <div className="pointer-events-none absolute -top-24 -right-24 size-56 rounded-full bg-violet-500/10 blur-[70px]" />

                            <div className="relative mb-8">
                                <div className="mb-7 flex items-center justify-between gap-5">
                                    <div className="relative size-20">
                                        <span className="auth-logo-orbit absolute -inset-2 rounded-full border border-dashed border-cyan-200/40" />
                                        <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-violet-500 via-fuchsia-400 to-cyan-300 p-px">
                                            <span className="block h-full w-full rounded-full bg-[#0d111d]" />
                                        </span>
                                        <img
                                            src="/images/fadev-intro-profile.jpeg"
                                            alt="Logo FA.DEV"
                                            className="relative h-full w-full rounded-full border border-white/50 object-cover object-top"
                                        />
                                        <span className="absolute right-0 bottom-1 size-3 rounded-full border-2 border-[#0d111d] bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                                    </div>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-3 py-1.5 font-mono text-[9px] tracking-[.18em] text-violet-200 uppercase">
                                        <ShieldCheck className="size-3.5" />
                                        Secure portal
                                    </span>
                                </div>

                                <div>
                                    <p className="font-mono text-[11px] tracking-[.24em] text-violet-300 uppercase">
                                        Admin access
                                    </p>
                                    <h2 className="mt-3 text-3xl font-bold tracking-[-.035em] text-white">
                                        {title}
                                    </h2>
                                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                                        {description}
                                    </p>
                                </div>
                            </div>
                            <div className="relative">{children}</div>
                        </div>

                        <p className="mt-5 text-center text-xs leading-5 text-slate-600">
                            Area privat FA.DEV · Aktivitas login dilindungi oleh
                            pembatasan percobaan akses.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
