import { Form, Head } from '@inertiajs/react';
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TeamInvitationAlert from '@/components/team-invitation-alert';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import type { TeamInvitationContext } from '@/types';

type Props = {
    status?: string;
    canResetPassword: boolean;
    teamInvitation?: TeamInvitationContext | null;
};

export default function Login({
    status,
    canResetPassword,
    teamInvitation,
}: Props) {
    return (
        <>
            <Head title="Log in" />

            {teamInvitation && (
                <TeamInvitationAlert
                    invitation={teamInvitation}
                    action="Log in"
                />
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium text-slate-200"
                                >
                                    Alamat email
                                </Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="nama@email.com"
                                        className="h-12 rounded-xl border-white/10 bg-black/20 pl-11 text-white shadow-none placeholder:text-slate-600 focus-visible:border-violet-400/70 focus-visible:ring-violet-500/15"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium text-slate-200"
                                    >
                                        Kata sandi
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-xs text-violet-300 no-underline transition hover:text-violet-200"
                                            tabIndex={5}
                                        >
                                            Lupa kata sandi?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative [&_input]:h-12 [&_input]:rounded-xl [&_input]:border-white/10 [&_input]:bg-black/20 [&_input]:pl-11 [&_input]:text-white [&_input]:shadow-none [&_input]:placeholder:text-slate-600 [&_input]:focus-visible:border-violet-400/70 [&_input]:focus-visible:ring-violet-500/15">
                                    <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2 text-slate-500" />
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Masukkan kata sandi"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm text-slate-400"
                                >
                                    Ingat saya di perangkat ini
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 font-semibold text-white shadow-[0_14px_35px_rgba(124,58,237,.24)] transition hover:from-violet-400 hover:to-violet-500"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Masuk ke dashboard
                                {!processing && (
                                    <ArrowRight className="size-4" />
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] px-4 py-3 text-center text-sm font-medium text-emerald-300">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Selamat datang kembali.',
    description: 'Masuk dengan akun admin untuk mengelola konten portofolio.',
};
