import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';

export type AssessmentSummary = {
  id: string;
  title: string;
  description?: string;
  company?: string;
  durationMinutes?: number;
  totalMarks?: number;
  problemCount?: number;
  attempts?: Array<{ score?: number; submittedAt?: string; createdAt?: string }>;
};

export default function AssessmentCard({
  assessment,
  className,
}: {
  assessment: AssessmentSummary;
  className?: string;
}) {
  const attempts = assessment.attempts || [];
  const last = attempts[0];
  const totalMarks = assessment.totalMarks || 0;
  const score = last?.score ?? 0;
  const passed = Boolean(last) && totalMarks > 0 && score >= totalMarks * 0.6;

  return (
    <Link
      href={`/assessments/${assessment.id}`}
      className={cn(
        'card card-pad card-hover group flex flex-col focus-visible:outline-offset-4',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow">{assessment.company || 'Mock test'}</span>
        <span className="flex shrink-0 items-center gap-1.5 text-xs tabular-nums text-fg-3">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {assessment.durationMinutes} min
        </span>
      </div>

      <h3 className="mt-3 text-[15px] font-semibold leading-snug text-white sm:text-base">
        {assessment.title}
      </h3>
      {assessment.description ? (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-fg-3">
          {assessment.description}
        </p>
      ) : null}

      <dl className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
        <div className="flex items-center gap-1.5">
          <dt className="text-fg-3">Problems</dt>
          <dd className="font-medium tabular-nums text-fg">{assessment.problemCount ?? 0}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="text-fg-3">Marks</dt>
          <dd className="font-medium tabular-nums text-fg">{totalMarks}</dd>
        </div>
        {last ? (
          <div className="flex items-center gap-1.5">
            <dt className="text-fg-3">Last score</dt>
            <dd
              className={cn(
                'inline-flex items-center gap-1 font-semibold tabular-nums',
                passed ? 'text-easy' : 'text-fg'
              )}
            >
              {passed ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> : null}
              {score} / {totalMarks}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line-soft pt-4">
        <span className="text-xs text-fg-4">
          {last ? (passed ? 'Cut-off cleared' : 'Below the cut-off') : 'Not attempted yet'}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-mark-bright transition-colors group-hover:text-white">
          {last ? (
            <>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Retake
            </>
          ) : (
            <>
              Start test
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </>
          )}
        </span>
      </div>
    </Link>
  );
}
