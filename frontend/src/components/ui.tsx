'use client';

import React, { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/cn';

/* ------------------------------------------------------------------ *
 * Shared primitives. Every view composes from these so surfaces,
 * buttons, badges, dialogs, and empty states stay identical.
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
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div> : null}
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
  label,
  className,
}: {
  value?: number;
  tone?: 'neutral' | 'mark' | 'easy' | 'medium' | 'hard';
  label?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <div
      className={cn('bar', className)}
      role="progressbar"
      aria-label={label || 'Progress'}
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

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden />;
}

export function CardGridSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)} aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card card-pad">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-4 h-4 w-4/5" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-1.5 h-3 w-2/3" />
          <div className="mt-6 border-t border-line-soft pt-4">
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 6,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn('card overflow-hidden', className)} aria-hidden>
      <div className="flex items-center gap-4 border-b border-line bg-ink-850 px-5 py-3.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="ml-auto h-3 w-16" />
      </div>
      <div className="divide-y divide-line-soft">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="mt-2 h-3 w-1/3" />
            </div>
            <Skeleton className="hidden h-5 w-16 sm:block" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
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
          <Icon className="h-5 w-5" aria-hidden />
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
      {Icon ? <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : null}
      <div className="min-w-0 flex-1">{children}</div>
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
  const valueTone = tone ? { easy: 'text-easy', medium: 'text-medium', hard: 'text-hard', mark: 'text-mark-bright' }[tone] : 'text-white';
  return (
    <div className={cn('well p-4', className)}>
      <div className="stat-label">{label}</div>
      <div className={cn('stat-value mt-1', valueTone)}>{value}</div>
      {note ? <div className="stat-note mt-2">{note}</div> : null}
    </div>
  );
}

/* ------------------------------- dialogs --------------------------- */

const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  dismissible = true,
}: {
  open: boolean;
  onClose?: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  dismissible?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      const preferred = panelRef.current?.querySelector<HTMLElement>('[data-autofocus]');
      const first = panelRef.current?.querySelector<HTMLElement>(focusableSelector);
      (preferred || first || panelRef.current)?.focus();
    }, 10);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissible) {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => element.offsetParent !== null || element === document.activeElement);

      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, dismissible]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && dismissible) onCloseRef.current?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className="w-full max-w-md overflow-hidden rounded-lg border border-line-strong bg-ink-800 shadow-pop animate-fade-up"
      >
        <div className="border-b border-line px-6 py-5">
          <h2 id={titleId} className="text-lg font-semibold text-white">
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className="mt-1.5 text-sm leading-relaxed text-fg-3">
              {description}
            </p>
          ) : null}
        </div>

        {children ? <div className="px-6 py-5">{children}</div> : null}

        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-ink-850/60 px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      dismissible={!busy}
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onCancel} disabled={busy} data-autofocus>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            size="md"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </>
      }
    />
  );
}
