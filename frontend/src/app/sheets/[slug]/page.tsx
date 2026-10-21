'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowLeft, ArrowRight, BookMarked, Circle, SearchX } from 'lucide-react';
import {
  DifficultyBadge,
  EmptyState,
  LoadingState,
  ProgressBar,
  Tag,
} from '@/components/ui';

export default function SingleSheetPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [sheet, setSheet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api
      .getSheetBySlug(slug)
      .then(setSheet)
      .catch((e) => {
        console.error(e);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full flex-1">
        <div className="shell page">
          <LoadingState label="Opening sheet…" />
        </div>
      </div>
    );
  }

  if (failed || !sheet) {
    return (
      <div className="w-full flex-1">
        <div className="shell page">
          <EmptyState
            icon={SearchX}
            title="Sheet not found"
            sub="This sheet may have been unpublished, or the link is out of date."
            action={
              <Link href="/sheets" className="btn btn-secondary btn-sm">
                Back to sheets
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const problems: any[] = sheet.problems || [];
  const solvedCount = problems.filter((p) => p.isSolved).length;

  return (
    <div className="w-full flex-1">
      <div className="shell page">
        <Link
          href="/sheets"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-3 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          All sheets
        </Link>

        {/* Sheet header */}
        <header className="card flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <span className="badge badge-neutral">{sheet.category}</span>
            <h1 className="mt-2.5 text-2xl font-semibold tracking-[-0.022em] text-white sm:text-3xl">
              {sheet.title}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-fg-2">
              {sheet.description}
            </p>
            <p className="mt-3 text-[13px] text-fg-4">
              <span className="tabular-nums">{problems.length} problems</span>
              <span className="mx-2 text-fg-4/60" aria-hidden>
                /
              </span>
              <span className="tabular-nums text-easy">{solvedCount} solved</span>
            </p>
          </div>

          <div className="w-full shrink-0 rounded-lg border border-line bg-ink-750 p-4 sm:min-w-[280px] lg:w-[280px]">
            <div className="flex items-baseline justify-between gap-3">
              <span className="stat-label">Your progress</span>
              <span className="text-sm font-semibold tabular-nums text-white">
                {sheet.solvedProblems} / {sheet.totalProblems}
              </span>
            </div>
            <ProgressBar value={sheet.progressPercent} tone="mark" className="mt-2.5 h-2" />
            <p className="mt-2 text-xs tabular-nums text-fg-4">
              {sheet.progressPercent}% complete
            </p>
          </div>
        </header>

        {/* Problem list */}
        <section className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table min-w-[760px]">
              <thead className="thead">
                <tr>
                  <th scope="col" className="w-14 text-center">
                    <span className="sr-only">Solved</span>
                    <Circle className="mx-auto h-3.5 w-3.5 text-fg-4" aria-hidden />
                  </th>
                  <th scope="col">#</th>
                  <th scope="col">Problem</th>
                  <th scope="col" className="w-48">
                    Pattern
                  </th>
                  <th scope="col" className="w-32 text-center">
                    Difficulty
                  </th>
                  <th scope="col" className="w-32 text-right">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>

              <tbody className="tbody">
                {problems.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={BookMarked}
                        title="This sheet has no problems yet"
                        sub="A trainer can add problems to it from the question studio."
                      />
                    </td>
                  </tr>
                ) : (
                  problems.map((p: any, idx: number) => (
                    <tr key={p.id}>
                      <td className="td text-center">
                        {p.isSolved ? (
                          <span className="mx-auto block h-2.5 w-2.5 rounded-full bg-easy" aria-label="Solved" />
                        ) : (
                          <span className="mx-auto block h-2.5 w-2.5 rounded-full border border-fg-4" aria-label="Not solved" />
                        )}
                      </td>

                      <td className="td w-14 text-xs tabular-nums text-fg-4">{idx + 1}</td>

                      <td className="td">
                        <Link
                          href={`/problems/${p.slug}`}
                          className="text-[15px] font-medium text-white transition-colors hover:text-mark"
                        >
                          {p.title}
                        </Link>
                        {p.companyTags?.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {p.companyTags.slice(0, 3).map((tag: string) => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="td">
                        <span className="text-sm text-fg-2">{p.category}</span>
                      </td>

                      <td className="td text-center">
                        <DifficultyBadge
                          difficulty={p.difficulty}
                          className="min-w-[70px] justify-center"
                        />
                      </td>

                      <td className="td text-right">
                        <Link
                          href={`/problems/${p.slug}`}
                          className={`btn btn-sm ${p.isSolved ? 'btn-secondary' : 'btn-primary'}`}
                        >
                          {p.isSolved ? 'Review' : 'Solve'}
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
