import React, { forwardRef } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/cn';

/* ------------------------------------------------------------------ *
 * Shared primitives. Every view composes from these so surfaces,
 * buttons, badges and empty states stay identical across the app.
 * ------------------------------------------------------------------ */

/* ------------------------------- button ---------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantClass: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

export function buttonClass(
  opts: {
    variant?: ButtonVariant;
    size?: ButtonSize;
    block?: boolean;
    className?: string;
  } = {}
) {
  const { variant = 'secondary', size = 'md', block, className } = opts;
  return cn('btn', sizeClass[size], variantClass[variant], block && 'btn-block', className);
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', block, className, type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass({ variant, size, block, className })}
      {...rest}
    />
  );
});

export function LinkButton({
  href,
  variant = 'secondary',
  size = 'md',
  block,
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, 'href' | 'className' | 'children'>) {
  return (
    <Link href={href} className={buttonClass({ variant, size, block, className })} {...rest}>
      {children}
    </Link>
  );
}

/* -------------------------------- badges --------------------------- */

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

const difficultyClass: Record<string, string> = {
  EASY: 'badge-easy',
  MEDIUM: 'badge-medium',
  HARD: 'badge-hard',
};

const difficultyLabel: Record<string, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

export function DifficultyBadge({ difficulty, className }: { difficulty?: string; className?: string }) {
  if (!difficulty) return null;
  return (
    <span className={cn('badge', difficultyClass[difficulty] || 'badge-neutral', className)}>
      {difficultyLabel[difficulty] || difficulty}
    </span>
  );
}

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: 'neutral' | 'mark' | 'easy' | 'medium' | 'hard';
  children: React.ReactNode;
  className?: string;
}) {
  const toneClass = {
    neutral: 'badge-neutral',
    mark: 'badge-mark',
    easy: 'badge-easy',
    medium: 'badge-medium',
    hard: 'badge-hard',
  }[tone];

  return <span className={cn('badge', toneClass, className)}>{children}</span>;
}

export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('tag', className)}>{children}</span>;
}

/* ------------------------------ page chrome ------------------------ */

export function PageHeader({
  title,
  sub,
  actions,
  className,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('page-head', className)}>
      <div className="min-w-0">
        <h1 className="page-title">{title}</h1>
        {sub ? <p className="page-sub">{sub}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div> : null}
    </header>
  );
}

export function SectionHeader({
  title,
  sub,
  action,
  className,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('section-head', className)}>
      <div className="min-w-0">
        <h2 className="section-title">{title}</h2>
        {sub ? <p className="section-sub">{sub}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ------------------------------ progress --------------------------- */

const barTone: Record<string, string> = {
  neutral: 'bg-paper',
  mark: 'bg-mark',
  easy: 'bg-easy',
  medium: 'bg-medium',
  hard: 'bg-hard',
};

export function ProgressBar({
  value = 0,
  tone = 'neutral',
  className,
}: {
  value?: number;
  tone?: 'neutral' | 'mark' | 'easy' | 'medium' | 'hard';
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <div
      className={cn('bar', className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={cn('bar-fill', barTone[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ------------------------------- search ---------------------------- */

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  ...rest
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'className'>) {
  return (
    <div className={cn('relative', className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-4"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-9"
        {...rest}
      />
    </div>
  );
}

/* --------------------------- feedback states ----------------------- */

export function Spinner({ large, className }: { large?: boolean; className?: string }) {
  return <span className={cn('spinner', large && 'spinner-lg', className)} role="status" aria-label="Loading" />;
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="empty" role="status">
      <Spinner large />
      <p className="empty-sub">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  sub,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty">
      {Icon ? (
        <span className="empty-icon">
          <Icon className="w-5 h-5" aria-hidden />
        </span>
      ) : null}
      <p className="empty-title">{title}</p>
      {sub ? <p className="empty-sub">{sub}</p> : null}
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}

export function Notice({
  tone = 'ok',
  icon: Icon,
  children,
  action,
}: {
  tone?: 'ok' | 'err' | 'mark';
  icon?: LucideIcon;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const toneClass = { ok: 'notice-ok', err: 'notice-err', mark: 'notice-mark' }[tone];
  return (
    <div className={cn('notice', toneClass)} role={tone === 'err' ? 'alert' : 'status'}>
      {Icon ? <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden /> : null}
      <div className="flex-1 min-w-0">{children}</div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* -------------------------------- stats ---------------------------- */

export function Stat({
  label,
  value,
  note,
  tone,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  note?: React.ReactNode;
  tone?: 'easy' | 'medium' | 'hard' | 'mark';
  className?: string;
}) {
  const valueTone = tone ? { easy: 'text-easy', medium: 'text-medium', hard: 'text-hard', mark: 'text-mark' }[tone] : 'text-white';
  return (
    <div className={cn('well p-4', className)}>
      <div className="stat-label">{label}</div>
      <div className={cn('stat-value mt-1', valueTone)}>{value}</div>
      {note ? <div className="stat-note mt-2">{note}</div> : null}
    </div>
  );
}
