'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import {
  GraduationCap,
  ListOrdered,
  SearchX,
  Trophy,
  TriangleAlert,
  Users,
} from 'lucide-react';
import {
  EmptyState,
  PageHeader,
  SearchInput,
  Stat,
  TableSkeleton,
} from '@/components/ui';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api
      .getLeaderboard()
      .then((data) => setLeaderboard(data || []))
      .catch((error) => {
        console.error(error);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = q
      ? leaderboard.filter(
          (item) =>
            (item.name || '').toLowerCase().includes(q) ||
            (item.college || '').toLowerCase().includes(q) ||
            (item.targetCompany || '').toLowerCase().includes(q)
        )
      : leaderboard;

    return rows.map((item) => ({
      ...item,
      rank: leaderboard.findIndex((entry) => entry.id === item.id) + 1,
    }));
  }, [leaderboard, query]);

  const totalSolved = leaderboard.reduce(
    (sum, item) => sum + Number(item.problemsSolved || 0),
    0
  );
  const topScore = leaderboard[0]?.score ?? 0;

  return (
    <div className="w-full flex-1">
      <div className="shell page">
        <PageHeader
          title="Leaderboard"
          sub="Ranked on problems solved and mock-test marks together — the two signals a recruiting panel actually reviews."
          actions={
            <div className="w-full md:w-80">
              <label className="sr-only" htmlFor="leaderboard-search">
                Search the leaderboard
              </label>
              <SearchInput
                id="leaderboard-search"
                value={query}
                onChange={setQuery}
                placeholder="Search name, college, or target"
              />
            </div>
          }
        />

        {loading ? (
          <TableSkeleton rows={8} />
        ) : failed ? (
          <div className="card">
            <EmptyState
              icon={TriangleAlert}
              title="Could not load the leaderboard"
              sub="The API is unreachable. Check that the backend service is running, then reload this page."
            />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Trophy}
              title="No candidates ranked yet"
              sub="Rankings appear once students have solved problems or completed a mock test."
            />
          </div>
        ) : (
          <>
            <section
              aria-label="Leaderboard summary"
              className="card grid grid-cols-3 divide-x divide-line overflow-hidden sm:hidden"
            >
              <div className="min-w-0 px-3 py-3.5 text-center">
                <div className="text-lg font-semibold leading-none tabular-nums text-white">
                  {leaderboard.length}
                </div>
                <div className="mt-1.5 text-[11px] leading-tight text-fg-3">Candidates</div>
              </div>
              <div className="min-w-0 px-3 py-3.5 text-center">
                <div className="text-lg font-semibold leading-none tabular-nums text-white">
                  {totalSolved}
                </div>
                <div className="mt-1.5 text-[11px] leading-tight text-fg-3">Solved</div>
              </div>
              <div className="min-w-0 px-3 py-3.5 text-center">
                <div className="text-lg font-semibold leading-none tabular-nums text-white">
                  {topScore}
                </div>
                <div className="mt-1.5 text-[11px] leading-tight text-fg-3">Top score</div>
              </div>
            </section>

            <section
              aria-label="Leaderboard summary"
              className="hidden gap-3 sm:grid sm:grid-cols-3"
            >
              <Stat
                label="Candidates ranked"
                value={leaderboard.length}
                note="Students with placement activity"
              />
              <Stat
                label="Problems solved"
                value={totalSolved}
                note="Accepted submissions across the cohort"
              />
              <Stat
                label="Leading score"
                value={topScore}
                note="Problems and mock marks combined"
              />
            </section>

            <section className="card overflow-hidden" aria-labelledby="ranking-heading">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
                <h2
                  id="ranking-heading"
                  className="flex items-center gap-2 text-sm font-semibold text-white"
                >
                  <ListOrdered className="h-4 w-4 text-fg-3" aria-hidden />
                  Full ranking
                </h2>
                <span className="text-[13px] tabular-nums text-fg-3">
                  {filtered.length} of {leaderboard.length}
                </span>
              </div>

              {filtered.length === 0 ? (
                <EmptyState
                  icon={SearchX}
                  title="No candidate matches that search"
                  sub="Check the spelling, or clear the search to see the full ranking."
                  action={
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="btn btn-secondary btn-sm"
                    >
                      Clear search
                    </button>
                  }
                />
              ) : (
                <>
                  {/* Mobile list */}
                  <ul className="divide-y divide-line-soft md:hidden">
                    {filtered.map((person) => (
                      <li key={person.id} className="flex items-start gap-3 p-4">
                        <RankMark rank={person.rank} />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="min-w-0 text-[15px] font-medium leading-snug text-white">
                              {person.name}
                            </h3>
                            <span className="shrink-0 text-[15px] font-semibold tabular-nums text-white">
                              {person.score}
                            </span>
                          </div>

                          <p className="mt-1 flex items-center gap-1.5 text-xs text-fg-3">
                            <GraduationCap className="h-3.5 w-3.5 shrink-0" aria-hidden />
                            <span className="truncate">{person.college}</span>
                          </p>

                          <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-3">
                            <div className="flex items-center gap-1">
                              <dt>Solved</dt>
                              <dd className="font-semibold tabular-nums text-easy">
                                {person.problemsSolved}
                              </dd>
                            </div>
                            <div className="flex items-center gap-1">
                              <dt>Mock marks</dt>
                              <dd className="font-semibold tabular-nums text-fg-2">
                                {person.assessmentScore}
                              </dd>
                            </div>
                            {person.targetCompany ? (
                              <div className="flex min-w-0 items-center gap-1">
                                <dt>Target</dt>
                                <dd className="truncate text-fg-2">{person.targetCompany}</dd>
                              </div>
                            ) : null}
                          </dl>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Desktop table */}
                  <div className="hidden md:block">
                    <table className="table">
                      <thead className="thead">
                        <tr>
                          <th scope="col" className="w-16 text-center">
                            Rank
                          </th>
                          <th scope="col">Candidate</th>
                          <th scope="col" className="hidden w-56 xl:table-cell">
                            College
                          </th>
                          <th scope="col" className="w-24 text-right">
                            Solved
                          </th>
                          <th scope="col" className="hidden w-28 text-right lg:table-cell">
                            Mock marks
                          </th>
                          <th scope="col" className="w-28 text-right">
                            Composite
                          </th>
                        </tr>
                      </thead>

                      <tbody className="tbody">
                        {filtered.map((person) => (
                          <tr key={person.id}>
                            <td className="td text-center">
                              <RankMark rank={person.rank} />
                            </td>

                            <td className="td">
                              <span className="text-[15px] font-medium text-white">
                                {person.name}
                              </span>
                              {person.targetCompany ? (
                                <span className="mt-0.5 block truncate text-xs text-fg-3">
                                  Aiming at {person.targetCompany}
                                </span>
                              ) : null}
                            </td>

                            <td className="td hidden xl:table-cell">
                              <span className="flex items-center gap-1.5 text-sm text-fg-2">
                                <GraduationCap
                                  className="h-3.5 w-3.5 shrink-0 text-fg-4"
                                  aria-hidden
                                />
                                <span className="truncate">{person.college}</span>
                              </span>
                            </td>

                            <td className="td num text-right text-[15px] font-semibold text-easy">
                              {person.problemsSolved}
                            </td>

                            <td className="td num hidden text-right text-sm text-fg-2 lg:table-cell">
                              {person.assessmentScore}
                            </td>

                            <td className="td num text-right text-[15px] font-semibold text-white">
                              {person.score}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>

            <p className="flex items-center gap-1.5 text-xs text-fg-3">
              <Users className="h-3.5 w-3.5" aria-hidden />
              Trainer and placement-cell accounts are excluded from the ranking.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function RankMark({ rank }: { rank: number }) {
  const top = rank <= 3;

  return (
    <span
      className={cn(
        'inline-flex h-7 min-w-[28px] items-center justify-center rounded border px-2 text-[13px] font-semibold tabular-nums',
        top
          ? 'border-mark/35 bg-mark/10 text-mark-bright'
          : 'border-line bg-ink-750 text-fg-3'
      )}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </span>
  );
}
