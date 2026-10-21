'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Check, Clock, ShieldCheck, Timer } from 'lucide-react';
import { EmptyState, LinkButton, LoadingState, PageHeader } from '@/components/ui';

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .getAssessments()
      .then((data) => setAssessments(data || []))
      .catch((e) => {
        console.error(e);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full flex-1">
      <div className="shell page">
        <PageHeader
          title="Mock tests"
          sub="Sit these under the same conditions as the real thing: a countdown running, a fixed mark allocation, and answers graded against hidden cases you never see."
          actions={
            <div className="rounded-md border border-line bg-ink-800 px-4 py-2.5 text-[13px]">
              <span className="text-base font-semibold tabular-nums leading-none text-white">
                {assessments.length}
              </span>{' '}
              <span className="text-fg-3">tests available</span>
            </div>
          }
        />

        {loading ? (
          <LoadingState label="Loading mock tests…" />
        ) : failed ? (
          <EmptyState
            icon={Timer}
            title="Could not load mock tests"
            sub="The API at http://localhost:4000 is not responding. Start the backend, then reload this page."
          />
        ) : assessments.length === 0 ? (
          <EmptyState
            icon={Timer}
            title="No mock tests scheduled"
            sub="Tests published by a trainer will appear here with their duration and mark allocation."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {assessments.map((a) => {
              const attempts = a.attempts || [];
              const last = attempts[0];
              const passed = last && a.totalMarks ? last.score >= a.totalMarks * 0.6 : false;

              return (
                <article key={a.id} className="card card-pad card-hover flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className="badge badge-neutral">{a.company}</span>
                    <span className="flex shrink-0 items-center gap-1.5 text-[13px] tabular-nums text-fg-3">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {a.durationMinutes} min
                    </span>
                  </div>

                  <h2 className="mt-3 text-base font-semibold leading-snug text-white">{a.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg-3">{a.description}</p>

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

                  {last ? (
                    <div
                      className={`mt-3 flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-[13px] ${
                        passed ? 'border-easy/30 bg-easy/10' : 'border-line bg-ink-750'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-fg-3">
                        <Check className={`h-3.5 w-3.5 ${passed ? 'text-easy' : 'text-fg-4'}`} aria-hidden />
                        Last attempt
                      </span>
                      <span
                        className={`font-semibold tabular-nums ${passed ? 'text-easy' : 'text-fg'}`}
                      >
                        {last.score} / {a.totalMarks}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-md border border-line bg-ink-750 px-3 py-2 text-[13px] text-fg-4">
                      Not attempted yet
                    </div>
                  )}

                  <div className="mt-auto pt-5">
                    <LinkButton
                      href={`/assessments/${a.id}`}
                      variant="primary"
                      block
                      size="lg"
                    >
                      <ShieldCheck className="h-4 w-4" aria-hidden />
                      {last ? 'Retake mock test' : 'Start mock test'}
                    </LinkButton>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
