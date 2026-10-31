'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LockKeyhole } from 'lucide-react';
import { LinkButton } from '@/components/ui';

export default function AuthRequired({
  title = 'Sign in to continue',
  description = 'This workspace keeps your code, submissions, and progress tied to your account.',
}: {
  title?: string;
  description?: string;
}) {
  const pathname = usePathname();
  const next = encodeURIComponent(pathname || '/problems');

  return (
    <div className="w-full flex-1">
      <div className="shell page">
        <div className="card">
          <div className="empty">
            <span className="empty-icon">
              <LockKeyhole className="h-5 w-5" aria-hidden />
            </span>
            <p className="empty-title">{title}</p>
            <p className="empty-sub">{description}</p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <LinkButton href={`/login?next=${next}`} variant="primary" size="md">
                Sign in
              </LinkButton>
              <Link
                href={`/login?mode=register&next=${next}`}
                className="btn btn-ghost btn-md"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
