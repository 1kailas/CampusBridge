'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  ArrowRight,
  BookMarked,
  Clock,
  FileCode2,
  ListChecks,
  ShieldCheck,
  Timer,
  TrendingUp,
} from 'lucide-react';
import {
  EmptyState,
  LinkButton,
  LoadingState,
  ProgressBar,
  SectionHeader,
} from '@/components/ui';

const COMPANIES = [
  'Amazon SDE-1',
  'Google SWE',
  'Microsoft OA',
  'TCS Digital & Prime',
  'Infosys DPhi & SP',
  'Cognizant GenC Next',
  'Goldman Sachs',
];

const PATTERNS = [
  {
    title: 'Two pointers and sliding window',
    body: 'Turns the O(n²) scan behind most array and string checks into a single linear pass.',
  },
  {
    title: 'Kadane and dynamic programming',
    body: 'The most repeated shape in TCS NQT and Infosys DPhi — one-dimensional state carried forward.',
  },
  {
    title: 'Breadth-first and depth-first traversal',
    body: 'Grid and matrix walks such as Number of Islands, a fixture of Amazon OA and HackWithInfy.',
  },
  {
    title: 'Monotonic stacks and heaps',
    body: 'Next-greater elements, bracket matching and top-k frequency — the usual interview closeers.',
  },
];

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [sheets, setSheets] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(api.getUser());

    async function load() {
      try {
        const [myStats, sheetsData, assessmentsData] = await Promise.all([
          api.getMyStats(),
          api.getSheets(),
          api.getAssessments(),
        ]);
        setStats(myStats);
        setSheets(sheetsData || []);
        setAssessments(assessmentsData || []);
      } catch (e) {
        console.error('Failed to load home page data:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const overview = stats?.overview || {};
  const breakdown = [
    { key: 'Easy', solved: overview.solvedEasy, total: overview.totalEasy, tone: 'easy' as const },
    { key: 'Medium', solved: overview.solvedMedium, total: overview.totalMedium, tone: 'medium' as const },
    { key: 'Hard', solved: overview.solvedHard, total: overview.totalHard, tone: 'hard' as const },
  ];

  return (
    <div className="w-full flex-1">
      {/* ---------------------------------------------------------------- hero */}
      <section className="ruled border-b border-line bg-ink-850">
        <div className="shell grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_370px] lg:items-start lg:gap-14">
          <div className="max-w-2xl">
            <h1 className="text-[2.375rem] font-semibold leading-[1.06] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.4rem]">
              Rehearse your placement coding rounds.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-fg-2 sm:text-[17px]">
              Problem statements taken from the drives that actually visit campus, sheets ordered by
              pattern, and mock tests graded against hidden cases — so nothing on test day is new.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <LinkButton href="/problems" variant="primary" size="lg">
                Open the problem set
                <ArrowRight className="h-4 w-4" aria-hidden />
              </LinkButton>
              <LinkButton href="/assessments" size="lg">
                <Timer className="h-4 w-4" aria-hidden />
                Take a mock test
              </LinkButton>
            </div>

            <div className="mt-9">
              <p className="text-sm text-fg-3">Campus drives covered</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {COMPANIES.map((name) => (
                  <span key={name} className="tag rounded-sm px-2 py-1 text-xs">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Today's pick */}
          <article className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <span className="flex items-center gap-2 text-[13px] font-medium text-mark">
                <ListChecks className="h-4 w-4" aria-hidden />
                Today&apos;s pick
              </span>
              <span className="badge badge-easy">Easy · 52% solved</span>
            </div>

            <div className="p-5">
              <h2 className="text-xl font-semibold tracking-[-0.02em]">Two Sum</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-3">
                Return the indices of two numbers that add up to the target, using one pass and a
                hash map rather than the nested scan.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line">
                <div className="bg-ink-750 px-3 py-2.5">
                  <div className="stat-label">Asked in</div>
                  <div className="mt-0.5 truncate text-[13px] font-medium text-fg">
                    TCS, Amazon, Google
                  </div>
                </div>
                <div className="bg-ink-750 px-3 py-2.5">
                  <div className="stat-label">Pattern</div>
                  <div className="mt-0.5 truncate text-[13px] font-medium text-fg">
                    Hash map
                  </div>
                </div>
              </div>

              <LinkButton href="/problems/two-sum" variant="primary" block className="mt-5">
                Solve this problem
                <ArrowRight className="h-4 w-4" aria-hidden />
              </LinkButton>
            </div>
          </article>
        </div>
      </section>

      {/* ------------------------------------------------------------- content */}
      <div className="shell page">
        {/* Readiness scorecard */}
        {stats && (
          <section className="card overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                  <TrendingUp className="h-4 w-4 text-fg-3" aria-hidden />
                  Placement readiness
                </h2>
                <p className="mt-0.5 text-[13px] leading-relaxed text-fg-3">
                  {user?.name}
                  {user?.college ? ` at ${user.college}` : ''}
                  {user?.targetCompany ? `, aiming at ${user.targetCompany}` : ''}
                </p>
              </div>
              <Link
                href="/profile"
                className="shrink-0 text-[13px] font-medium text-fg-2 transition-colors hover:text-white"
              >
                Open full profile
                <ArrowRight className="ml-1 inline h-3.5 w-3.5 -translate-y-px" aria-hidden />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
              <div className="bg-ink-800 p-4 sm:p-5">
                <div className="stat-label">Solved</div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="stat-value">{overview.solvedTotal || 0}</span>
                  <span className="stat-note">of {overview.totalOverall || 0}</span>
                </div>
                <ProgressBar value={overview.percent || 0} className="mt-3" />
              </div>

              {breakdown.map((d) => (
                <div key={d.key} className="bg-ink-800 p-4 sm:p-5">
                  <div className="stat-label">{d.key}</div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span
                      className={`stat-value ${
                        d.tone === 'easy' ? 'text-easy' : d.tone === 'medium' ? 'text-medium' : 'text-hard'
                      }`}
                    >
                      {d.solved || 0}
                    </span>
                    <span className="stat-note">
                      of {d.total || 0}
                    </span>
                  </div>
                  <ProgressBar
                    value={d.total ? ((d.solved || 0) / d.total) * 100 : 0}
                    tone={d.tone}
                    className="mt-3"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SDE sheets */}
        <section className="space-y-4">
          <SectionHeader
            title="SDE sheets"
            sub="Ordered paths through the patterns that recur in campus technical rounds."
            action={
              <LinkButton href="/sheets" size="sm">
                All sheets
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </LinkButton>
            }
          />

          {loading ? (
            <LoadingState label="Loading sheets…" />
          ) : sheets.length === 0 ? (
            <EmptyState
              icon={BookMarked}
              title="No sheets published yet"
              sub="Sheets appear here once a trainer adds them to the studio."
              action={
                <LinkButton href="/sheets" size="sm">
                  Browse sheets
                </LinkButton>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {sheets.map((sheet) => (
                <Link
                  key={sheet.id}
                  href={`/sheets/${sheet.slug}`}
                  className="card card-pad card-hover group flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="badge badge-neutral">{sheet.category}</span>
                    <span className="shrink-0 text-[13px] tabular-nums text-fg-3">
                      {sheet.totalProblems} problems
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-semibold leading-snug text-white">
                    {sheet.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-fg-3">
                    {sheet.description}
                  </p>

                  <div className="mt-5 border-t border-line-soft pt-4">
                    <div className="mb-2 flex items-center justify-between text-[13px]">
                      <span className="text-fg-3">Progress</span>
                      <span className="font-medium tabular-nums text-fg">
                        {sheet.solvedProblems} / {sheet.totalProblems}
                      </span>
                    </div>
                    <ProgressBar value={sheet.progressPercent} tone="mark" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Mock tests */}
        <section className="space-y-4">
          <SectionHeader
            title="Mock tests"
            sub="Timed sittings with a countdown, hidden cases and an automatic score at the end."
            action={
              <LinkButton href="/assessments" size="sm">
                All mock tests
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </LinkButton>
            }
          />

          {loading ? (
            <LoadingState label="Loading mock tests…" />
          ) : assessments.length === 0 ? (
            <EmptyState
              icon={Timer}
              title="No mock tests scheduled"
              sub="Mock tests you can sit will be listed here."
              action={
                <LinkButton href="/assessments" size="sm">
                  See mock tests
                </LinkButton>
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {assessments.map((a) => (
                <article key={a.id} className="card card-pad card-hover flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className="badge badge-neutral">{a.company}</span>
                    <span className="flex shrink-0 items-center gap-1.5 text-[13px] tabular-nums text-fg-3">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {a.durationMinutes} min
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-semibold leading-snug text-white">{a.title}</h3>
                  <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-fg-3">
                    {a.description}
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line">
                    <div className="bg-ink-750 px-3 py-2.5">
                      <dt className="stat-label">Problems</dt>
                      <dd className="mt-0.5 text-[13px] font-medium tabular-nums text-fg">
                        {a.problemCount}
                      </dd>
                    </div>
                    <div className="bg-ink-750 px-3 py-2.5">
                      <dt className="stat-label">Marks</dt>
                      <dd className="mt-0.5 text-[13px] font-medium tabular-nums text-fg">
                        {a.totalMarks}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-auto pt-5">
                    <LinkButton href={`/assessments/${a.id}`} variant="primary" block>
                      <ShieldCheck className="h-4 w-4" aria-hidden />
                      Start mock test
                    </LinkButton>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Patterns */}
        <section className="card overflow-hidden">
          <div className="border-b border-line px-5 py-4 sm:px-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <FileCode2 className="h-4 w-4 text-fg-3" aria-hidden />
              The four patterns campus drives repeat
            </h2>
            <p className="mt-0.5 text-[13px] text-fg-3">
              Taken from the question banks of TCS, Infosys, Capgemini, Amazon and Cognizant.
            </p>
          </div>

          <ul className="divide-y divide-line-soft">
            {PATTERNS.map((p) => (
              <li key={p.title} className="grid gap-1 px-5 py-4 sm:grid-cols-[minmax(0,260px)_1fr] sm:gap-6 sm:px-6">
                <span className="text-sm font-medium text-white">{p.title}</span>
                <span className="text-sm leading-relaxed text-fg-3">{p.body}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
