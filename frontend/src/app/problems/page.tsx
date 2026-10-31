'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { ArrowRight, CheckCircle2, Circle, ListFilter, SearchX } from 'lucide-react';
import {
  DifficultyBadge,
  EmptyState,
  PageHeader,
  SearchInput,
  TableSkeleton,
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
      .catch((error) => console.error(error));
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
      } catch (error) {
        console.error(error);
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
  const totalProblems = Object.values(counts).reduce<number>(
    (total, value) => total + Number(value || 0),
    0
  );

  return (
    <div className="w-full flex-1">
      <div className="shell page">
        <PageHeader
          title="Problem set"
          sub="Coding questions filtered by the recruitment drives that visit campus — TCS NQT, Infosys, Amazon, Microsoft, and Wipro."
          actions={
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px]">
              <span className="text-fg-3">
                <span className="font-semibold tabular-nums text-white">
                  {totalProblems || problems.length}
                </span>{' '}
                problems
              </span>
              <span className="h-4 w-px bg-line" aria-hidden />
              <span className="tabular-nums text-easy">{counts.EASY || 0} easy</span>
              <span className="tabular-nums text-medium">{counts.MEDIUM || 0} medium</span>
              <span className="tabular-nums text-hard">{counts.HARD || 0} hard</span>
            </div>
          }
        />

        <section className="card space-y-4 p-4 sm:p-5" aria-label="Filters">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
            <div className="sm:col-span-2 lg:col-span-5">
              <label className="label" htmlFor="problem-search">
                Search
              </label>
              <SearchInput
                id="problem-search"
                value={search}
                onChange={setSearch}
                placeholder="Title, company, or pattern"
                aria-label="Search problems"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="label" htmlFor="filter-difficulty">
                Difficulty
              </label>
              <select
                id="filter-difficulty"
                value={selectedDifficulty}
                onChange={(event) => setSelectedDifficulty(event.target.value)}
                className="select"
              >
                <option value="ALL">Any difficulty</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div className="lg:col-span-3">
              <label className="label" htmlFor="filter-pattern">
                Pattern
              </label>
              <select
                id="filter-pattern"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="select"
              >
                <option value="ALL">Any pattern</option>
                {metadata?.categories?.map((category: any) => (
                  <option key={category.name} value={category.name}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="label" htmlFor="filter-status">
                Status
              </label>
              <select
                id="filter-status"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                className="select"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-line-soft pt-3.5 sm:flex-row sm:items-start">
            <span className="flex h-8 shrink-0 items-center gap-1.5 text-[13px] text-fg-3">
              <ListFilter className="h-3.5 w-3.5" aria-hidden />
              Drives
            </span>

            <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCompany('ALL')}
                aria-pressed={selectedCompany === 'ALL'}
                className={cn('chip', selectedCompany === 'ALL' && 'chip-on')}
              >
                All
              </button>
              {metadata?.companies?.map((company: any) => (
                <button
                  key={company.name}
                  type="button"
                  onClick={() => setSelectedCompany(company.name)}
                  aria-pressed={selectedCompany === company.name}
                  className={cn('chip', selectedCompany === company.name && 'chip-on')}
                >
                  {company.name}
                  <span
                    className={cn(
                      'tabular-nums',
                      selectedCompany === company.name ? 'opacity-70' : 'text-fg-4'
                    )}
                  >
                    {company.count}
                  </span>
                </button>
              ))}
            </div>

            {filtersActive ? (
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-ghost btn-sm shrink-0 self-start"
              >
                Reset filters
              </button>
            ) : null}
          </div>
        </section>

        <p className="sr-only" role="status">
          {loading ? 'Loading problems' : `${problems.length} problems shown`}
        </p>

        {loading ? (
          <TableSkeleton rows={8} />
        ) : failed ? (
          <div className="card">
            <EmptyState
              icon={SearchX}
              title="Could not reach the problem bank"
              sub="The API is unreachable. Check that the backend service is running, then reload this page."
            />
          </div>
        ) : problems.length === 0 ? (
          <div className="card">
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
          </div>
        ) : (
          <>
            {/* Mobile list */}
            <section className="card overflow-hidden md:hidden" aria-label="Problem list">
              <ul className="divide-y divide-line-soft">
                {problems.map((problem) => {
                  const isSolved = problem.status === 'SOLVED';
                  return (
                    <li key={problem.id}>
                      <Link
                        href={`/problems/${problem.slug}`}
                        className="group block p-4 transition-colors hover:bg-ink-750"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="text-[15px] font-medium leading-snug text-white">
                              {problem.title}
                            </h2>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              <DifficultyBadge difficulty={problem.difficulty} />
                              <span className="text-xs text-fg-3">{problem.category}</span>
                            </div>
                          </div>
                          <ArrowRight
                            className="mt-0.5 h-4 w-4 shrink-0 text-fg-4 transition-colors group-hover:text-white"
                            aria-hidden
                          />
                        </div>

                        {problem.companyTags?.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {problem.companyTags.slice(0, 3).map((tag: string) => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                            {problem.companyTags.length > 3 ? (
                              <span className="self-center text-2xs text-fg-4">
                                +{problem.companyTags.length - 3}
                              </span>
                            ) : null}
                          </div>
                        ) : null}

                        <div className="mt-2.5 flex items-center gap-3 text-xs text-fg-4">
                          <span className="flex items-center gap-1">
                            {isSolved ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-easy" aria-hidden />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-fg-4" aria-hidden />
                            )}
                            {isSolved ? 'Solved' : 'Not solved'}
                          </span>
                          {problem.acceptanceRate != null ? (
                            <>
                              <span className="h-3 w-px bg-line" aria-hidden />
                              <span className="tabular-nums">
                                {problem.acceptanceRate}% acceptance
                              </span>
                            </>
                          ) : null}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Desktop table */}
            <section className="card hidden overflow-hidden md:block">
              <div
                className="overflow-x-auto"
                role="region"
                aria-label="Problem list"
                tabIndex={0}
              >
                <table className="table">
                  <thead className="thead">
                    <tr>
                      <th scope="col" className="w-14 text-center">
                        <span className="sr-only">Status</span>
                        <CheckCircle2 className="mx-auto h-3.5 w-3.5 text-fg-4" aria-hidden />
                      </th>
                      <th scope="col">Problem</th>
                      <th scope="col" className="hidden w-44 lg:table-cell">
                        Pattern
                      </th>
                      <th scope="col" className="w-28 text-center">
                        Difficulty
                      </th>
                      <th scope="col" className="hidden w-28 text-right xl:table-cell">
                        Acceptance
                      </th>
                      <th scope="col" className="w-20 text-right">
                        <span className="sr-only">Action</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="tbody">
                    {problems.map((problem) => {
                      const isSolved = problem.status === 'SOLVED';
                      return (
                        <tr key={problem.id}>
                          <td className="td text-center">
                            {isSolved ? (
                              <>
                                <CheckCircle2 className="mx-auto h-4 w-4 text-easy" aria-hidden />
                                <span className="sr-only">Solved</span>
                              </>
                            ) : (
                              <>
                                <Circle className="mx-auto h-4 w-4 text-fg-4" aria-hidden />
                                <span className="sr-only">Not solved</span>
                              </>
                            )}
                          </td>

                          <td className="td">
                            <Link
                              href={`/problems/${problem.slug}`}
                              className="text-[15px] font-medium text-white transition-colors hover:text-mark-bright"
                            >
                              {problem.title}
                            </Link>
                            {problem.companyTags?.length > 0 ? (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {problem.companyTags.slice(0, 4).map((tag: string) => (
                                  <Tag key={tag}>{tag}</Tag>
                                ))}
                                {problem.companyTags.length > 4 ? (
                                  <span className="self-center text-2xs text-fg-4">
                                    +{problem.companyTags.length - 4} more
                                  </span>
                                ) : null}
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

                          <td className="td num hidden text-right text-sm text-fg-2 xl:table-cell">
                            {problem.acceptanceRate != null
                              ? `${problem.acceptanceRate}%`
                              : '—'}
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
                      );
                    })}
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
