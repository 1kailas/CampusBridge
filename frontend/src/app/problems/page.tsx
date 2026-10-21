'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { ArrowRight, Circle, ListFilter, CheckCircle2, SearchX } from 'lucide-react';
import {
  DifficultyBadge,
  EmptyState,
  LoadingState,
  PageHeader,
  SearchInput,
  Tag,
} from '@/components/ui';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Any status' },
  { value: 'SOLVED', label: 'Solved' },
  { value: 'ATTEMPTED', label: 'Attempted' },
  { value: 'TODO', label: 'Not started' },
];

export default function ProblemsPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    api
      .getProblemMetadata()
      .then(setMetadata)
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchProblems() {
      try {
        setLoading(true);
        setFailed(false);
        const params: Record<string, string> = {};
        if (selectedDifficulty !== 'ALL') params.difficulty = selectedDifficulty;
        if (selectedCategory !== 'ALL') params.category = selectedCategory;
        if (selectedCompany !== 'ALL') params.company = selectedCompany;
        if (selectedStatus !== 'ALL') params.status = selectedStatus;
        if (search.trim()) params.search = search.trim();

        const data = await api.getProblems(params);
        if (!cancelled) setProblems(data || []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const delay = search ? 200 : 0;
    const timer = setTimeout(fetchProblems, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, selectedDifficulty, selectedCategory, selectedCompany, selectedStatus]);

  const filtersActive =
    search.trim() !== '' ||
    selectedDifficulty !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    selectedCompany !== 'ALL' ||
    selectedStatus !== 'ALL';

  const resetFilters = () => {
    setSearch('');
    setSelectedDifficulty('ALL');
    setSelectedCategory('ALL');
    setSelectedCompany('ALL');
    setSelectedStatus('ALL');
  };

  const counts = metadata?.difficultyCounts || {};

  return (
    <div className="w-full flex-1">
      <div className="shell page">
        <PageHeader
          title="Problem set"
          sub="Coding questions filtered by the recruitment drives that visit campus — TCS NQT, Infosys, Amazon, Microsoft and Wipro."
          actions={
            <div className="flex flex-wrap items-center gap-3 rounded-md border border-line bg-ink-800 px-4 py-2.5 text-[13px]">
              <span className="flex items-baseline gap-1.5">
                <span className="text-base font-semibold tabular-nums leading-none text-white">
                  {problems.length}
                </span>
                <span className="text-fg-3">problems</span>
              </span>
              <span className="h-4 w-px bg-line" aria-hidden />
              <span className="font-medium tabular-nums text-easy">{counts.EASY || 0} easy</span>
              <span className="font-medium tabular-nums text-medium">{counts.MEDIUM || 0} medium</span>
              <span className="font-medium tabular-nums text-hard">{counts.HARD || 0} hard</span>
            </div>
          }
        />

        {/* ---------------------------------------------------------- filters */}
        <section className="card space-y-3.5 p-4 sm:p-5" aria-label="Filters">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
            <div className="sm:col-span-2 lg:col-span-5">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search by title, company or pattern"
                aria-label="Search problems"
              />
            </div>

            <div className="lg:col-span-2">
              <select
                aria-label="Filter by difficulty"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="select"
              >
                <option value="ALL">Any difficulty</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div className="lg:col-span-3">
              <select
                aria-label="Filter by pattern"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select"
              >
                <option value="ALL">Any pattern</option>
                {metadata?.categories?.map((cat: any) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                aria-label="Filter by status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="select"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-line-soft pt-3.5">
            <span className="flex h-7 shrink-0 items-center gap-1.5 text-[13px] text-fg-3">
              <ListFilter className="h-3.5 w-3.5" aria-hidden />
              Drives
            </span>

            <div className="-mx-1 flex flex-1 gap-1.5 overflow-x-auto px-1 pb-1">
              <button
                onClick={() => setSelectedCompany('ALL')}
                aria-pressed={selectedCompany === 'ALL'}
                className={cn('chip shrink-0', selectedCompany === 'ALL' && 'chip-on')}
              >
                All
              </button>
              {metadata?.companies?.map((c: any) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedCompany(c.name)}
                  aria-pressed={selectedCompany === c.name}
                  className={cn('chip shrink-0', selectedCompany === c.name && 'chip-on')}
                >
                  {c.name}
                  <span className={cn('tabular-nums', selectedCompany === c.name ? 'opacity-60' : 'text-fg-4')}>
                    {c.count}
                  </span>
                </button>
              ))}
            </div>

            {filtersActive && (
              <button onClick={resetFilters} className="btn btn-ghost btn-sm shrink-0">
                Reset
              </button>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------------ table */}
        <section className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table min-w-[760px]">
              <thead className="thead">
                <tr>
                  <th scope="col" className="w-14 text-center">
                    <span className="sr-only">Solved</span>
                    <CheckCircle2 className="mx-auto h-3.5 w-3.5 text-fg-4" aria-hidden />
                  </th>
                  <th scope="col">Problem</th>
                  <th scope="col" className="w-48">
                    Pattern
                  </th>
                  <th scope="col" className="w-32 text-center">
                    Difficulty
                  </th>
                  <th scope="col" className="w-28 text-right">
                    Acceptance
                  </th>
                  <th scope="col" className="w-32 text-right">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>

              <tbody className="tbody">
                {loading ? (
                  <tr>
                    <td colSpan={6}>
                      <LoadingState label="Loading problems…" />
                    </td>
                  </tr>
                ) : failed ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={SearchX}
                        title="Could not reach the problem bank"
                        sub="The API at http://localhost:4000 is not responding. Start the backend, then reload this page."
                      />
                    </td>
                  </tr>
                ) : problems.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={ListFilter}
                        title="No problems match these filters"
                        sub="Loosen a filter or clear them all to see the full bank."
                        action={
                          filtersActive ? (
                            <button onClick={resetFilters} className="btn btn-secondary btn-sm">
                              Clear filters
                            </button>
                          ) : undefined
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  problems.map((p) => {
                    const isSolved = p.status === 'SOLVED';

                    return (
                      <tr key={p.id}>
                        <td className="td text-center">
                          {isSolved ? (
                            <CheckCircle2 className="mx-auto h-4 w-4 text-easy" aria-label="Solved" />
                          ) : (
                            <Circle className="mx-auto h-4 w-4 text-fg-4" aria-label="Not solved" />
                          )}
                        </td>

                        <td className="td">
                          <Link
                            href={`/problems/${p.slug}`}
                            className="text-[15px] font-medium text-white transition-colors hover:text-mark"
                          >
                            {p.title}
                          </Link>
                          {p.companyTags?.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {p.companyTags.slice(0, 4).map((tag: string) => (
                                <Tag key={tag}>{tag}</Tag>
                              ))}
                              {p.companyTags.length > 4 && (
                                <span className="self-center px-0.5 text-2xs text-fg-4">
                                  +{p.companyTags.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="td">
                          <span className="text-sm text-fg-2">{p.category}</span>
                        </td>

                        <td className="td text-center">
                          <DifficultyBadge difficulty={p.difficulty} className="min-w-[70px] justify-center" />
                        </td>

                        <td className="td num text-right text-sm text-fg-2">{p.acceptanceRate}%</td>

                        <td className="td text-right">
                          <Link
                            href={`/problems/${p.slug}`}
                            className={cn(
                              'btn btn-sm',
                              isSolved ? 'btn-secondary' : 'btn-primary'
                            )}
                          >
                            {isSolved ? 'Review' : 'Solve'}
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
