'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { GraduationCap, ListOrdered, Trophy, Users, SearchX } from 'lucide-react';
import { EmptyState, LoadingState, PageHeader, SearchInput } from '@/components/ui';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api
      .getLeaderboard()
      .then((data) => setLeaderboard(data || []))
      .catch((e) => {
        console.error(e);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? leaderboard.filter(
        (item) =>
          (item.name || '').toLowerCase().includes(q) ||
          (item.college || '').toLowerCase().includes(q) ||
          (item.targetCompany || '').toLowerCase().includes(q)
      )
    : leaderboard;

  const podium = leaderboard.slice(0, 3);

  return (
    <div className="w-full flex-1">
      <div className="shell page">
        <PageHeader
          title="Leaderboard"
          sub="Ranked on problems solved and mock-test marks together — the two things a recruiting panel actually sees."
          actions={
            <div className="w-full md:w-80">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search name, college or target"
                aria-label="Search the leaderboard"
              />
            </div>
          }
        />

        {loading ? (
          <LoadingState label="Loading leaderboard…" />
        ) : failed ? (
          <EmptyState
            icon={Users}
            title="Could not load the leaderboard"
            sub="The API at http://localhost:4000 is not responding. Start the backend, then reload this page."
          />
        ) : leaderboard.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No candidates ranked yet"
            sub="Rankings appear once students have solved problems or sat a mock test."
          />
        ) : (
          <>
            {/* -------------------------------------------------------- podium */}
            <section aria-label="Top three" className="grid gap-4 md:grid-cols-3">
              {podium.map((person, idx) => {
                const rank = idx + 1;
                const first = rank === 1;
                return (
                  <div
                    key={person.id}
                    className={cn(
                      'card flex flex-col p-5 text-center',
                      first && 'order-first border-mark/40 md:order-2 md:-mt-2',
                      !first && rank === 2 && 'md:order-1',
                      !first && rank === 3 && 'md:order-3'
                    )}
                  >
                    <span className="mx-auto grid h-11 w-11 place-items-center rounded-md border border-line bg-ink-750 text-xl leading-none">
                      {MEDALS[idx]}
                    </span>

                    <span
                      className={cn('badge mt-3 self-center', first ? 'badge-mark' : 'badge-neutral')}
                    >
                      Rank {rank}
                    </span>

                    <h2 className="mt-2.5 text-base font-semibold text-white">{person.name}</h2>
                    <p className="mt-0.5 flex items-center justify-center gap-1.5 text-[13px] text-fg-3">
                      <GraduationCap className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{person.college}</span>
                    </p>

                    <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line text-left">
                      <div className="bg-ink-750 px-3 py-2.5">
                        <dt className="stat-label">Solved</dt>
                        <dd className="mt-0.5 text-[15px] font-semibold tabular-nums text-white">
                          {person.problemsSolved}
                        </dd>
                      </div>
                      <div className="bg-ink-750 px-3 py-2.5">
                        <dt className="stat-label">Score</dt>
                        <dd className="mt-0.5 text-[15px] font-semibold tabular-nums text-mark">
                          {person.score}
                        </dd>
                      </div>
                    </dl>
                  </div>
                );
              })}
            </section>

            {/* --------------------------------------------------------- table */}
            <section className="card overflow-hidden">
              <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ListOrdered className="h-4 w-4 text-fg-3" aria-hidden />
                  Full ranking
                </h2>
                <span className="text-[13px] tabular-nums text-fg-3">
                  {filtered.length} of {leaderboard.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="table min-w-[720px]">
                  <thead className="thead">
                    <tr>
                      <th scope="col" className="w-20 text-center">
                        Rank
                      </th>
                      <th scope="col">Candidate</th>
                      <th scope="col">College</th>
                      <th scope="col" className="w-32 text-right">
                        Solved
                      </th>
                      <th scope="col" className="w-32 text-right">
                        Mock marks
                      </th>
                      <th scope="col" className="w-32 text-right">
                        Composite
                      </th>
                    </tr>
                  </thead>

                  <tbody className="tbody">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <EmptyState
                            icon={SearchX}
                            title="No candidate matches that search"
                            sub="Check the spelling, or clear the search to see the full ranking."
                          />
                        </td>
                      </tr>
                    ) : (
                      filtered.map((item) => {
                        const rank = leaderboard.indexOf(item) + 1;
                        return (
                          <tr key={item.id}>
                            <td className="td text-center">
                              <span
                                className={cn(
                                  'inline-flex h-7 min-w-[28px] items-center justify-center rounded-sm border px-2 text-[13px] font-semibold tabular-nums',
                                  rank <= 3
                                    ? 'border-mark/35 bg-mark/10 text-mark'
                                    : 'border-line bg-ink-750 text-fg-3'
                                )}
                              >
                                {rank}
                              </span>
                            </td>

                            <td className="td text-[15px] font-medium text-white">{item.name}</td>

                            <td className="td">
                              <span className="flex items-center gap-1.5 text-sm text-fg-2">
                                <GraduationCap className="h-3.5 w-3.5 shrink-0 text-fg-4" aria-hidden />
                                <span className="truncate">{item.college}</span>
                              </span>
                            </td>

                            <td className="td num text-right text-[15px] font-semibold text-easy">
                              {item.problemsSolved}
                            </td>
                            <td className="td num text-right text-sm text-fg-2">
                              {item.assessmentScore}
                            </td>
                            <td className="td num text-right text-[15px] font-semibold text-white">
                              {item.score}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
