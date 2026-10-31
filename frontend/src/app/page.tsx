'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ArrowRight, BookMarked, LogIn, Timer } from 'lucide-react';
import {
  CardGridSkeleton,
  EmptyState,
  LinkButton,
  ProgressBar,
  SectionHeader,
} from '@/components/ui';
import SheetCard from '@/components/SheetCard';
import AssessmentCard from '@/components/AssessmentCard';

const COMPANIES = [
  'TCS NQT',
  'Infosys DPhi',
  'Amazon OA',
  'Microsoft',
  'Google',
  'Wipro Turbo',
  'Cognizant GenC',
  'Goldman Sachs',
];

function ReadinessRing({ percent }: { percent: number }) {
  const safe = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div
      className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full"
      role="img"
      aria-label={`${safe}% placement readiness`}
      style={{
        background: `conic-gradient(#818cf8 0deg, #818cf8 ${safe * 3.6}deg, #1c2c48 ${safe * 3.6}deg 360deg)`,
      }}
    >
      <div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-ink-800 text-center">
        <div>
          <div className="text-[26px] font-semibold leading-none tabular-nums text-white">
            {safe}%
          </div>
          <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.1em] text-fg-3">
            ready
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [sheets, setSheets] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = api.getUser();
    setUser(currentUser);

    async function load() {
      try {
        const [myStats, sheetsData, assessmentsData, problemsData] = await Promise.all([
          currentUser ? api.getMyStats() : Promise.resolve(null),
          api.getSheets(),
          api.getAssessments(),
          api.getProblems(),
        ]);
        setStats(myStats);
        setSheets(sheetsData || []);
        setAssessments(assessmentsData || []);
        setProblems(problemsData || []);
      } catch (error) {
        console.error('Failed to load home page data:', error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const overview = stats?.overview || {};
  const readiness = overview.percent ?? 0;
  const totalProblems = overview.totalOverall || problems.length || 0;

  const breakdown = [
    {
      key: 'Easy',
      solved: overview.solvedEasy || 0,
      total: overview.totalEasy || 0,
      tone: 'easy' as const,
    },
    {
      key: 'Medium',
      solved: overview.solvedMedium || 0,
      total: overview.totalMedium || 0,
      tone: 'medium' as const,
    },
    {
      key: 'Hard',
      solved: overview.solvedHard || 0,
      total: overview.totalHard || 0,
      tone: 'hard' as const,
    },
  ];

  const suggested = problems.find((problem) => problem.status !== 'SOLVED') || problems[0];

  const metrics = [
    { value: totalProblems, label: 'Problems' },
    { value: sheets.length, label: 'Sheets' },
    { value: assessments.length, label: 'Mock tests' },
    { value: 4, label: 'Languages' },
  ];

  return (
    <div className="w-full flex-1">
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 hero-surface" aria-hidden />
        <div className="pointer-events-none absolute inset-0 ruled grid-mask opacity-60" aria-hidden />

        <div className="shell relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-14 lg:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">Campus placements · 2026</p>

            <h1 className="mt-4 text-[2.35rem] font-semibold leading-[1.06] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.35rem]">
              Practise the <span className="text-mark-bright">coding rounds</span> campus drives
              actually run.
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-fg-2 sm:text-base">
              Problem statements modelled on the drives that visit campus, sheets ordered by
              pattern, and mock tests graded against hidden cases — so nothing on test day is new.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <LinkButton href="/problems" variant="primary" size="lg">
                Browse problems
                <ArrowRight className="h-4 w-4" aria-hidden />
              </LinkButton>
              <LinkButton href="/assessments" size="lg">
                <Timer className="h-4 w-4" aria-hidden />
                Take a mock test
              </LinkButton>
            </div>

            <dl className="mt-9 grid max-w-lg grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-5 sm:grid-cols-4">
              {metrics.map((metric) => (
                <div key={metric.label}>
                  <dd className="text-xl font-semibold tabular-nums leading-none text-white">
                    {metric.value}
                  </dd>
                  <dt className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-fg-3">
                    {metric.label}
                  </dt>
                </div>
              ))}
            </dl>

            <div className="mt-8">
              <p className="eyebrow">Drives covered</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {COMPANIES.map((name) => (
                  <span key={name} className="tag">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <aside className="card overflow-hidden">
            <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-white">Your readiness</h2>
                <p className="mt-0.5 truncate text-xs text-fg-3">
                  {user
                    ? `${user.name}${user.college ? ` · ${user.college}` : ''}`
                    : 'Sign in to track your progress'}
                </p>
              </div>
            </div>

            <div className="p-5">
              {user ? (
                <>
                  <div className="flex items-center gap-5">
                    <ReadinessRing percent={readiness} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">
                        {overview.solvedTotal || 0} of {overview.totalOverall || 0} solved
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-fg-3">
                        Accepted submissions and mock attempts both feed this score.
                      </p>
                      <Link
                        href="/profile"
                        className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-mark-bright transition-colors hover:text-white"
                      >
                        View full profile
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 border-t border-line-soft pt-4">
                    {breakdown.map((row) => (
                      <div key={row.key}>
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span
                            className={
                              row.tone === 'easy'
                                ? 'font-medium text-easy'
                                : row.tone === 'medium'
                                  ? 'font-medium text-medium'
                                  : 'font-medium text-hard'
                            }
                          >
                            {row.key}
                          </span>
                          <span className="tabular-nums text-fg-3">
                            {row.solved} / {row.total}
                          </span>
                        </div>
                        <ProgressBar
                          value={row.total ? (row.solved / row.total) * 100 : 0}
                          tone={row.tone}
                          label={`${row.key} problems solved`}
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div>
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-ink-750">
                      <LogIn className="h-4 w-4 text-fg-2" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">
                        Your record starts with your first problem
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-fg-3">
                        Sign in to track solved problems by difficulty, keep notes, and see where
                        your mock-test marks place you.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-line-soft pt-4">
                    <LinkButton href="/login" variant="primary" size="sm">
                      Sign in
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </LinkButton>
                    <LinkButton href="/problems" size="sm">
                      Browse problems
                    </LinkButton>
                  </div>
                </div>
              )}
            </div>

            <Link
              href={suggested ? `/problems/${suggested.slug}` : '/problems'}
              className="group flex items-center justify-between gap-3 border-t border-line bg-ink-850 px-5 py-3.5 transition-colors hover:bg-ink-750"
            >
              <span className="min-w-0">
                <span className="block text-[11px] font-medium uppercase tracking-[0.08em] text-fg-4">
                  Suggested start
                </span>
                <span className="mt-0.5 block truncate text-[13px] font-medium text-fg-2">
                  {suggested ? suggested.title : 'Browse the problem set'}
                </span>
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-fg-4 transition-colors group-hover:text-white"
                aria-hidden
              />
            </Link>
          </aside>
        </div>
      </section>

      <div className="shell page">
        <section>
          <SectionHeader
            title="SDE sheets"
            sub="Ordered paths through the patterns that recur in campus technical rounds."
            action={
              <Link
                href="/sheets"
                className="inline-flex items-center gap-1 text-[13px] font-medium text-fg-3 transition-colors hover:text-white"
              >
                All sheets
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            }
          />

          {loading ? (
            <CardGridSkeleton count={4} />
          ) : sheets.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={BookMarked}
                title="No sheets published yet"
                sub="Sheets appear here once a trainer adds them to the studio."
                action={<LinkButton href="/sheets" size="sm">Browse sheets</LinkButton>}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {sheets.map((sheet) => (
                <SheetCard key={sheet.id} sheet={sheet} />
              ))}
            </div>
          )}
        </section>

        <section>
          <SectionHeader
            title="Mock tests"
            sub="A countdown, hidden cases, and an automatic score at the end."
            action={
              <Link
                href="/assessments"
                className="inline-flex items-center gap-1 text-[13px] font-medium text-fg-3 transition-colors hover:text-white"
              >
                All mock tests
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            }
          />

          {loading ? (
            <CardGridSkeleton count={3} className="md:grid-cols-3 lg:grid-cols-3" />
          ) : assessments.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={Timer}
                title="No mock tests scheduled"
                sub="Mock tests you can sit will be listed here."
                action={<LinkButton href="/assessments" size="sm">See mock tests</LinkButton>}
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {assessments.slice(0, 3).map((assessment) => (
                <AssessmentCard key={assessment.id} assessment={assessment} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
