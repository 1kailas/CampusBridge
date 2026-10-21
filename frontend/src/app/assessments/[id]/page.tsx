'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Play,
  ShieldCheck,
  Trophy,
  XCircle,
} from 'lucide-react';
import { Badge, DifficultyBadge, EmptyState, LoadingState, buttonClass } from '@/components/ui';

import CodeEditor from '@/components/CodeEditor';

export default function AssessmentRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<any>(null);
  const [failed, setFailed] = useState(false);

  const [activeProbIndex, setActiveProbIndex] = useState(0);
  const [language, setLanguage] = useState<'python' | 'cpp' | 'java' | 'javascript'>('python');
  const [codes, setCodes] = useState<Record<string, string>>({});

  const [timeLeft, setTimeLeft] = useState<number>(45 * 60);
  const [testFinished, setTestFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);
  const [problemScores, setProblemScores] = useState<
    Record<string, { score: number; passed: number; total: number }>
  >({});
  const [mobileTab, setMobileTab] = useState<'problem' | 'code'>('problem');
  const [consoleOpen, setConsoleOpen] = useState(true);

  useEffect(() => {
    async function initAssessment() {
      try {
        setLoading(true);
        let u = api.getUser();
        if (!u) {
          const demo = await api.demoLogin();
          u = demo.user;
        }

        const data = await api.getAssessmentById(id);
        setAssessment(data);

        const startRes = await api.startAssessment(id);
        setAttempt(startRes);

        const elapsed = Math.floor(
          (Date.now() - new Date(startRes.startedAt).getTime()) / 1000
        );
        const total = data.durationMinutes * 60;
        setTimeLeft(Math.max(0, total - elapsed));

        const initialCodes: Record<string, string> = {};
        for (const p of data.problems) {
          initialCodes[p.id] = p.defaultTemplates?.python || '# Write code here\n';
        }
        setCodes(initialCodes);
      } catch (e) {
        console.error(e);
        setFailed(true);
      } finally {
        setLoading(false);
      }
    }
    if (id) initAssessment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0 && !testFinished) {
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, testFinished]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentProblem = assessment?.problems?.[activeProbIndex];
  const isUrgent = timeLeft < 300;

  const handleRunCurrentCode = async () => {
    if (!currentProblem) return;
    try {
      setRunning(true);
      const userCode = codes[currentProblem.id] || '';
      const res = await api.runCode(currentProblem.id, language, userCode);
      setRunResult(res);
      setConsoleOpen(true);

      const passed = res.passedTests;
      const total = res.totalTests;
      const points = currentProblem.points || 50;
      const earned = total > 0 ? Math.round((passed / total) * points) : 0;

      setProblemScores((prev) => ({
        ...prev,
        [currentProblem.id]: { score: earned, passed, total },
      }));
    } catch (e: any) {
      window.alert('Execution failed: ' + e.message);
    } finally {
      setRunning(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!attempt) return;
    try {
      setTestFinished(true);

      const scoresArray = assessment.problems.map((p: any) => {
        const item = problemScores[p.id] || { score: 0, passed: 0, total: 3 };
        return {
          problemId: p.id,
          score: item.score,
          passedCount: item.passed,
          totalCount: item.total,
        };
      });

      const totalEarned = scoresArray.reduce((acc: number, curr: any) => acc + curr.score, 0);
      setFinalScore(totalEarned);

      await api.submitAssessment(attempt.id, scoresArray);

      if (totalEarned >= assessment.totalMarks * 0.6) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      }
    } catch (e: any) {
      window.alert('Submit error: ' + e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex w-full flex-1 items-center justify-center bg-ink-900">
        <LoadingState label="Starting your mock test…" />
      </div>
    );
  }

  if (failed || !assessment || !currentProblem) {
    return (
      <div className="flex w-full flex-1 items-center justify-center bg-ink-900">
        <div className="shell py-16">
          <EmptyState
            icon={ShieldCheck}
            title="This mock test could not be opened"
            sub="The test may have been unpublished, or the API at http://localhost:4000 is not responding."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem-1px)] w-full flex-1 flex-col overflow-hidden bg-ink-900">
      {/* ------------------------------------------------------------- exam bar */}
      <div className="shrink-0 border-b border-line bg-ink-850">
        <div className="shell flex h-14 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex shrink-0 items-center gap-2 rounded-sm border border-hard/35 bg-hard/10 px-2 py-1 text-xs font-semibold text-hard">
              <span className="h-1.5 w-1.5 rounded-full bg-hard animate-slow-pulse" aria-hidden />
              Live
            </span>
            <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
            <h1 className="truncate text-sm font-semibold text-white">{assessment.title}</h1>
            <Badge className="hidden md:inline-flex">{assessment.company}</Badge>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <div
              className={cn(
                'flex h-9 items-center gap-2 rounded-md border px-3 font-mono text-sm font-semibold tabular-nums',
                isUrgent
                  ? 'border-hard/50 bg-hard/10 text-hard animate-slow-pulse'
                  : 'border-line-strong bg-ink-750 text-mark'
              )}
              role="timer"
              aria-label="Time remaining"
            >
              <Clock className="h-4 w-4" aria-hidden />
              {formatTimer(timeLeft)}
            </div>

            <button
              onClick={handleFinalSubmit}
              disabled={testFinished}
              className={buttonClass({ variant: 'danger', size: 'md' })}
            >
              {testFinished ? 'Submitted' : 'End test'}
            </button>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------- question / language */}
      <div className="shrink-0 border-b border-line bg-ink-900">
        <div className="shell flex h-12 items-center justify-between gap-4">
          <div className="seg min-w-0 overflow-x-auto">
            {assessment.problems.map((p: any, idx: number) => {
              const isCurrent = activeProbIndex === idx;
              const score = problemScores[p.id];
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProbIndex(idx);
                    setRunResult(null);
                  }}
                  aria-current={isCurrent ? 'true' : undefined}
                  className={cn('seg-btn shrink-0', isCurrent && 'seg-btn-on')}
                >
                  Q{idx + 1}
                  <span className="ml-1 text-fg-4">{p.points}p</span>
                  {score && (
                    <span
                      className={cn(
                        'ml-1.5 font-semibold tabular-nums',
                        score.score === p.points ? 'text-easy' : 'text-medium'
                      )}
                    >
                      {score.score}/{p.points}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <select
              aria-label="Language"
              value={language}
              onChange={(e) => {
                const newLang = e.target.value as any;
                setLanguage(newLang);
                if (currentProblem.defaultTemplates?.[newLang]) {
                  setCodes({
                    ...codes,
                    [currentProblem.id]: currentProblem.defaultTemplates[newLang],
                  });
                }
              }}
              className="select h-8 text-[13px]"
            >
              <option value="python">Python 3</option>
              <option value="cpp">C++ (GCC 16)</option>
              <option value="java">Java 25</option>
              <option value="javascript">JavaScript (Node 22)</option>
            </select>

            <button
              onClick={handleRunCurrentCode}
              disabled={running || testFinished}
              className={buttonClass({ variant: 'primary', size: 'sm' })}
            >
              <Play className={cn('h-3.5 w-3.5 fill-current', running && 'animate-slow-pulse')} aria-hidden />
              {running ? 'Running' : 'Run'}
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- mobile switcher */}
      <div className="shrink-0 border-b border-line bg-ink-900 lg:hidden">
        <div className="shell py-2">
          <div className="seg w-full">
            {(['problem', 'code'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMobileTab(tab)}
                aria-pressed={mobileTab === tab}
                className={cn('seg-btn flex-1', mobileTab === tab && 'seg-btn-on')}
              >
                {tab === 'problem' ? 'Question' : 'Editor & results'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------- body */}
      <div className="flex w-full flex-1 overflow-hidden">
        {/* Statement */}
        <div
          className={cn(
            'flex flex-col overflow-y-auto border-line bg-ink-850 p-5 sm:p-7 lg:w-[48%] lg:border-r',
            mobileTab === 'problem' ? 'flex w-full' : 'hidden'
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-medium tabular-nums text-fg-3">
              Question {activeProbIndex + 1} of {assessment.problems.length}
            </span>
            <span className="h-3 w-px bg-line" aria-hidden />
            <Badge tone="mark">{currentProblem.points} points</Badge>
            <DifficultyBadge difficulty={currentProblem.difficulty} />
          </div>

          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.022em] text-white">
            {currentProblem.title}
          </h2>

          <div className="mt-4 flex items-center gap-2">
            <span className="tag">{currentProblem.category}</span>
          </div>

          <div className="mt-5 whitespace-pre-line text-sm leading-relaxed text-fg-2">
            {currentProblem.description}
          </div>

          {currentProblem.examples && currentProblem.examples.length > 0 && (
            <section className="mt-7">
              <h3 className="text-sm font-semibold text-white">Examples</h3>
              <div className="mt-3 space-y-3">
                {currentProblem.examples.map((ex: any, idx: number) => (
                  <div key={idx} className="card p-4">
                    <div className="mb-2 text-xs font-medium text-fg-4">
                      Example {idx + 1}
                    </div>
                    <div className="space-y-1.5 font-mono text-[13px]">
                      <div className="text-fg-3">
                        <span className="text-fg-4">Input </span>
                        <span className="text-fg">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-fg-4">Output </span>
                        <span className="text-easy">{ex.output}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {currentProblem.constraints && (
            <section className="mt-7">
              <h3 className="text-sm font-semibold text-white">Constraints</h3>
              <ul className="mt-3 space-y-1.5">
                {currentProblem.constraints.map((c: string, idx: number) => (
                  <li
                    key={idx}
                    className="w-fit rounded-sm border border-line bg-ink-800 px-2.5 py-1 font-mono text-[13px] text-fg-2"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Editor + results */}
        <div
          className={cn(
            'flex flex-col bg-ink-950 lg:flex-1',
            mobileTab === 'code' ? 'flex w-full' : 'hidden'
          )}
        >
          <div className="min-h-0 flex-1 relative overflow-hidden">
            <CodeEditor
              language={language}
              value={codes[currentProblem.id] || ''}
              onChange={(val) => setCodes({ ...codes, [currentProblem.id]: val || '' })}
            />
          </div>

          {/* Result console */}
          <div
            className={cn(
              'flex shrink-0 flex-col border-t border-line bg-ink-850',
              consoleOpen ? 'h-56' : 'h-11'
            )}
          >
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-4">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-fg-2">Test suite</span>
                {problemScores[currentProblem.id] && (
                  <span className="text-[13px] font-semibold tabular-nums text-fg">
                    {problemScores[currentProblem.id].score} / {currentProblem.points} points
                  </span>
                )}
              </div>
              <button
                onClick={() => setConsoleOpen((v) => !v)}
                aria-label={consoleOpen ? 'Collapse results' : 'Expand results'}
                className="btn btn-ghost btn-sm px-2"
              >
                {consoleOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
            </div>

            {consoleOpen && (
              <div className="flex-1 overflow-y-auto p-4 text-[13px]">
                {!runResult ? (
                  <p className="py-6 text-center text-fg-4">
                    Run your code to check it against the sample cases.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div
                      className={cn(
                        'flex items-center gap-2 font-medium',
                        runResult.status === 'ACCEPTED' ? 'text-easy' : 'text-hard'
                      )}
                    >
                      {runResult.status === 'ACCEPTED' ? (
                        <CheckCircle2 className="h-4 w-4" aria-hidden />
                      ) : (
                        <XCircle className="h-4 w-4" aria-hidden />
                      )}
                      <span>
                        {runResult.status === 'ACCEPTED' ? 'All cases passed' : runResult.status}
                      </span>
                      <span className="font-normal tabular-nums text-fg-4">
                        {runResult.passedTests}/{runResult.totalTests} cases
                      </span>
                      <span className="font-normal tabular-nums text-fg-4">
                        {runResult.runtimeMs} ms
                      </span>
                    </div>

                    {runResult.testResults?.map((tc: any) => (
                      <div
                        key={tc.index}
                        className="flex items-center justify-between gap-3 rounded-md border border-line bg-ink-800 px-3 py-2"
                      >
                        <span className="text-fg-3">
                          Case {tc.index}:{' '}
                          <span className={tc.passed ? 'text-easy' : 'text-hard'}>
                            {tc.passed ? 'passed' : 'failed'}
                          </span>
                        </span>
                        <span className="truncate font-mono text-fg-4">{tc.actualOutput}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- result modal */}
      {testFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Assessment result"
            className="card w-full max-w-md overflow-hidden !rounded-xl shadow-pop"
          >
            <div className="flex items-center gap-3 border-b border-line px-6 py-5">
              <span className="grid h-10 w-10 place-items-center rounded-md border border-line bg-ink-750 text-mark">
                <Trophy className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white">Test submitted</h2>
                <p className="truncate text-[13px] text-fg-3">{assessment.title}</p>
              </div>
            </div>

            <div className="px-6 py-6 text-center">
              <div className="stat-label">Final score</div>
              <div className="mt-1 text-5xl font-semibold tabular-nums tracking-[-0.03em] text-white">
                {finalScore}
                <span className="text-xl font-normal text-fg-4"> / {assessment.totalMarks}</span>
              </div>

              <span
                className={cn(
                  'badge mt-4',
                  finalScore !== null && finalScore >= assessment.totalMarks * 0.6
                    ? 'badge-easy'
                    : 'badge-hard'
                )}
              >
                {finalScore !== null && finalScore >= assessment.totalMarks * 0.6
                  ? 'Passed the technical round'
                  : 'Below the cut-off'}
              </span>
            </div>

            <div className="border-t border-line p-4">
              <button
                onClick={() => router.push('/assessments')}
                className={buttonClass({ variant: 'primary', size: 'lg', block: true })}
              >
                Back to mock tests
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
