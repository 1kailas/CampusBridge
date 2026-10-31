'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { buttonClass } from '@/components/ui';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react';

type Mode = 'signin' | 'register';

const HIGHLIGHTS = [
  'Curated company sheets and pattern-ordered problems.',
  'Timed mocks with hidden test cases and automatic scoring.',
  'Readiness reporting that shows exactly what to revise.',
];

function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/problems';
  return value;
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const [mode, setMode] = useState<Mode>(
    searchParams.get('mode') === 'register' ? 'register' : 'signin'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<'form' | 'student-demo' | 'trainer-demo' | null>(null);
  const [error, setError] = useState('');
  const [existingUser, setExistingUser] = useState<any>(null);

  useEffect(() => {
    setExistingUser(api.getUser());
  }, []);

  const goToApp = () => {
    window.location.href = next;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      setBusy('form');
      if (mode === 'register') {
        await api.register({ name, email, password, college });
      } else {
        await api.login(email, password);
      }
      goToApp();
    } catch (err: any) {
      setError(err?.message || 'We could not sign you in. Check your details and try again.');
      setBusy(null);
    }
  };

  const signInDemo = async (kind: 'student' | 'trainer') => {
    setError('');
    try {
      setBusy(kind === 'student' ? 'student-demo' : 'trainer-demo');
      if (kind === 'student') await api.demoLogin();
      else await api.demoAdminLogin();
      goToApp();
    } catch {
      setError('The demo account could not be opened. Check that the API service is running.');
      setBusy(null);
    }
  };

  const signOut = () => {
    api.logout();
    setExistingUser(null);
  };

  return (
    <div className="relative flex min-h-screen flex-1 bg-ink-900">
      <div className="pointer-events-none absolute inset-0 hero-surface" aria-hidden />
      <div className="pointer-events-none absolute inset-0 ruled grid-mask opacity-40" aria-hidden />

      <aside className="relative hidden w-[44%] max-w-[640px] flex-col justify-between overflow-y-auto border-r border-line bg-ink-850/50 p-10 lg:flex xl:p-14">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-mark text-white">
            <GraduationCap className="h-[18px] w-[18px]" aria-hidden />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-white">
            Campus Bridge
          </span>
        </Link>

        <div className="max-w-md py-10">
          <p className="eyebrow">Campus placements · 2026</p>
          <h1 className="mt-4 text-[2.4rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white xl:text-[2.75rem]">
            Walk into your coding round{' '}
            <span className="text-mark-bright">already prepared.</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-fg-3">
            One workspace for the questions, patterns, and time pressure that decide campus
            technical rounds — from TCS NQT to Amazon OA.
          </p>

          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-fg-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-easy" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-fg-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Secure JWT accounts
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            Python · C++ · Java · JavaScript
          </span>
        </div>
      </aside>

      <section className="relative flex w-full flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          <Link href="/" className="mb-8 inline-flex items-center gap-2.5 lg:hidden">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-mark text-white">
              <GraduationCap className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-white">
              Campus Bridge
            </span>
          </Link>

          {existingUser ? (
            <div className="card overflow-hidden">
              <div className="border-b border-line px-5 py-5 sm:px-6">
                <h1 className="text-xl font-semibold text-white">You are already signed in</h1>
                <p className="mt-1 text-sm text-fg-3">Continue where you left off.</p>
              </div>
              <div className="space-y-4 p-5 sm:p-6">
                <div className="flex items-center gap-3 rounded-md border border-line bg-ink-850 p-3.5">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-mark text-sm font-bold text-white">
                    {(existingUser.name || '?').charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{existingUser.name}</p>
                    <p className="truncate text-xs text-fg-3">{existingUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={goToApp}
                  className={buttonClass({ variant: 'primary', size: 'lg', block: true })}
                >
                  Continue
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
                <button onClick={signOut} className={buttonClass({ size: 'md', block: true })}>
                  Sign out and use another account
                </button>
              </div>
            </div>
          ) : (
            <>
              <header>
                <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                  {mode === 'signin' ? 'Welcome back' : 'Create your account'}
                </h1>
                <p className="mt-2 text-sm text-fg-3">
                  {mode === 'signin'
                    ? 'Sign in to continue your placement preparation.'
                    : 'Start tracking solved problems, mock scores, and readiness.'}
                </p>
              </header>

              <div className="mt-6 grid grid-cols-2 gap-1 rounded-md border border-line bg-ink-850 p-1">
                {(['signin', 'register'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setMode(tab);
                      setError('');
                    }}
                    aria-pressed={mode === tab}
                    className={cn(
                      'h-8 rounded text-[13px] font-medium transition-colors',
                      mode === tab
                        ? 'bg-ink-700 text-white'
                        : 'text-fg-3 hover:text-fg'
                    )}
                  >
                    {tab === 'signin' ? 'Sign in' : 'Create account'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
                {error && (
                  <div className="notice notice-err" role="alert" id="login-error">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span>{error}</span>
                  </div>
                )}

                {mode === 'register' && (
                  <>
                    <div>
                      <label htmlFor="login-name" className="label">
                        Full name
                      </label>
                      <div className="relative">
                        <User
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-4"
                          aria-hidden
                        />
                        <input
                          id="login-name"
                          required
                          autoComplete="name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          placeholder="Aditya Sharma"
                          className="input pl-9"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="login-college" className="label">
                        College <span className="label-hint">optional</span>
                      </label>
                      <div className="relative">
                        <Building2
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-4"
                          aria-hidden
                        />
                        <input
                          id="login-college"
                          autoComplete="organization"
                          value={college}
                          onChange={(event) => setCollege(event.target.value)}
                          placeholder="College of Engineering"
                          className="input pl-9"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="login-email" className="label">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-4"
                      aria-hidden
                    />
                    <input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@college.edu"
                      className="input pl-9"
                      aria-describedby={error ? 'login-error' : undefined}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="label">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-4"
                      aria-hidden
                    />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="At least 6 characters"
                      className="input px-9"
                      aria-describedby={error ? 'login-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded text-fg-4 transition-colors hover:bg-white/[0.05] hover:text-fg-2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy !== null}
                  className={buttonClass({ variant: 'primary', size: 'lg', block: true })}
                >
                  {busy === 'form' ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : null}
                  {mode === 'signin' ? 'Sign in' : 'Create account'}
                  {busy !== 'form' ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-line" aria-hidden />
                <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-fg-4">
                  Or use a demo account
                </span>
                <span className="h-px flex-1 bg-line" aria-hidden />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  onClick={() => signInDemo('student')}
                  disabled={busy !== null}
                  className={buttonClass({ variant: 'secondary', size: 'lg' })}
                >
                  {busy === 'student-demo' ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <GraduationCap className="h-4 w-4 text-fg-3" aria-hidden />
                  )}
                  Student demo
                </button>
                <button
                  onClick={() => signInDemo('trainer')}
                  disabled={busy !== null}
                  className={buttonClass({ variant: 'secondary', size: 'lg' })}
                >
                  {busy === 'trainer-demo' ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-fg-3" aria-hidden />
                  )}
                  Trainer demo
                </button>
              </div>

              <p className="mt-3 text-center text-xs leading-relaxed text-fg-4">
                Demo accounts are pre-seeded. No password is required.
              </p>
            </>
          )}

          <p className="mt-8 text-center text-xs text-fg-4">
            <Link href="/" className="transition-colors hover:text-fg-2">
              Back to the platform
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-ink-900">
          <span className="spinner spinner-lg" role="status" aria-label="Loading" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
