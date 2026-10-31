'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import {
  Calendar,
  CheckCircle2,
  Edit3,
  FileCode2,
  GraduationCap,
  History,
  Save,
  Target,
  Timer,
  TriangleAlert,
  XCircle,
} from 'lucide-react';
import {
  Button,
  EmptyState,
  Notice,
  PageHeader,
  ProgressBar,
  Skeleton,
  Tag,
} from '@/components/ui';
import AuthRequired from '@/components/AuthRequired';

const STATUS_TEXT: Record<string, string> = {
  ACCEPTED: 'Accepted',
  WRONG_ANSWER: 'Wrong answer',
  TIME_LIMIT_EXCEEDED: 'Time limit exceeded',
  COMPILATION_ERROR: 'Compile error',
  RUNTIME_ERROR: 'Runtime error',
};

type SaveNotice = { tone: 'ok' | 'err'; text: string } | null;

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [signedOut, setSignedOut] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editYear, setEditYear] = useState<number>(2026);
  const [editTarget, setEditTarget] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<SaveNotice>(null);

  useEffect(() => {
    async function loadProfile() {
      const user = api.getUser();
      if (!user) {
        setSignedOut(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setFailed(false);

        const [profData, statsData, subsData] = await Promise.all([
          api.getProfile(),
          api.getMyStats(),
          api.getUserSubmissions(),
        ]);

        const resolved = profData || user;
        setProfile(resolved);
        setStats(statsData);
        setSubmissions(subsData || []);

        setEditName(resolved.name || '');
        setEditCollege(resolved.college || '');
        setEditYear(resolved.graduationYear || 2026);
        setEditTarget(resolved.targetCompany || '');
      } catch (error) {
        console.error(error);
        setFailed(true);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const startEditing = () => {
    setSaveNotice(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSaveNotice(null);
    if (profile) {
      setEditName(profile.name || '');
      setEditCollege(profile.college || '');
      setEditYear(profile.graduationYear || 2026);
      setEditTarget(profile.targetCompany || '');
    }
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaveNotice(null);

    if (!editName.trim()) {
      setSaveNotice({ tone: 'err', text: 'Enter your name before saving.' });
      return;
    }

    try {
      setSaving(true);
      const updated = await api.updateProfile({
        name: editName.trim(),
        college: editCollege.trim(),
        graduationYear: Number(editYear),
        targetCompany: editTarget.trim(),
      });
      setProfile(updated);
      setIsEditing(false);
      setSaveNotice({ tone: 'ok', text: 'Profile updated.' });
    } catch (error: any) {
      setSaveNotice({
        tone: 'err',
        text: error?.message || 'Your profile could not be saved. Check the API and try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (signedOut) {
    return (
      <AuthRequired
        title="Sign in to view your profile"
        description="Your readiness, solved patterns, and submission history live on your account."
      />
    );
  }

  if (loading) {
    return (
      <div className="w-full flex-1">
        <div className="shell page">
          <div className="page-head">
            <div>
              <Skeleton className="h-8 w-40" />
              <Skeleton className="mt-3 h-4 w-72 max-w-full" />
            </div>
          </div>
          <div className="card card-pad">
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="mt-2 h-4 w-64 max-w-full" />
              </div>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-72 rounded-lg" />
            <Skeleton className="h-72 rounded-lg" />
          </div>
          <Skeleton className="h-56 rounded-lg" />
        </div>
      </div>
    );
  }

  if (failed || !profile) {
    return (
      <div className="w-full flex-1">
        <div className="shell page">
          <div className="card">
            <EmptyState
              icon={TriangleAlert}
              title="Could not load your profile"
              sub="The API is unreachable. Check that the backend service is running, then reload this page."
              action={
                <Button size="sm" onClick={() => window.location.reload()}>
                  Reload
                </Button>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  const overview = stats?.overview || {};
  const totalPossible = overview.totalOverall || 0;
  const percent = Math.max(
    0,
    Math.min(
      100,
      overview.percent ?? (totalPossible ? ((overview.solvedTotal || 0) / totalPossible) * 100 : 0)
    )
  );
  const degrees = percent * 3.6;

  const difficultyRows = [
    {
      label: 'Easy',
      solved: overview.solvedEasy || 0,
      total: overview.totalEasy || 0,
      tone: 'easy' as const,
    },
    {
      label: 'Medium',
      solved: overview.solvedMedium || 0,
      total: overview.totalMedium || 0,
      tone: 'medium' as const,
    },
    {
      label: 'Hard',
      solved: overview.solvedHard || 0,
      total: overview.totalHard || 0,
      tone: 'hard' as const,
    },
  ];

  const toneText = { easy: 'text-easy', medium: 'text-medium', hard: 'text-hard' } as const;
  const mockAttempts: any[] = stats?.assessmentsCompleted || [];

  return (
    <div className="w-full flex-1">
      <div className="shell page">
        <PageHeader
          title="Profile"
          sub="Your record across the problem set and the mock tests you have sat."
          actions={
            !isEditing ? (
              <Button size="sm" onClick={startEditing}>
                <Edit3 className="h-3.5 w-3.5" aria-hidden />
                Edit profile
              </Button>
            ) : null
          }
        />

        {saveNotice ? (
          <Notice
            tone={saveNotice.tone}
            icon={saveNotice.tone === 'ok' ? CheckCircle2 : TriangleAlert}
            action={
              <button
                type="button"
                onClick={() => setSaveNotice(null)}
                className="text-xs underline underline-offset-2 hover:opacity-80"
              >
                Dismiss
              </button>
            }
          >
            {saveNotice.text}
          </Notice>
        ) : null}

        {/* --------------------------------------------------- candidate card */}
        <section className="card overflow-hidden">
          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-mark text-xl font-semibold text-white">
                {(profile.name || '?').charAt(0).toUpperCase()}
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold tracking-[-0.02em] text-white">
                    {profile.name}
                  </h2>
                  <span className="badge badge-neutral">
                    {profile.role === 'ADMIN' || profile.role === 'TRAINER' ? 'Trainer' : 'Student'}
                  </span>
                </div>
                <p className="truncate text-sm text-fg-3">{profile.email}</p>

                <dl className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-fg-2">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 shrink-0 text-fg-3" aria-hidden />
                    <dt className="sr-only">College</dt>
                    <dd>{profile.college || 'College not set'}</dd>
                  </div>
                  <div className="flex items-center gap-1.5 tabular-nums">
                    <Calendar className="h-4 w-4 shrink-0 text-fg-3" aria-hidden />
                    <dt className="sr-only">Graduation year</dt>
                    <dd>Class of {profile.graduationYear || 2026}</dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Target className="h-4 w-4 shrink-0 text-fg-3" aria-hidden />
                    <dt className="sr-only">Target company</dt>
                    <dd className="text-fg-2">{profile.targetCompany || 'No target set'}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs tabular-nums text-fg-3">
                {overview.solvedTotal || 0} solved · {mockAttempts.length} mocks completed
              </span>
            </div>
          </div>

          {isEditing ? (
            <form
              onSubmit={handleSaveProfile}
              className="grid gap-4 border-t border-line bg-ink-850/60 p-5 sm:grid-cols-2 sm:p-6"
            >
              <div>
                <label className="label" htmlFor="pf-name">
                  Full name
                </label>
                <input
                  id="pf-name"
                  required
                  className="input"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                />
              </div>

              <div>
                <label className="label" htmlFor="pf-college">
                  College or institute
                </label>
                <input
                  id="pf-college"
                  className="input"
                  value={editCollege}
                  onChange={(event) => setEditCollege(event.target.value)}
                />
              </div>

              <div>
                <label className="label" htmlFor="pf-year">
                  Graduation year
                </label>
                <input
                  id="pf-year"
                  type="number"
                  min={2000}
                  max={2100}
                  className="input tabular-nums"
                  value={editYear}
                  onChange={(event) => setEditYear(Number(event.target.value))}
                />
              </div>

              <div>
                <label className="label" htmlFor="pf-target">
                  Target companies
                </label>
                <input
                  id="pf-target"
                  className="input"
                  placeholder="Amazon, Microsoft, or TCS Prime"
                  value={editTarget}
                  onChange={(event) => setEditTarget(event.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button type="button" onClick={cancelEditing} size="sm" variant="ghost">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={saving}>
                  <Save className="h-3.5 w-3.5" aria-hidden />
                  {saving ? 'Saving…' : 'Save profile'}
                </Button>
              </div>
            </form>
          ) : null}
        </section>

        {/* --------------------------------------------------------- analytics */}
        <section
          aria-label="Progress analytics"
          className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
        >
          <div className="card card-pad">
            <h3 className="text-sm font-semibold text-white">Readiness</h3>

            <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <div
                className="relative grid h-32 w-32 shrink-0 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(#A5B4FC ${degrees}deg, #1C2C48 ${degrees}deg 360deg)`,
                }}
                role="img"
                aria-label={`${Math.round(percent)}% of problems solved`}
              >
                <div className="grid h-[100px] w-[100px] place-items-center rounded-full bg-ink-800 text-center">
                  <div>
                    <div className="text-[28px] font-semibold leading-none tabular-nums text-white">
                      {Math.round(percent)}%
                    </div>
                    <div className="mt-1 text-xs tabular-nums text-fg-3">
                      {overview.solvedTotal || 0} of {totalPossible || 0}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full min-w-0 space-y-3.5">
                {difficultyRows.map((row) => (
                  <div key={row.label}>
                    <div className="mb-1.5 flex items-center justify-between text-[13px]">
                      <span className={cn('font-medium', toneText[row.tone])}>{row.label}</span>
                      <span className="tabular-nums text-fg-3">
                        {row.solved} / {row.total}
                      </span>
                    </div>
                    <ProgressBar
                      tone={row.tone}
                      value={row.total ? (row.solved / row.total) * 100 : 0}
                      label={`${row.label} problems solved`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-5 border-t border-line-soft pt-4 text-[13px] leading-relaxed text-fg-3">
              Readiness counts unique solved problems. Mock marks appear separately below.
            </p>
          </div>

          <div className="card card-pad">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Timer className="h-4 w-4 text-fg-3" aria-hidden />
                Mock tests
              </h3>
              <Link
                href="/assessments"
                className="text-[13px] font-medium text-fg-3 transition-colors hover:text-white"
              >
                All tests
              </Link>
            </div>

            {mockAttempts.length === 0 ? (
              <EmptyState
                icon={Timer}
                title="No mock tests completed"
                sub="Sit a timed test to record a score here."
                action={
                  <Link href="/assessments" className="btn btn-secondary btn-sm">
                    Browse mock tests
                  </Link>
                }
              />
            ) : (
              <ul className="mt-4 divide-y divide-line-soft border-t border-line-soft">
                {mockAttempts.slice(0, 5).map((attempt) => (
                  <li
                    key={attempt.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-fg">
                        {attempt.assessment?.title || 'Mock test'}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-fg-3">
                        {attempt.assessment?.company || 'Timed assessment'}
                        {attempt.submittedAt
                          ? ` · ${new Date(attempt.submittedAt).toLocaleDateString()}`
                          : ''}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold tabular-nums text-white">
                      {attempt.score ?? 0}
                      <span className="ml-1 text-xs font-normal text-fg-3">marks</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section aria-label="Coverage" className="grid gap-4 md:grid-cols-2">
          <div className="card card-pad">
            <h3 className="text-sm font-semibold text-white">Solved by drive</h3>
            {stats?.companyCounts && Object.keys(stats.companyCounts).length > 0 ? (
              <ul className="mt-4 divide-y divide-line-soft border-t border-line-soft">
                {Object.entries(stats.companyCounts)
                  .sort(([, a]: any, [, b]: any) => b - a)
                  .map(([company, count]: any) => (
                    <li key={company} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="truncate text-sm text-fg-2">{company}</span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-white">
                        {count}
                      </span>
                    </li>
                  ))}
              </ul>
            ) : (
              <EmptyState
                icon={FileCode2}
                title="No drives recorded yet"
                sub="Solve a problem tagged with a company and it will be counted here."
              />
            )}
          </div>

          <div className="card card-pad">
            <h3 className="text-sm font-semibold text-white">Solved by pattern</h3>
            {stats?.categoryCounts && Object.keys(stats.categoryCounts).length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-1.5 border-t border-line-soft pt-4">
                {Object.entries(stats.categoryCounts).map(([category, count]: any) => (
                  <li key={category}>
                    <Tag className="flex items-center gap-1.5 px-2 py-1 text-xs">
                      {category}
                      <span className="font-semibold tabular-nums text-easy">{count}</span>
                    </Tag>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={FileCode2}
                title="No patterns recorded yet"
                sub="Patterns you solve will collect here as you work through the set."
              />
            )}
          </div>
        </section>

        {/* ------------------------------------------------------- submissions */}
        <section className="card overflow-hidden" aria-labelledby="submissions-heading">
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5 sm:px-6">
            <h2
              id="submissions-heading"
              className="flex items-center gap-2 text-sm font-semibold text-white"
            >
              <History className="h-4 w-4 text-fg-3" aria-hidden />
              Recent submissions
            </h2>
            <span className="text-[13px] tabular-nums text-fg-3">{submissions.length}</span>
          </div>

          {submissions.length === 0 ? (
            <EmptyState
              icon={History}
              title="No submissions yet"
              sub="Everything you run or submit appears here with its verdict and runtime."
              action={
                <Link href="/problems" className="btn btn-secondary btn-sm">
                  Open the problem set
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-line-soft">
              {submissions.map((submission) => {
                const accepted = submission.status === 'ACCEPTED';
                const statusLabel = accepted
                  ? 'Accepted'
                  : STATUS_TEXT[submission.status] || submission.status;

                return (
                  <li
                    key={submission.id}
                    className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      {accepted ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-easy" aria-hidden />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-hard" aria-hidden />
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/problems/${submission.problem?.slug || ''}`}
                          className="text-sm font-medium text-white transition-colors hover:text-mark-bright"
                        >
                          {submission.problem?.title || 'Problem'}
                        </Link>
                        <p className="mt-0.5 text-xs tabular-nums text-fg-3">
                          {new Date(submission.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pl-7 sm:shrink-0 sm:pl-0">
                      <Tag className="capitalize">{submission.language}</Tag>
                      <span
                        className={cn(
                          'text-sm font-medium',
                          accepted ? 'text-easy' : 'text-hard'
                        )}
                      >
                        {statusLabel}
                      </span>
                      <span className="text-xs tabular-nums text-fg-3">
                        {submission.runtimeMs || 0} ms
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
