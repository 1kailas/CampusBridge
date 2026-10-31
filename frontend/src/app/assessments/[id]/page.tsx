'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Play,
  ShieldCheck,
  TriangleAlert,
  XCircle,
} from 'lucide-react';
import {
  Badge,
  Button,
  ConfirmDialog,
  Dialog,
  DifficultyBadge,
  EmptyState,
  LinkButton,
  LoadingState,
  Notice,
} from '@/components/ui';
import AuthRequired from '@/components/AuthRequired';
import Markdown from '@/components/Markdown';
import CodeEditor from '@/components/CodeEditor';

type Language = 'python' | 'cpp' | 'java' | 'javascript';

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'python', label: 'Python 3' },
  { value: 'cpp', label: 'C++ 17' },
  { value: 'java', label: 'Java 17' },
  { value: 'javascript', label: 'JavaScript' },
];

const STATUS_TEXT: Record<string, string> = {
  ACCEPTED: 'All sample cases passed',
  WRONG_ANSWER: 'Wrong answer on a sample case',
  TIME_LIMIT_EXCEEDED: 'Time limit exceeded',
  COMPILATION_ERROR: 'Compilation error',
  RUNTIME_ERROR: 'Runtime error',
};

function formatTimer(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function AssessmentRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [assessment, setAssessment] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);
  const [failed, setFailed] = useState(false);

  const [activeProbIndex, setActiveProbIndex] = useState(0);
  const [language, setLanguage] = useState<Language>('python');
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [mobileTab, setMobileTab] = useState<'problem' | 'code'>('problem');

  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [testFinished, setTestFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);

  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);
  const [runError, setRunError] = useState('');
  const [problemScores, setProblemScores] = useState<
    Record<string, { score: number; passed: number; total: number }>
  >({});
  const [consoleOpen, setConsoleOpen] = useState(true);

  const finalizingRef = useRef(false);

  useEffect(() => {
    async function initAssessment() {
      if (!api.getUser()) {
        setSignedOut(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setFailed(false);

        const data = await api.getAssessmentById(id);
        setAssessment(data);

        const startRes = await api.startAssessment(id);
        setAttempt(startRes);

        const elapsed = Math.floor(
          (Date.now() - new Date(startRes.startedAt).getTime()) / 1000
        );
        const total = data.durationMinutes * 60;
        setTimeLeft(Math.max(0, total - elapsed));
      } catch (error) {
        console.error(error);
        setFailed(true);
      } finally {
        setLoading(false);
      }
    }

    if (id) initAssessment();
  }, [id]);

  useEffect(() => {
    if (!attempt || testFinished) return;

    const timer = window.setInterval(() => {
      setTimeLeft((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [attempt, testFinished]);

  const questions: any[] = assessment?.problems || [];
  const currentProblem = questions[activeProbIndex];
  const codeKey = currentProblem ? `${currentProblem.id}:${language}` : '';
  const currentCode =
    currentProblem && codeKey
      ? codes[codeKey] ?? currentProblem.defaultTemplates?.[language] ?? ''
      : '';
  const isUrgent = timeLeft <= 300;

  const attemptedCount = Object.keys(problemScores).length;
  const unansweredCount = Math.max(0, questions.length - attemptedCount);

  const updateCode = (value: string) => {
    if (!currentProblem) return;
    setCodes((previous) => ({ ...previous, [codeKey]: value }));
  };

  const handleLanguageChange = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    setRunResult(null);
    setRunError('');
  };

  const handleRunCurrentCode = async () => {
    if (!currentProblem || testFinished) return;

    setRunning(true);
    setRunError('');
    setRunResult(null);
    setConsoleOpen(true);

    try {
      const result = await api.runCode(currentProblem.id, language, currentCode);
      setRunResult(result);

      const passed = Number(result.passedTests || 0);
      const total = Number(result.totalTests || 0);
      const points = currentProblem.points || 0;
      const earned = total > 0 ? Math.round((passed / total) * points) : 0;

      setProblemScores((previous) => ({
        ...previous,
        [currentProblem.id]: { score: earned, passed, total },
      }));
    } catch (error: any) {
      setRunError(
        error?.message ||
          'Code execution failed. Check that the judging service is running, then try again.'
      );
    } finally {
      setRunning(false);
    }
  };

  async function handleFinalSubmit(auto = false) {
    if (!attempt || !assessment || finalizingRef.current || testFinished) return;

    finalizingRef.current = true;
    setConfirmEndOpen(false);
    setFinalizing(true);
    setSubmitError('');

    const scoresArray = questions.map((problem: any) => {
      const item = problemScores[problem.id] || { score: 0, passed: 0, total: 0 };
      return {
        problemId: problem.id,
        score: item.score,
        passedCount: item.passed,
        totalCount: item.total,
      };
    });

    const totalEarned = scoresArray.reduce((sum: number, item: any) => sum + item.score, 0);

    try {
      await api.submitAssessment(attempt.id, scoresArray);
      setFinalScore(totalEarned);
      setTestFinished(true);
      if (totalEarned > 0) {
        try {
          const confetti = (await import('canvas-confetti')).default;
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.5 },
          });
        } catch {
          // ignore
        }
      }
    } catch (error: any) {
      finalizingRef.current = false;
      setSubmitError(
        error?.message ||
          (auto
            ? 'Time ran out, but your answers could not be submitted. Check your connection and retry.'
            : 'Your answers could not be submitted. Check your connection and try again.')
      );
    } finally {
      setFinalizing(false);
    }
  }

  useEffect(() => {
    if (timeLeft === 0 && attempt && assessment && !testFinished) {
      handleFinalSubmit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, attempt, assessment, testFinished]);

  const onQuestionKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();

    let next = activeProbIndex;
    if (event.key === 'ArrowLeft') next = Math.max(0, activeProbIndex - 1);
    if (event.key === 'ArrowRight') next = Math.min(questions.length - 1, activeProbIndex + 1);
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = questions.length - 1;

    setActiveProbIndex(next);
    setRunResult(null);
    setRunError('');
    window.requestAnimationFrame(() => {
      document.getElementById(`question-tab-${next}`)?.focus();
    });
  };

  if (signedOut) {
    return (
      <AuthRequired
        title="Sign in to sit this mock test"
        description="Your answers, timer, and score are tied to your account."
      />
    );
  }

  if (loading) {
    return (
      <div className="flex w-full flex-1 items-center justify-center bg-ink-900">
        <LoadingState label="Starting your mock test…" />
      </div>
    );
  }

  if (failed || !assessment || !currentProblem) {
    return (
      <div className="w-full flex-1">
        <div className="shell page">
          <div className="card">
            <EmptyState
              icon={ShieldCheck}
              title="This mock test could not be opened"
              sub="The test may have been unpublished, or the API is unavailable right now."
              action={
                <LinkButton href="/assessments" size="sm">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                  Back to mock tests
                </LinkButton>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  const showTimeUpDialog = timeLeft === 0 && !testFinished;
  const finalPassed =
    finalScore !== null && assessment.totalMarks > 0
      ? finalScore >= assessment.totalMarks * 0.6
      : false;

  return (
    <div className="flex h-[calc(100dvh-4rem-1px)] w-full flex-col overflow-hidden bg-ink-900">
      {/* ------------------------------------------------------------- exam bar */}
      <div className="shrink-0 border-b border-line bg-ink-850">
        <div className="shell flex h-14 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Link
              href="/assessments"
              className="hidden shrink-0 items-center gap-1.5 text-[13px] font-medium text-fg-3 transition-colors hover:text-white sm:flex"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only sm:not-sr-only">Mock tests</span>
            </Link>
            <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
            <h1 className="truncate text-sm font-semibold text-white">{assessment.title}</h1>
            <Badge className="hidden shrink-0 lg:inline-flex">
              {assessment.company || 'Timed test'}
            </Badge>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <span className="hidden text-xs tabular-nums text-fg-3 md:inline">
              {attemptedCount} of {questions.length} attempted
            </span>

            <div
              className={cn(
                'flex h-9 items-center gap-2 rounded-md border px-2.5 font-mono text-sm font-semibold tabular-nums sm:px-3',
                isUrgent
                  ? 'border-hard/50 bg-hard/10 text-hard'
                  : 'border-line-strong bg-ink-750 text-fg'
              )}
              role="timer"
              aria-label={`Time remaining ${formatTimer(timeLeft)}`}
            >
              <Clock className="h-4 w-4" aria-hidden />
              {formatTimer(timeLeft)}
            </div>

            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirmEndOpen(true)}
              disabled={testFinished || finalizing}
            >
              {finalizing ? 'Submitting…' : 'End test'}
            </Button>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------- question / language */}
      <div className="shrink-0 border-b border-line bg-ink-900">
        <div className="shell flex h-12 items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Assessment questions"
            onKeyDown={onQuestionKeyDown}
            className="seg min-w-0 overflow-x-auto scrollbar-none"
          >
            {questions.map((problem: any, index: number) => {
              const current = activeProbIndex === index;
              const score = problemScores[problem.id];

              return (
                <button
                  key={problem.id}
                  id={`question-tab-${index}`}
                  role="tab"
                  aria-selected={current}
                  aria-controls="statement-panel"
                  aria-label={`Question ${index + 1}: ${problem.title}, ${problem.points} points${
                    score ? `, ${score.score} earned` : ''
                  }`}
                  tabIndex={current ? 0 : -1}
                  onClick={() => {
                    setActiveProbIndex(index);
                    setRunResult(null);
                    setRunError('');
                  }}
                  className={cn(
                    'seg-btn shrink-0 gap-1.5',
                    current && 'seg-btn-on',
                    !current && score && 'text-fg-2'
                  )}
                >
                  Q{index + 1}
                  <span className="hidden text-xs tabular-nums text-fg-3 sm:inline">
                    {problem.points}p
                  </span>
                  {score ? (
                    <span
                      className={cn(
                        'font-semibold tabular-nums',
                        score.score === problem.points ? 'text-easy' : 'text-medium'
                      )}
                    >
                      {score.score}/{problem.points}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <label className="sr-only" htmlFor="assessment-language">
              Language
            </label>
            <select
              id="assessment-language"
              value={language}
              onChange={(event) => handleLanguageChange(event.target.value as Language)}
              className="select h-8 w-[112px] text-[13px] sm:w-auto"
            >
              {LANGUAGES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <Button
              variant="primary"
              size="sm"
              onClick={handleRunCurrentCode}
              disabled={running || testFinished}
            >
              {running ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Play className="h-3.5 w-3.5" aria-hidden />
              )}
              {running ? 'Running' : 'Run'}
            </Button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- mobile switcher */}
      <div className="shrink-0 border-b border-line bg-ink-900 lg:hidden">
        <div className="shell py-2">
          <div role="tablist" aria-label="Assessment workspace" className="seg w-full">
            {(
              [
                { key: 'problem', label: 'Question' },
                { key: 'code', label: 'Editor & results' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                id={tab.key === 'problem' ? 'assessment-statement-tab' : 'assessment-editor-tab'}
                role="tab"
                aria-selected={mobileTab === tab.key}
                aria-controls={tab.key === 'problem' ? 'statement-panel' : 'editor-panel'}
                onClick={() => setMobileTab(tab.key)}
                className={cn('seg-btn flex-1', mobileTab === tab.key && 'seg-btn-on')}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {submitError && timeLeft > 0 ? (
        <div className="shrink-0 border-b border-line bg-ink-900 px-4 py-2.5">
          <div className="shell">
            <Notice
              tone="err"
              icon={TriangleAlert}
              action={
                <Button size="sm" variant="secondary" onClick={() => handleFinalSubmit(true)}>
                  Retry
                </Button>
              }
            >
              {submitError}
            </Notice>
          </div>
        </div>
      ) : null}

      {/* --------------------------------------------------------------- body */}
      <div className="flex w-full flex-1 overflow-hidden">
        {/* Statement */}
        <div
          id="statement-panel"
          role="tabpanel"
          aria-labelledby={`question-tab-${activeProbIndex}`}
          tabIndex={0}
          className={cn(
            'flex flex-col overflow-y-auto border-line bg-ink-850 p-5 sm:p-7 lg:w-[48%] lg:border-r',
            mobileTab === 'problem' ? 'w-full' : 'hidden lg:flex'
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-medium tabular-nums text-fg-3">
              Question {activeProbIndex + 1} of {questions.length}
            </span>
            <span className="h-3 w-px bg-line" aria-hidden />
            <Badge tone="mark">{currentProblem.points} points</Badge>
            <DifficultyBadge difficulty={currentProblem.difficulty} />
          </div>

          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.022em] text-white">
            {currentProblem.title}
          </h2>

          {currentProblem.category ? (
            <div className="mt-3">
              <span className="tag">{currentProblem.category}</span>
            </div>
          ) : null}

          <Markdown text={currentProblem.description} className="mt-5 text-sm text-fg-2" />

          {Array.isArray(currentProblem.examples) && currentProblem.examples.length > 0 ? (
            <section className="mt-7" aria-labelledby="assessment-examples">
              <h3 id="assessment-examples" className="text-sm font-semibold text-white">
                Examples
              </h3>
              <div className="mt-3 space-y-3">
                {currentProblem.examples.map((example: any, index: number) => (
                  <div key={index} className="card p-4">
                    <div className="mb-2 text-xs font-medium text-fg-3">
                      Example {index + 1}
                    </div>
                    <div className="space-y-1.5 font-mono text-[13px]">
                      <div>
                        <span className="text-fg-3">Input </span>
                        <span className="text-fg">{example.input}</span>
                      </div>
                      <div>
                        <span className="text-fg-3">Output </span>
                        <span className="text-easy">{example.output}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {Array.isArray(currentProblem.constraints) && currentProblem.constraints.length > 0 ? (
            <section className="mt-7" aria-labelledby="assessment-constraints">
              <h3 id="assessment-constraints" className="text-sm font-semibold text-white">
                Constraints
              </h3>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {currentProblem.constraints.map((constraint: string, index: number) => (
                  <li
                    key={index}
                    className="rounded-sm border border-line bg-ink-800 px-2.5 py-1 font-mono text-[13px] text-fg-2"
                  >
                    {constraint}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        {/* Editor + results */}
        <div
          id="editor-panel"
          role="tabpanel"
          aria-labelledby="assessment-editor-tab"
          className={cn(
            'flex flex-col bg-ink-950 lg:flex-1',
            mobileTab === 'code' ? 'w-full' : 'hidden lg:flex'
          )}
        >
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <CodeEditor
              language={language}
              value={currentCode}
              onChange={(value) => updateCode(value || '')}
            />
          </div>

          {/* Result console */}
          <div
            className={cn(
              'flex shrink-0 flex-col border-t border-line bg-ink-850 transition-[height] duration-200',
              consoleOpen ? 'h-52 sm:h-56' : 'h-11'
            )}
          >
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-4">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-fg-2">Sample tests</span>
                {problemScores[currentProblem.id] ? (
                  <span className="text-[13px] font-semibold tabular-nums text-fg">
                    {problemScores[currentProblem.id].score} / {currentProblem.points} points
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setConsoleOpen((value) => !value)}
                aria-expanded={consoleOpen}
                aria-controls="assessment-console"
                aria-label={consoleOpen ? 'Collapse sample test results' : 'Expand sample test results'}
                className="btn btn-ghost btn-sm px-2"
              >
                {consoleOpen ? (
                  <ChevronDown className="h-4 w-4" aria-hidden />
                ) : (
                  <ChevronUp className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>

            {consoleOpen ? (
              <div id="assessment-console" className="flex-1 overflow-y-auto p-4 text-[13px]">
                {runError ? (
                  <Notice tone="err" icon={TriangleAlert}>
                    {runError}
                  </Notice>
                ) : !runResult ? (
                  <p className="py-6 text-center text-fg-3">
                    Run your code to check it against the sample cases. Only your latest run on
                    each question counts toward the score.
                  </p>
                ) : (
                  <div className="space-y-3" role="status">
                    <div
                      className={cn(
                        'flex flex-wrap items-center gap-x-3 gap-y-1 font-medium',
                        runResult.status === 'ACCEPTED' ? 'text-easy' : 'text-hard'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {runResult.status === 'ACCEPTED' ? (
                          <CheckCircle2 className="h-4 w-4" aria-hidden />
                        ) : (
                          <XCircle className="h-4 w-4" aria-hidden />
                        )}
                        {STATUS_TEXT[runResult.status] || runResult.status}
                      </span>
                      <span className="font-normal tabular-nums text-fg-3">
                        {runResult.passedTests}/{runResult.totalTests} cases
                      </span>
                      <span className="font-normal tabular-nums text-fg-3">
                        {runResult.runtimeMs || 0} ms
                      </span>
                    </div>

                    {Array.isArray(runResult.testResults)
                      ? runResult.testResults.map((testCase: any) => (
                          <div
                            key={testCase.index}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-ink-800 px-3 py-2"
                          >
                            <span className="text-fg-2">
                              Case {testCase.index}:{' '}
                              <span className={testCase.passed ? 'text-easy' : 'text-hard'}>
                                {testCase.passed ? 'passed' : 'failed'}
                              </span>
                            </span>
                            <span className="max-w-full truncate font-mono text-fg-3">
                              {testCase.actualOutput || '(empty output)'}
                            </span>
                          </div>
                        ))
                      : null}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmEndOpen}
        title="End this mock test?"
        description={`You have ${formatTimer(
          timeLeft
        )} remaining and ${unansweredCount} ${
          unansweredCount === 1 ? 'question' : 'questions'
        } without a run. Ending now submits the latest run for every question and cannot be undone.`}
        confirmLabel="End and submit"
        tone="danger"
        busy={finalizing}
        onConfirm={() => handleFinalSubmit(false)}
        onCancel={() => setConfirmEndOpen(false)}
      />

      <Dialog
        open={showTimeUpDialog}
        title="Time is up"
        description={
          submitError
            ? submitError
            : 'Submitting the latest run for every question and calculating your score.'
        }
        dismissible={false}
        footer={
          submitError ? (
            <Button variant="primary" onClick={() => handleFinalSubmit(true)}>
              Retry submission
            </Button>
          ) : undefined
        }
      >
        {!submitError ? (
          <div className="flex items-center gap-3 text-sm text-fg-2">
            <Loader2 className="h-5 w-5 animate-spin text-mark-bright" aria-hidden />
            Submitting your answers…
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={testFinished}
        title="Test submitted"
        description={assessment.title}
        dismissible={false}
        footer={
          <Button variant="primary" onClick={() => router.push('/assessments')}>
            Back to mock tests
          </Button>
        }
      >
        <div className="text-center">
          <div className="stat-label">Final score</div>
          <div className="mt-1 text-5xl font-semibold tabular-nums tracking-[-0.03em] text-white">
            {finalScore ?? 0}
            <span className="text-xl font-normal text-fg-3"> / {assessment.totalMarks}</span>
          </div>

          <span className={cn('badge mt-4', finalPassed ? 'badge-easy' : 'badge-hard')}>
            {finalPassed ? 'Above the 60% cut-off' : 'Below the 60% cut-off'}
          </span>

          <p className="mt-4 text-[13px] leading-relaxed text-fg-3">
            Scores are taken from your latest run on each question. Your attempt is recorded in
            your profile.
          </p>
        </div>
      </Dialog>
    </div>
  );
}
