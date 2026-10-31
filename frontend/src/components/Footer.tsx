'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';

const PLATFORM_LINKS = [
  { label: 'Problem set', href: '/problems' },
  { label: 'SDE sheets', href: '/sheets' },
  { label: 'Mock tests', href: '/assessments' },
  { label: 'Leaderboard', href: '/leaderboard' },
];

export default function SiteFooter() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(api.getUser());
  }, []);

  // Full-height application workspaces and the auth screen own the viewport.
  if (
    pathname === '/login' ||
    /^\/problems\/[^/]+/.test(pathname) ||
    /^\/assessments\/[^/]+/.test(pathname)
  ) {
    return null;
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'TRAINER';

  return (
    <footer className="mt-auto border-t border-line bg-ink-900">
      <div className="shell grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-mark text-white">
              <GraduationCap className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-white">
              Campus Bridge
            </span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-fg-3">
            Practice the coding rounds campus drives actually run. Problems, structured sheets, and
            timed mock tests judged in Python, C++, Java, and JavaScript.
          </p>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-fg-4">
            <ShieldCheck className="h-3.5 w-3.5 text-easy" aria-hidden />
            Hidden test cases are graded server-side.
          </p>
        </div>

        <nav aria-label="Platform">
          <h2 className="eyebrow">Platform</h2>
          <ul className="mt-3.5 space-y-2.5">
            {PLATFORM_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-fg-3 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account">
          <h2 className="eyebrow">Account</h2>
          <ul className="mt-3.5 space-y-2.5">
            {user ? (
              <>
                <li>
                  <Link
                    href="/profile"
                    className="text-sm text-fg-3 transition-colors hover:text-white"
                  >
                    My profile
                  </Link>
                </li>
                {isAdmin ? (
                  <li>
                    <Link
                      href="/admin"
                      className="text-sm text-fg-3 transition-colors hover:text-white"
                    >
                      Question studio
                    </Link>
                  </li>
                ) : null}
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-fg-3 transition-colors hover:text-white"
                  >
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login?mode=register"
                    className="text-sm text-fg-3 transition-colors hover:text-white"
                  >
                    Create an account
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      <div className="border-t border-line-soft">
        <div className="shell flex flex-col gap-1.5 py-4 text-xs text-fg-4 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Campus Bridge</p>
          <p>Built for placement cells and final-year candidates.</p>
        </div>
      </div>
    </footer>
  );
}
