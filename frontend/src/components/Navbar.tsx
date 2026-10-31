'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { buttonClass } from '@/components/ui';
import {
  ArrowLeftRight,
  ChevronDown,
  FileCode2,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  ShieldCheck,
  Timer,
  Trophy,
  User,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Problems', href: '/problems', icon: FileCode2 },
  { label: 'SDE Sheets', href: '/sheets', icon: Layers },
  { label: 'Mock Tests', href: '/assessments', icon: Timer },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
];

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [roleError, setRoleError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(api.getUser());
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!drawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      drawerRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    }, 20);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  const switchRole = async () => {
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'TRAINER';
    try {
      setBusy(true);
      setRoleError('');
      const res = isAdmin ? await api.demoLogin() : await api.demoAdminLogin();
      setUser(res.user);
      window.location.reload();
    } catch {
      setRoleError('Could not switch accounts. Check that the API is running.');
      setBusy(false);
    }
  };

  const signOut = () => {
    api.logout();
    setUser(null);
    window.location.href = '/';
  };

  if (pathname === '/login') return null;

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'TRAINER';
  const roleLabel = isAdmin ? 'Trainer' : 'Student';

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-50 w-full select-none border-b border-line bg-ink-900/95 backdrop-blur"
    >
      <div className="shell flex h-16 items-center justify-between gap-4">
        <div className="flex h-full min-w-0 items-center gap-3 lg:gap-7">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-mark text-white transition-colors group-hover:bg-mark-600">
              <GraduationCap className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-white">
              Campus Bridge
            </span>
          </Link>

          <div className="hidden h-full items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isCurrent(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex h-16 items-center whitespace-nowrap px-2.5 text-sm font-medium transition-colors duration-150 lg:px-3',
                    'after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:rounded-full after:bg-mark-bright after:transition-opacity lg:after:inset-x-3',
                    active
                      ? 'text-white after:opacity-100'
                      : 'text-fg-3 after:opacity-0 hover:text-fg'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                aria-current={isCurrent(pathname, '/admin') ? 'page' : undefined}
                className={cn(
                  'relative flex h-16 items-center gap-1.5 whitespace-nowrap px-2.5 text-sm font-medium transition-colors duration-150 lg:px-3',
                  'after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:rounded-full after:bg-accent after:transition-opacity lg:after:inset-x-3',
                  isCurrent(pathname, '/admin')
                    ? 'text-white after:opacity-100'
                    : 'text-fg-3 after:opacity-0 hover:text-fg'
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                Studio
              </Link>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((value) => !value)}
                aria-expanded={menuOpen}
                aria-controls="account-menu"
                aria-label={menuOpen ? 'Close account menu' : 'Open account menu'}
                className="flex h-9 items-center gap-2 rounded-md border border-line-strong bg-ink-800 px-2 text-sm font-medium text-fg transition-colors hover:bg-ink-750"
              >
                <span
                  className={cn(
                    'grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold text-white',
                    isAdmin ? 'bg-mark' : 'bg-accent/80 text-ink-950'
                  )}
                  aria-hidden
                >
                  {isAdmin ? (
                    <ShieldCheck className="h-3 w-3" />
                  ) : (
                    (user.name || '?').charAt(0).toUpperCase()
                  )}
                </span>
                <span className="hidden max-w-[140px] truncate text-white lg:block">{user.name}</span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 text-fg-3 transition-transform',
                    menuOpen && 'rotate-180'
                  )}
                  aria-hidden
                />
              </button>

              {menuOpen && (
                <div
                  id="account-menu"
                  aria-label="Account"
                  className="absolute right-0 mt-2 w-64 overflow-hidden rounded-lg border border-line-strong bg-ink-800 shadow-pop"
                >
                  <div className="border-b border-line px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-fg-3">Signed in as</span>
                      <span className={cn('badge', isAdmin ? 'badge-mark' : 'badge-neutral')}>
                        {roleLabel}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-white">{user.email}</p>
                  </div>

                  <div className="p-1.5">
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-sm text-fg-2 transition-colors hover:bg-white/[0.05] hover:text-white"
                    >
                      <User className="h-4 w-4 text-fg-3" aria-hidden />
                      My profile
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-sm text-fg-2 transition-colors hover:bg-white/[0.05] hover:text-white"
                      >
                        <LayoutDashboard className="h-4 w-4 text-fg-3" aria-hidden />
                        Question studio
                      </Link>
                    )}

                    <button
                      onClick={switchRole}
                      disabled={busy}
                      className="flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-sm text-fg-2 transition-colors hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
                    >
                      <ArrowLeftRight className="h-4 w-4 text-fg-3" aria-hidden />
                      {busy ? 'Switching…' : `Switch to ${isAdmin ? 'student' : 'trainer'} demo`}
                    </button>

                    {roleError ? (
                      <p className="px-2.5 pb-1 pt-0.5 text-xs text-hard" role="alert">
                        {roleError}
                      </p>
                    ) : null}

                    <div className="my-1 h-px bg-line" />

                    <button
                      onClick={signOut}
                      className="flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-sm text-hard transition-colors hover:bg-hard/10"
                    >
                      <LogOut className="h-4 w-4" aria-hidden />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonClass({
                  variant: 'primary',
                  size: 'sm',
                  className: 'hidden sm:inline-flex',
                })}
              >
                <LogIn className="h-4 w-4" aria-hidden />
                Sign in
              </Link>
              <Link
                href="/login?mode=register"
                className={buttonClass({
                  variant: 'ghost',
                  size: 'sm',
                  className: 'hidden lg:inline-flex',
                })}
              >
                Create account
              </Link>
            </>
          )}

          <button
            onClick={() => setDrawerOpen((value) => !value)}
            aria-label={drawerOpen ? 'Close site menu' : 'Open site menu'}
            aria-expanded={drawerOpen}
            aria-controls="mobile-menu"
            className="btn btn-icon btn-secondary md:hidden"
          >
            {drawerOpen ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </div>

      {drawerOpen && (
        <>
          <div
            className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/55 md:hidden"
            aria-hidden
            onClick={() => setDrawerOpen(false)}
          />
          <div
            id="mobile-menu"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto border-t border-line bg-ink-900 md:hidden"
          >
            <div className="shell flex flex-col gap-5 py-5">
              {user ? (
                <div className="flex items-center gap-3 rounded-lg border border-line bg-ink-800 p-3.5">
                  <span
                    className={cn(
                      'grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white',
                      isAdmin ? 'bg-mark' : 'bg-accent/80 text-ink-950'
                    )}
                    aria-hidden
                  >
                    {isAdmin ? <ShieldCheck className="h-4 w-4" /> : (user.name || '?').charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                    <p className="truncate text-xs text-fg-3">{user.email}</p>
                  </div>
                  <span className="ml-auto shrink-0 badge badge-neutral">{roleLabel}</span>
                </div>
              ) : null}

              <div className="flex flex-col gap-0.5">
                {NAV_ITEMS.map((item) => {
                  const active = isCurrent(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm font-medium transition-colors',
                        active
                          ? 'border-mark-bright bg-white/[0.04] text-white'
                          : 'border-transparent text-fg-2 hover:bg-white/[0.04] hover:text-white'
                      )}
                    >
                      <Icon className="h-4 w-4 text-fg-3" aria-hidden />
                      {item.label}
                    </Link>
                  );
                })}

                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2.5 text-sm font-medium text-fg-2 transition-colors hover:bg-white/[0.04] hover:text-white"
                >
                  <User className="h-4 w-4 text-fg-3" aria-hidden />
                  My profile
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2.5 text-sm font-medium text-fg-2 transition-colors hover:bg-white/[0.04] hover:text-white"
                  >
                    <ShieldCheck className="h-4 w-4 text-fg-3" aria-hidden />
                    Question studio
                  </Link>
                )}
              </div>

              <div className="border-t border-line pt-4">
                {user ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={switchRole}
                      disabled={busy}
                      className={buttonClass({ size: 'sm' })}
                    >
                      <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden />
                      {busy ? 'Switching…' : `Switch to ${isAdmin ? 'student' : 'trainer'} demo`}
                    </button>
                    <button
                      onClick={signOut}
                      className={buttonClass({ variant: 'danger', size: 'sm' })}
                    >
                      <LogOut className="h-3.5 w-3.5" aria-hidden />
                      Sign out
                    </button>
                    {roleError ? (
                      <p className="w-full text-xs text-hard" role="alert">
                        {roleError}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Link
                      href="/login"
                      className={buttonClass({ variant: 'primary', size: 'md', block: true })}
                    >
                      <LogIn className="h-4 w-4" aria-hidden />
                      Sign in
                    </Link>
                    <Link
                      href="/login?mode=register"
                      className={buttonClass({ size: 'md', block: true })}
                    >
                      Create a free account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
