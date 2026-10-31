'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Timer, TriangleAlert } from 'lucide-react';
import {
  CardGridSkeleton,
  EmptyState,
  LinkButton,
  PageHeader,
} from '@/components/ui';
import AssessmentCard from '@/components/AssessmentCard';

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .getAssessments()
      .then((data) => setAssessments(data || []))
      .catch((error) => {
        console.error(error);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const attempted = assessments.filter((item) => (item.attempts || []).length > 0).length;

  return (
    <div className="w-full flex-1">
      <div className="shell page">
        <PageHeader
          title="Mock tests"
          sub="Sit these under exam conditions: a running countdown, a fixed mark allocation, and answers graded against hidden cases."
          actions={
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px]">
              <span className="text-fg-3">
                <span className="font-semibold tabular-nums text-white">
                  {assessments.length}
                </span>{' '}
                available
              </span>
              <span className="h-4 w-px bg-line" aria-hidden />
              <span className="text-fg-3">
                <span className="font-semibold tabular-nums text-white">{attempted}</span>{' '}
                attempted
              </span>
            </div>
          }
        />

        {loading ? (
          <CardGridSkeleton count={3} className="md:grid-cols-2 lg:grid-cols-3" />
        ) : failed ? (
          <div className="card">
            <EmptyState
              icon={TriangleAlert}
              title="Could not load mock tests"
              sub="The API is unreachable. Check that the backend service is running, then reload this page."
              action={
                <LinkButton href="/assessments" size="sm">
                  Try again
                </LinkButton>
              }
            />
          </div>
        ) : assessments.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Timer}
              title="No mock tests available"
              sub="Timed tests appear here once a trainer publishes them for your campus."
            />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assessments.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))}
          </div>
        )}

        <p className="text-xs leading-relaxed text-fg-3">
          Each attempt starts a fresh countdown. Scores are recorded once you end the test or the
          time runs out.
        </p>
      </div>
    </div>
  );
}
