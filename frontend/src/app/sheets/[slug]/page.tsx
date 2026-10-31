'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowLeft, ArrowRight, BookMarked, SearchX } from 'lucide-react';
import {
  DifficultyBadge,
  EmptyState,
  LinkButton,
  ProgressBar,
  Skeleton,
  TableSkeleton,
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
      .catch((error) => {
        console.error(error);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full flex-1">
        <div className="shell page">
          <Skeleton className="h-4 w-24" />
          <div className="card card-pad">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-8 w-3/5" />
            <Skeleton className="mt-3 h-4 w-full max-w-lg" />
            <Skeleton className="mt-2 h-4 w-2/3 max-w-md" />
          </div>
          <TableSkeleton rows={6} />
        </div>
      </div>
    );
  }

  if (failed || !sheet) {
    return (
      <div className="w-full flex-1">
        <div className="shell page">
          <div className="card">
            <EmptyState
              icon={SearchX}
              title="Sheet not found"
              sub="This sheet may have been unpublished, or the link is out of date."
              action={<LinkButton href="/sheets" size="sm">Back to sheets</LinkButton>}
            />
          </div>
        </div>
      </div>
    );
  }

  const problems: any[] = sheet.problems || [];
  const solvedCount = problems.filter((problem) => problem.isSolved).length;
  const percent = Math.max(0, Math.min(100, Math.round(sheet.progressPercent ?? 0)));

  return (
    <div className="w-full flex-1">
      <div className="shell page">
        <Link
          href="/sheets"
          className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-fg-3 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          All sheets
        </Link>

        <header className="grid gap-6 border-b border-line pb-7 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <div className="min-w-0">
            <p className="eyebrow">{sheet.category}</p>
            <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-white sm:text-3xl">
              {sheet.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg-3">
              {sheet.description}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-fg-3">
              <span className="tabular-nums">{problems.length} problems</span>
              <span aria-hidden>·</span>
              <span className="tabular-nums text-easy">{solvedCount} solved</span>
            </p>
          </div>

          <div className="well p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="stat-label">Your progress</span>
              <span className="text-sm font-semibold tabular-nums text-white">
                {sheet.solvedProblems} / {sheet.totalProblems}
              </span>
            </div>
            <ProgressBar
              value={percent}
              tone="mark"
              label={`${sheet.title} progress`}
              className="mt-2.5 h-2"
            />
            <p className="mt-2 text-xs tabular-nums text-fg-4">{percent}% complete</p>
          </div>
        </header>

        {problems.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={BookMarked}
              title="This sheet has no problems yet"
              sub="A trainer can add problems to it from the question studio."
            />
          </div>
        ) : (
          <>
            <section className="card hidden overflow-hidden md:block" aria-label="Sheet problems">
              <div className="overflow-x-auto" role="region" aria-label="Sheet problems" tabIndex={0}>
                <table className="table">
                  <thead className="thead">
                    <tr>
                      <th scope="col" className="w-14 text-center">
                        <span className="sr-only">Status</span>
                      </th>
                      <th scope="col" className="w-12">
                        #
                      </th>
                      <th scope="col">Problem</th>
                      <th scope="col" className="hidden w-44 lg:table-cell">
                        Pattern
                      </th>
                      <th scope="col" className="w-28 text-center">
                        Difficulty
                      </th>
                      <th scope="col" className="w-24 text-right">
                        <span className="sr-only">Action</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="tbody">
                    {problems.map((problem: any, index: number) => (
                      <tr key={problem.id}>
                        <td className="td text-center">
                          {problem.isSolved ? (
                            <>
                              <span
                                className="mx-auto block h-2.5 w-2.5 rounded-full bg-easy"
                                aria-hidden
                              />
                              <span className="sr-only">Solved</span>
                            </>
                          ) : (
                            <>
                              <span
                                className="mx-auto block h-2.5 w-2.5 rounded-full border border-fg-4"
                                aria-hidden
                              />
                              <span className="sr-only">Not solved</span>
                            </>
                          )}
                        </td>

                        <td className="td text-xs tabular-nums text-fg-4">{index + 1}</td>

                        <td className="td">
                          <Link
                            href={`/problems/${problem.slug}`}
                            className="text-[15px] font-medium text-white transition-colors hover:text-mark-bright"
                          >
                            {problem.title}
                          </Link>
                          {problem.companyTags?.length > 0 ? (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {problem.companyTags.slice(0, 3).map((tag: string) => (
                                <Tag key={tag}>{tag}</Tag>
                              ))}
                            </div>
                          ) : null}
                        </td>

                        <td className="td hidden lg:table-cell">
                          <span className="text-sm text-fg-2">{problem.category}</span>
                        </td>

                        <td className="td text-center">
                          <DifficultyBadge
                            difficulty={problem.difficulty}
                            className="min-w-[64px] justify-center"
                          />
                        </td>

                        <td className="td text-right">
                          <Link
                            href={`/problems/${problem.slug}`}
                            aria-label={`Open ${problem.title}`}
                            className="inline-flex items-center gap-1 text-[13px] font-medium text-fg-3 transition-colors hover:text-white"
                          >
                            Open
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="card overflow-hidden md:hidden" aria-label="Sheet problems">
              <ul className="divide-y divide-line-soft">
                {problems.map((problem: any, index: number) => (
                  <li key={problem.id}>
                    <Link
                      href={`/problems/${problem.slug}`}
                      className="group flex items-start gap-3 p-4 transition-colors hover:bg-ink-750"
                    >
                      <span className="mt-0.5 w-5 shrink-0 text-xs tabular-nums text-fg-4">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h2 className="text-[15px] font-medium leading-snug text-white">
                            {problem.title}
                          </h2>
                          {problem.isSolved ? (
                            <span className="badge badge-easy shrink-0">Solved</span>
                          ) : null}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <DifficultyBadge difficulty={problem.difficulty} />
                          <span className="text-xs text-fg-3">{problem.category}</span>
                        </div>
                      </div>
                      <ArrowRight
                        className="mt-1 h-4 w-4 shrink-0 text-fg-4 transition-colors group-hover:text-white"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
