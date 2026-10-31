import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ProgressBar } from '@/components/ui';

export type SheetSummary = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  totalProblems?: number;
  solvedProblems?: number;
  progressPercent?: number;
};

export default function SheetCard({ sheet }: { sheet: SheetSummary }) {
  const total = sheet.totalProblems || 0;
  const solved = sheet.solvedProblems || 0;
  const percent = Math.max(
    0,
    Math.min(100, Math.round(sheet.progressPercent ?? (total ? (solved / total) * 100 : 0)))
  );

  return (
    <Link
      href={`/sheets/${sheet.slug}`}
      className="card card-pad card-hover group flex flex-col focus-visible:outline-offset-4"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow">{sheet.category || 'SDE sheet'}</span>
        <ArrowUpRight
          className="h-4 w-4 text-fg-4 transition-colors group-hover:text-mark-bright"
          aria-hidden
        />
      </div>

      <h3 className="mt-3 text-[15px] font-semibold leading-snug text-white sm:text-base">
        {sheet.title}
      </h3>
      {sheet.description ? (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-fg-3">
          {sheet.description}
        </p>
      ) : null}

      <div className="mt-auto pt-5">
        <div className="mb-2 flex items-baseline justify-between gap-2 text-xs">
          <span className="text-fg-3">
            {solved} of {total} solved
          </span>
          <span className="font-medium tabular-nums text-fg-2">{percent}%</span>
        </div>
        <ProgressBar value={percent} tone="mark" label={`${sheet.title} progress`} />
      </div>
    </Link>
  );
}
