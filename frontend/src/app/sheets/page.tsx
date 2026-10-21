'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { BookMarked, Briefcase, Building2, Layers, Target, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { EmptyState, LoadingState, PageHeader, ProgressBar } from '@/components/ui';

/** Pick a mark that matches what the sheet is for, so the grid scans by shape. */
function iconFor(category: string): LucideIcon {
  const c = category?.toLowerCase() ?? '';
  if (c.includes('100') || c.includes('classic')) return Target;
  if (c.includes('service')) return Briefcase;
  if (c.includes('product')) return Building2;
  if (c.includes('pattern')) return Layers;
  if (c.includes('blind')) return Zap;
  return BookMarked;
}

export default function SheetsDirectoryPage() {
  const [sheets, setSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .getSheets()
      .then((data) => setSheets(data || []))
      .catch((e) => {
        console.error(e);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full flex-1">
      <div className="shell page">
        <PageHeader
          title="SDE sheets"
          sub="Structured paths through the patterns that recur in campus technical rounds — work them in order rather than picking problems at random."
          actions={
            <div className="rounded-md border border-line bg-ink-800 px-4 py-2.5 text-[13px]">
              <span className="text-base font-semibold tabular-nums leading-none text-white">
                {sheets.length}
              </span>{' '}
              <span className="text-fg-3">sheets</span>
            </div>
          }
        />

        {loading ? (
          <LoadingState label="Loading sheets…" />
        ) : failed ? (
          <EmptyState
            icon={Layers}
            title="Could not load sheets"
            sub="The API at http://localhost:4000 is not responding. Start the backend, then reload this page."
          />
        ) : sheets.length === 0 ? (
          <EmptyState
            icon={BookMarked}
            title="No sheets published yet"
            sub="When a trainer publishes a sheet it will show up here with your progress on it."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sheets.map((sheet) => {
              const Icon = iconFor(sheet.category || '');
              return (
                <Link
                  key={sheet.id}
                  href={`/sheets/${sheet.slug}`}
                  className="card card-pad card-hover flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-md border border-line bg-ink-750 text-fg-2">
                      <Icon className="h-[18px] w-[18px]" aria-hidden />
                    </span>
                    <span className="badge badge-neutral">{sheet.category}</span>
                  </div>

                  <h2 className="mt-4 text-base font-semibold leading-snug text-white">
                    {sheet.title}
                  </h2>
                  <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-fg-3">
                    {sheet.description}
                  </p>

                  <div className="mt-auto border-t border-line-soft pt-4">
                    <div className="mb-2 flex items-center justify-between text-[13px]">
                      <span className="text-fg-3">
                        {sheet.solvedProblems} of {sheet.totalProblems} solved
                      </span>
                      <span className="font-medium tabular-nums text-fg">
                        {sheet.progressPercent}%
                      </span>
                    </div>
                    <ProgressBar value={sheet.progressPercent} tone="mark" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
