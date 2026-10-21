'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Calendar,
  CheckCircle2,
  Edit3,
  FileCode2,
  GraduationCap,
  History,
  Save,
  Target,
  XCircle,
} from 'lucide-react';
import {
  Button,
  EmptyState,
  LoadingState,
  PageHeader,
  ProgressBar,
  Tag,
} from '@/components/ui';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editYear, setEditYear] = useState<number>(2026);
  const [editTarget, setEditTarget] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        let u = api.getUser();
        if (!u) {
          const demo = await api.demoLogin();
          u = demo.user;
        }

        const [profData, statsData, subsData] = await Promise.all([
          api.getProfile(),
          api.getMyStats(),
          api.getUserSubmissions(),
        ]);

        const resolved = profData || u;
        setProfile(resolved);
        setStats(statsData);
        setSubmissions(subsData || []);

        if (resolved) {
          setEditName(resolved.name || '');
          setEditCollege(resolved.college || '');
          setEditYear(resolved.graduationYear || 2026);
          setEditTarget(resolved.targetCompany || '');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await api.updateProfile({
        name: editName,
        college: editCollege,
        graduationYear: Number(editYear),
        targetCompany: editTarget,
      });
      setProfile(updated);
      setIsEditing(false);
    } catch (err: any) {
      window.alert('Could not save your profile: ' + (err.message || 'unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex-1">
        <div className="shell page">
          <LoadingState label="Loading your profile…" />
        </div>
      </div>
    );
  }

  const overview = stats?.overview || {};
  const totalPossible = overview.totalOverall || 0;
  const percent =
    overview.percent ?? (totalPossible ? ((overview.solvedTotal || 0) / totalPossible) * 100 : 0);
  const degrees = Math.max(0, Math.min(100, percent)) * 3.6;

  const difficultyRows = [
    { label: 'Easy', solved: overview.solvedEasy || 0, total: overview.totalEasy || 0, tone: 'easy' as const },
    { label: 'Medium', solved: overview.solvedMedium || 0, total: overview.totalMedium || 0, tone: 'medium' as const },
    { label: 'Hard', solved: overview.solvedHard || 0, total: overview.totalHard || 0, tone: 'hard' as const },
  ];

  const toneText = { easy: 'text-easy', medium: 'text-medium', hard: 'text-hard' } as const;

  return (
    <div className="w-full flex-1">
      <div className="shell page">
        <PageHeader title="Profile" sub="Your record across the problem set and the mock tests you have sat." />

        {/* --------------------------------------------------- candidate card */}
        <section className="card overflow-hidden">
          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-paper text-xl font-semibold text-ink-950">
                {(profile?.name || '?').charAt(0).toUpperCase()}
              </span>

              <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-white">
                  {profile?.name}
                </h2>
                <p className="truncate text-sm text-fg-3">{profile?.email}</p>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-fg-2">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 shrink-0 text-fg-4" aria-hidden />
                    {profile?.college || 'College not set'}
                  </span>
                  <span className="flex items-center gap-1.5 tabular-nums">
                    <Calendar className="h-4 w-4 shrink-0 text-fg-4" aria-hidden />
                    Class of {profile?.graduationYear || 2026}
                  </span>
                  <span className="flex items-center gap-1.5 text-mark">
                    <Target className="h-4 w-4 shrink-0" aria-hidden />
                    Aiming at {profile?.targetCompany || 'any company'}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsEditing((v) => !v)}
              size="sm"
              variant={isEditing ? 'ghost' : 'secondary'}
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden />
              {isEditing ? 'Cancel' : 'Edit profile'}
            </Button>
          </div>

          {isEditing && (
            <form
              onSubmit={handleSaveProfile}
              className="grid gap-4 border-t border-line bg-ink-750/40 p-5 sm:grid-cols-2 sm:p-6"
            >
              <div>
                <label className="label" htmlFor="pf-name">
                  Full name
                </label>
                <input
                  id="pf-name"
                  className="input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
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
                  onChange={(e) => setEditCollege(e.target.value)}
                />
              </div>

              <div>
                <label className="label" htmlFor="pf-year">
                  Graduation year
                </label>
                <input
                  id="pf-year"
                  type="number"
                  className="input tabular-nums"
                  value={editYear}
                  onChange={(e) => setEditYear(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="label" htmlFor="pf-target">
                  Company you are targeting
                </label>
                <input
                  id="pf-target"
                  className="input"
                  placeholder="Amazon, Microsoft or TCS Prime"
                  value={editTarget}
                  onChange={(e) => setEditTarget(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button onClick={() => setIsEditing(false)} size="sm" variant="ghost">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={saving}>
                  <Save className="h-3.5 w-3.5" aria-hidden />
                  {saving ? 'Saving…' : 'Save profile'}
                </Button>
              </div>
            </form>
          )}
        </section>

        {/* --------------------------------------------------------- analytics */}
        <section className="grid gap-4 lg:grid-cols-3">
          {/* Solved ring */}
          <div className="card card-pad">
            <h3 className="text-sm font-semibold text-white">Solved problems</h3>

            <div className="my-6 flex justify-center">
              <div
                className="relative grid h-36 w-36 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(#EDF0F6 ${degrees}deg, #1F2632 ${degrees}deg 360deg)`,
                }}
                role="img"
                aria-label={`${percent}% of problems solved`}
              >
                <div className="grid h-[112px] w-[112px] place-items-center rounded-full bg-ink-800 text-center">
                  <div>
                    <div className="text-3xl font-semibold tabular-nums leading-none text-white">
                      {overview.solvedTotal || 0}
                    </div>
                    <div className="mt-1 text-xs tabular-nums text-fg-4">
                      of {totalPossible || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3.5 border-t border-line pt-4">
              {difficultyRows.map((row) => (
                <div key={row.label}>
                  <div className="mb-1.5 flex items-center justify-between text-[13px]">
                    <span className={`font-medium ${toneText[row.tone]}`}>{row.label}</span>
                    <span className="tabular-nums text-fg-3">
                      {row.solved} / {row.total}
                    </span>
                  </div>
                  <ProgressBar
                    tone={row.tone}
                    value={row.total ? (row.solved / row.total) * 100 : 0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* By company */}
          <div className="card card-pad">
            <h3 className="text-sm font-semibold text-white">Solved by drive</h3>
            {stats?.companyCounts && Object.keys(stats.companyCounts).length > 0 ? (
              <ul className="mt-4 divide-y divide-line-soft border-t border-line-soft">
                {Object.entries(stats.companyCounts).map(([company, count]: any) => (
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

          {/* By pattern */}
          <div className="card card-pad">
            <h3 className="text-sm font-semibold text-white">Solved by pattern</h3>
            {stats?.categoryCounts && Object.keys(stats.categoryCounts).length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-1.5 border-t border-line-soft pt-4">
                {Object.entries(stats.categoryCounts).map(([cat, count]: any) => (
                  <li key={cat}>
                    <Tag className="flex items-center gap-1.5 px-2 py-1 text-xs">
                      {cat}
                      <span className="font-semibold tabular-nums text-easy">{count}</span>
                    </Tag>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={FileCode2}
                title="No patterns recorded yet"
                sub="Patterns you have solved will collect here as you work through the set."
              />
            )}
          </div>
        </section>

        {/* ------------------------------------------------------- submissions */}
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5 sm:px-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <History className="h-4 w-4 text-fg-3" aria-hidden />
              Recent submissions
            </h3>
            <span className="text-[13px] tabular-nums text-fg-3">{submissions.length}</span>
          </div>

          {submissions.length === 0 ? (
            <EmptyState
              icon={History}
              title="No submissions yet"
              sub="Everything you run or submit shows up here with its verdict and runtime."
              action={
                <Link href="/problems" className="btn btn-secondary btn-sm">
                  Open the problem set
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-line-soft">
              {submissions.map((s) => {
                const accepted = s.status === 'ACCEPTED';
                return (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {accepted ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-easy" aria-hidden />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-hard" aria-hidden />
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/problems/${s.problem?.slug}`}
                          className="text-sm font-medium text-white transition-colors hover:text-mark"
                        >
                          {s.problem?.title}
                        </Link>
                        <p className="text-xs tabular-nums text-fg-4">
                          {new Date(s.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <Tag className="capitalize">{s.language}</Tag>
                      <span
                        className={`text-sm font-semibold ${accepted ? 'text-easy' : 'text-hard'}`}
                      >
                        {accepted ? 'Accepted' : s.status}
                      </span>
                      <span className="w-16 text-xs tabular-nums text-fg-4">
                        {s.runtimeMs || 0} ms
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
