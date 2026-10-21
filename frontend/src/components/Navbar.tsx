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
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  ShieldCheck,
  Timer,
  Trophy,
  User,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Problemset', href: '/problems', icon: FileCode2 },
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(api.getUser());
  }, []);

  // Route changes close every transient surface.
  useEffect(() => {
    setMenuOpen(false);
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const signIn = async (kind: 'student' | 'admin') => {
    try {
      setBusy(true);
      const res = kind === 'student' ? await api.demoLogin() : await api.demoAdminLogin();
      setUser(res.user);
      window.location.reload();
    } catch {
      window.alert(
        `Could not sign you in as ${kind === 'student' ? 'a student' : 'an admin'}. The API at http://localhost:4000 is not responding — start the backend and try again.`
      );
    } finally {
      setBusy(false);
    }
  };

  const signOut = () => {
    api.logout();
    setUser(null);
    window.location.href = '/';
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'TRAINER';
  const switchRole = () => signIn(isAdmin ? 'student' : 'admin');

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-line bg-ink-850 select-none">
      <div className="shell flex h-14 items-center justify-between gap-4">
        {/* Brand + primary navigation */}
        <div className="flex items-center gap-5 sm:gap-7 h-full min-w-0">
          <Link href="/" className="group flex items-center gap-2.5 shrink-0">
            <span className="grid h-7 w-7 place-items-center rounded-sm bg-mark text-[11px] font-bold tracking-tight text-ink-950 transition-transform duration-150 group-hover:scale-105">
              CB
            </span>
            <span className="hidden text-[15px] font-semibold tracking-tight text-white sm:block">
              Campus Bridge
            </span>
          </Link>

          <div className="hidden h-full items-center md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isCurrent(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex h-full items-center px-3 text-sm font-medium transition-colors duration-150 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-mark after:transition-opacity',
                    active ? 'text-white after:opacity-100' : 'text-fg-3 after:opacity-0 hover:text-fg'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/admin"
              aria-current={isCurrent(pathname, '/admin') ? 'page' : undefined}
              className={cn(
                'relative flex h-full items-center gap-1.5 px-3 text-sm font-medium transition-colors duration-150 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-mark after:transition-opacity',
                isCurrent(pathname, '/admin')
                  ? 'text-white after:opacity-100'
                  : isAdmin
                    ? 'text-fg-2 after:opacity-0 hover:text-white'
                    : 'text-fg-3 after:opacity-0 hover:text-fg'
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
              Admin
              {isAdmin && <span className="h-1.5 w-1.5 rounded-full bg-mark" aria-hidden />}
            </Link>
          </div>
        </div>

        {/* Account actions */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              <button
                onClick={switchRole}
                disabled={busy}
                title={`Switch to ${isAdmin ? 'student' : 'admin'} view`}
                className={buttonClass({ variant: 'secondary', size: 'sm', className: 'hidden sm:inline-flex' })}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden />
                {isAdmin ? 'Student view' : 'Admin view'}
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="flex h-9 items-center gap-2 rounded-md border border-line-strong bg-ink-750 px-2 text-sm font-medium text-fg transition-colors hover:bg-ink-700"
                >
                  <span
                    className={cn(
                      'grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold text-ink-950',
                      isAdmin ? 'bg-mark' : 'bg-paper'
                    )}
                    aria-hidden
                  >
                    {isAdmin ? <ShieldCheck className="w-3 h-3" /> : (user.name || '?').charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden max-w-[110px] truncate text-white sm:block">{user.name}</span>
                  <ChevronDown
                    className={cn('h-3.5 w-3.5 text-fg-3 transition-transform', menuOpen && 'rotate-180')}
                    aria-hidden
                  />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-64 overflow-hidden rounded-lg border border-line-strong bg-ink-800 shadow-pop"
                  >
                    <div className="border-b border-line px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-fg-3">Signed in as</span>
                        <span className={cn('badge', isAdmin ? 'badge-mark' : 'badge-neutral')}>
                          {user.role?.toLowerCase()}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm font-medium text-white">{user.email}</p>
                    </div>

                    <div className="p-1.5">
                      <button
                        role="menuitem"
                        onClick={() => {
                          setMenuOpen(false);
                          switchRole();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm text-fg-2 transition-colors hover:bg-ink-750 hover:text-white"
                      >
                        <ArrowLeftRight className="h-4 w-4 text-fg-3" aria-hidden />
                        Switch to {isAdmin ? 'student' : 'admin'}
                      </button>

                      {isAdmin && (
                        <Link
                          role="menuitem"
                          href="/admin"
                          className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm text-fg-2 transition-colors hover:bg-ink-750 hover:text-white"
                        >
                          <LayoutDashboard className="h-4 w-4 text-fg-3" aria-hidden />
                          Question studio
                        </Link>
                      )}

                      <Link
                        role="menuitem"
                        href="/profile"
                        className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm text-fg-2 transition-colors hover:bg-ink-750 hover:text-white"
                      >
                        <User className="h-4 w-4 text-fg-3" aria-hidden />
                        My profile
                      </Link>

                      <div className="my-1 h-px bg-line" />

                      <button
                        role="menuitem"
                        onClick={signOut}
                        className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm text-hard transition-colors hover:bg-hard/10"
                      >
                        <LogOut className="h-4 w-4" aria-hidden />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => signIn('student')}
                disabled={busy}
                className={buttonClass({ variant: 'primary', size: 'sm', className: 'hidden sm:inline-flex' })}
              >
                <GraduationCap className="h-4 w-4" aria-hidden />
                Sign in
              </button>
              <button
                onClick={() => signIn('admin')}
                disabled={busy}
                className={buttonClass({ variant: 'secondary', size: 'sm', className: 'hidden lg:inline-flex' })}
              >
                <ShieldCheck className="h-4 w-4 text-fg-3" aria-hidden />
                Admin
              </button>
            </>
          )}

          <button
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={drawerOpen}
            className="btn btn-icon btn-secondary md:hidden"
          >
            {drawerOpen ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="border-t border-line bg-ink-850 md:hidden">
          <div className="shell flex flex-col gap-1 py-3">
            {NAV_ITEMS.map((item) => {
              const active = isCurrent(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    active ? 'bg-ink-750 text-white' : 'text-fg-2 hover:bg-ink-750 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4 text-fg-3" aria-hidden />
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/admin"
              aria-current={isCurrent(pathname, '/admin') ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isCurrent(pathname, '/admin') ? 'bg-ink-750 text-white' : 'text-fg-2 hover:bg-ink-750 hover:text-white'
              )}
            >
              <ShieldCheck className="h-4 w-4 text-fg-3" aria-hidden />
              Admin studio
            </Link>

            <div className="my-2 h-px bg-line" />

            <div className="flex flex-wrap items-center gap-2">
              {user ? (
                <>
                  <button onClick={switchRole} disabled={busy} className={buttonClass({ size: 'sm' })}>
                    <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden />
                    Switch to {isAdmin ? 'student' : 'admin'}
                  </button>
                  <Link href="/profile" className={buttonClass({ size: 'sm' })}>
                    <User className="h-3.5 w-3.5" aria-hidden />
                    Profile
                  </Link>
                  <button onClick={signOut} className={buttonClass({ variant: 'danger', size: 'sm' })}>
                    <LogOut className="h-3.5 w-3.5" aria-hidden />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => signIn('student')}
                    disabled={busy}
                    className={buttonClass({ variant: 'primary', size: 'sm' })}
                  >
                    <GraduationCap className="h-4 w-4" aria-hidden />
                    Sign in as student
                  </button>
                  <button
                    onClick={() => signIn('admin')}
                    disabled={busy}
                    className={buttonClass({ size: 'sm' })}
                  >
                    <ShieldCheck className="h-4 w-4" aria-hidden />
                    Sign in as admin
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
