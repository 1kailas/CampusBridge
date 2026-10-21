'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardCopy,
  FileCode2,
  History,
  Lightbulb,
  Play,
  RotateCcw,
  Send,
  StickyNote,
  Terminal,
  XCircle,
} from 'lucide-react';
import {
  Badge,
  DifficultyBadge,
  EmptyState,
  LoadingState,
  buttonClass,
} from '@/components/ui';

import CodeEditor from '@/components/CodeEditor';

type LeftTab = 'description' | 'solution' | 'submissions' | 'notes';

const STATUS_TEXT: Record<string, string> = {
  ACCEPTED: 'Accepted',
  WRONG_ANSWER: 'Wrong answer',
  TIME_LIMIT_EXCEEDED: 'Time limit exceeded',
  COMPILATION_ERROR: 'Compile error',
  RUNTIME_ERROR: 'Runtime error',
};

export default function ProblemWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [problem, setProblem] = useState<any>(null);
  const [allProblems, setAllProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeLeftTab, setActiveLeftTab] = useState<LeftTab>('description');

  const [language, setLanguage] = useState<'python' | 'cpp' | 'java' | 'javascript'>('python');
  const [code, setCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  const [splitRatio, setSplitRatio] = useState<'50/50' | '40/60' | '60/40' | 'full'>('50/50');

  const [consoleOpen, setConsoleOpen] = useState(true);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'testcase' | 'result'>('testcase');
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [rawInputMode, setRawInputMode] = useState(false);
  const [mobileTab, setMobileTab] = useState<'problem' | 'code'>('problem');

  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);

  const [noteContent, setNoteContent] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [expandedHints, setExpandedHints] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function loadProblem() {
      try {
        setLoading(true);
        if (!api.getUser()) {
          try {
            await api.demoLogin();
          } catch (e) {
            // Backend might be warming up or offline
          }
        }
        const [data, problemsList] = await Promise.all([
          api.getProblemBySlug(slug),
          api.getProblems(),
        ]);

        setProblem(data);
        setAllProblems(problemsList || []);
        setNoteContent(data.userNote || '');

        const savedKey = `campusbridge_code_${slug}_python`;
        const localSaved = typeof window !== 'undefined' ? localStorage.getItem(savedKey) : null;

        if (localSaved) {
          setCode(localSaved);
        } else {
          const templates = data.defaultTemplates || {};
          setCode(templates.python || '# Write your solution here\n');
        }

        if (data.testCases && data.testCases.length > 0) {
          setCustomInput(data.testCases[0].input);
        }

        setLoading(false);
        api
          .getProblemSubmissions(data.id)
          .then((subs) => setSubmissionsList(subs || []))
          .catch(() => {});
      } catch (err) {
        console.error('Failed to load problem:', err);
        setLoading(false);
      }
    }
    if (slug) loadProblem();
  }, [slug]);

  const handleLanguageChange = (newLang: 'python' | 'cpp' | 'java' | 'javascript') => {
    setLanguage(newLang);
    const savedKey = `campusbridge_code_${slug}_${newLang}`;
    const localSaved = typeof window !== 'undefined' ? localStorage.getItem(savedKey) : null;

    if (localSaved) {
      setCode(localSaved);
    } else if (problem?.defaultTemplates?.[newLang]) {
      setCode(problem.defaultTemplates[newLang]);
    }
  };

  const handleCodeChange = (newCode: string | undefined) => {
    const val = newCode || '';
    setCode(val);
    if (typeof window !== 'undefined' && slug) {
      localStorage.setItem(`campusbridge_code_${slug}_${language}`, val);
    }
  };

  const handleResetCode = () => {
    if (!problem?.defaultTemplates?.[language]) return;
    if (window.confirm('Reset the editor to the starter template? Your current code will be lost.')) {
      setCode(problem.defaultTemplates[language]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`campusbridge_code_${slug}_${language}`);
      }
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRunCode = async () => {
    if (!problem) return;
    try {
      setRunning(true);
      setActiveConsoleTab('result');
      setConsoleOpen(true);

      const inputToSend = rawInputMode ? customInput.trim() : undefined;
      const res = await api.runCode(problem.id, language, code, inputToSend);
      setRunResult(res);
      setSubmissionResult(null);
      setSelectedCaseIndex(0);
    } catch (err: any) {
      window.alert('Execution failed: ' + (err.message || 'unknown error'));
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!problem) return;
    try {
      setSubmitting(true);
      setActiveConsoleTab('result');
      setConsoleOpen(true);

      const res = await api.submitCode(problem.id, language, code);
      setSubmissionResult(res);
      setRunResult(null);
      setSelectedCaseIndex(0);

      if (res.status === 'ACCEPTED') {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        setProblem((prev: any) => ({ ...prev, isSolved: true }));
      }

      const subs = await api.getProblemSubmissions(problem.id);
      setSubmissionsList(subs || []);
    } catch (err: any) {
      window.alert('Submission failed: ' + (err.message || 'unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNote = async () => {
    if (!problem) return;
    try {
      await api.saveProblemNote(problem.id, noteContent);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } catch {
      window.alert('Your note could not be saved. Check that the backend is running.');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmitCode();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "'") {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem, language, code, customInput]);

  const getMonacoLang = (lang: string) => {
    if (lang === 'cpp') return 'cpp';
    if (lang === 'python') return 'python';
    if (lang === 'java') return 'java';
    return 'javascript';
  };

  const currentIdx = allProblems.findIndex((p) => p.slug === slug);
  const prevProblem = currentIdx > 0 ? allProblems[currentIdx - 1] : null;
  const nextProblem =
    currentIdx >= 0 && currentIdx < allProblems.length - 1 ? allProblems[currentIdx + 1] : null;

  if (loading) {
    return (
      <div className="flex w-full flex-1 items-center justify-center bg-ink-900">
        <LoadingState label="Opening the workspace…" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex w-full flex-1 items-center justify-center bg-ink-900">
        <div className="shell py-16">
          <EmptyState
            icon={FileCode2}
            title="Problem not found"
            sub="This problem may have been removed, or the link is out of date."
            action={
              <Link href="/problems" className="btn btn-secondary btn-sm">
                Back to the problem set
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const currentResult = submissionResult || runResult;

  const leftWidthClass =
    splitRatio === 'full'
      ? 'hidden'
      : mobileTab === 'code'
        ? 'hidden lg:flex ' +
          (splitRatio === '40/60' ? 'lg:w-[40%]' : splitRatio === '60/40' ? 'lg:w-[60%]' : 'lg:w-1/2')
        : 'w-full ' +
          (splitRatio === '40/60' ? 'lg:w-[40%]' : splitRatio === '60/40' ? 'lg:w-[60%]' : 'lg:w-1/2');

  const rightWidthClass =
    splitRatio === 'full'
      ? 'w-full'
      : mobileTab === 'problem'
        ? 'hidden lg:flex ' +
          (splitRatio === '40/60' ? 'lg:w-[60%]' : splitRatio === '60/40' ? 'lg:w-[40%]' : 'lg:w-1/2')
        : 'w-full ' +
          (splitRatio === '40/60' ? 'lg:w-[60%]' : splitRatio === '60/40' ? 'lg:w-[40%]' : 'lg:w-1/2');

  const TABS: { key: LeftTab; label: string; icon: React.ElementType }[] = [
    { key: 'description', label: 'Description', icon: FileCode2 },
    { key: 'solution', label: 'Editorial', icon: BookOpen },
    { key: 'submissions', label: 'Submissions', icon: History },
    { key: 'notes', label: 'Notes', icon: StickyNote },
  ];

  const tabClass = (active: boolean) =>
    cn(
      'relative flex h-10 shrink-0 items-center gap-1.5 px-3 text-[13px] font-medium transition-colors duration-150 after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:rounded-full after:bg-mark after:transition-opacity',
      active ? 'text-white after:opacity-100' : 'text-fg-3 after:opacity-0 hover:text-fg'
    );

  return (
    <div className="flex h-[calc(100vh-3.5rem-1px)] w-full flex-1 flex-col overflow-hidden bg-ink-900">
      {/* -------------------------------------------------------- workspace bar */}
      <div className="shrink-0 border-b border-line bg-ink-850">
        <div className="shell flex h-12 items-center justify-between gap-3">
          {/* left */}
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href="/problems"
              className="flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-fg-3 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">Problem set</span>
            </Link>

            <div className="flex shrink-0 items-center border-l border-r border-line px-1">
              <button
                onClick={() => prevProblem && router.push(`/problems/${prevProblem.slug}`)}
                disabled={!prevProblem}
                title={prevProblem ? `Previous: ${prevProblem.title}` : 'No previous problem'}
                className="rounded-sm p-1 text-fg-3 transition-colors hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <button
                onClick={() => nextProblem && router.push(`/problems/${nextProblem.slug}`)}
                disabled={!nextProblem}
                title={nextProblem ? `Next: ${nextProblem.title}` : 'No next problem'}
                className="rounded-sm p-1 text-fg-3 transition-colors hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <h1 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white">
              <span className="truncate">{problem.title}</span>
              {problem.isSolved && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-easy" aria-label="Solved" />
              )}
            </h1>

            <span className="hidden shrink-0 sm:block">
              <DifficultyBadge difficulty={problem.difficulty} />
            </span>
          </div>

          {/* split ratio — desktop */}
          <div className="seg hidden shrink-0 lg:flex">
            {(['50/50', '40/60', '60/40'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSplitRatio(r)}
                aria-pressed={splitRatio === r}
                className={cn('seg-btn', splitRatio === r && 'seg-btn-on')}
              >
                {r.replace('/', ':')}
              </button>
            ))}
            <button
              onClick={() => setSplitRatio(splitRatio === 'full' ? '50/50' : 'full')}
              aria-pressed={splitRatio === 'full'}
              className={cn('seg-btn', splitRatio === 'full' && 'seg-btn-on')}
            >
              {splitRatio === 'full' ? 'Split' : 'Full'}
            </button>
          </div>

          {/* mobile pane switch */}
          <div className="seg shrink-0 lg:hidden">
            <button
              onClick={() => setMobileTab('problem')}
              aria-pressed={mobileTab === 'problem'}
              className={cn('seg-btn', mobileTab === 'problem' && 'seg-btn-on')}
            >
              Problem
            </button>
            <button
              onClick={() => setMobileTab('code')}
              aria-pressed={mobileTab === 'code'}
              className={cn('seg-btn', mobileTab === 'code' && 'seg-btn-on')}
            >
              Editor
            </button>
          </div>

          {/* right actions */}
          <div className="flex shrink-0 items-center gap-1.5">
            <select
              aria-label="Language"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as any)}
              className="select h-8 w-[112px] text-[13px] sm:w-auto"
            >
              <option value="python">Python 3</option>
              <option value="cpp">C++ 17</option>
              <option value="java">Java 25</option>
              <option value="javascript">JavaScript</option>
            </select>

            <button
              onClick={handleCopyCode}
              title="Copy code"
              aria-label="Copy code"
              className="btn btn-sm btn-secondary hidden w-8 px-0 sm:inline-flex"
            >
              {copiedCode ? (
                <Check className="h-3.5 w-3.5 text-easy" aria-hidden />
              ) : (
                <ClipboardCopy className="h-3.5 w-3.5" aria-hidden />
              )}
            </button>

            <button
              onClick={handleResetCode}
              title="Reset to starter template"
              aria-label="Reset to starter template"
              className="btn btn-sm btn-secondary hidden w-8 px-0 sm:inline-flex"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            </button>

            <button
              onClick={handleRunCode}
              disabled={running || submitting}
              className={buttonClass({ variant: 'secondary', size: 'sm' })}
            >
              <Play
                className={cn('h-3.5 w-3.5 fill-current', running && 'animate-slow-pulse text-mark')}
                aria-hidden
              />
              <span className="hidden sm:inline">{running ? 'Running' : 'Run'}</span>
            </button>

            <button
              onClick={handleSubmitCode}
              disabled={running || submitting}
              className={buttonClass({ variant: 'primary', size: 'sm' })}
            >
              <Send className="h-3.5 w-3.5" aria-hidden />
              {submitting ? 'Testing' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------- body */}
      <div className="flex w-full flex-1 overflow-hidden">
        {/* Left: statement */}
        <div className={cn('flex-col border-line bg-ink-850 lg:flex lg:border-r', leftWidthClass)}>
          <div className="flex h-10 shrink-0 items-center overflow-x-auto border-b border-line bg-ink-850 px-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = activeLeftTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveLeftTab(t.key)}
                  aria-current={active ? 'page' : undefined}
                  className={tabClass(active)}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {t.label}
                  {t.key === 'submissions' && submissionsList.length > 0 && (
                    <span className="ml-0.5 rounded-sm bg-ink-700 px-1 text-2xs tabular-nums text-fg-3">
                      {submissionsList.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-5 text-sm leading-relaxed sm:p-6 lg:p-7">
            {activeLeftTab === 'description' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-[-0.022em] text-white">
                    {problem.title}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <DifficultyBadge difficulty={problem.difficulty} />
                    <Badge>{problem.category}</Badge>
                    <span className="text-[13px] tabular-nums text-fg-4">
                      {problem.acceptanceRate}% acceptance
                    </span>
                  </div>
                </div>

                {problem.companyTags?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-ink-800 px-3.5 py-3">
                    <span className="flex items-center gap-1.5 text-[13px] text-fg-3">
                      <Building2 className="h-3.5 w-3.5" aria-hidden />
                      Asked in
                    </span>
                    {problem.companyTags.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-sm border border-line-strong bg-ink-750 px-2 py-0.5 text-[13px] font-medium text-fg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="whitespace-pre-line text-sm leading-relaxed text-fg-2">
                  {problem.description}
                </div>

                {Array.isArray(problem.examples) && problem.examples.length > 0 && (
                  <section>
                    <h3 className="text-sm font-semibold text-white">Examples</h3>
                    <div className="mt-3 space-y-3">
                      {problem.examples.map((ex: any, idx: number) => (
                        <div key={idx} className="card p-4">
                          <div className="mb-2 text-xs font-medium text-fg-4">
                            Example {idx + 1}
                          </div>
                          <div className="space-y-1.5 font-mono text-[13px]">
                            <div>
                              <span className="text-fg-4">Input </span>
                              <span className="text-fg">{ex.input}</span>
                            </div>
                            <div>
                              <span className="text-fg-4">Output </span>
                              <span className="text-easy">{ex.output}</span>
                            </div>
                            {ex.explanation && (
                              <p className="border-t border-line-soft pt-2 font-sans text-[13px] leading-relaxed text-fg-3">
                                {ex.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {Array.isArray(problem.constraints) && problem.constraints.length > 0 && (
                  <section>
                    <h3 className="text-sm font-semibold text-white">Constraints</h3>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {problem.constraints.map((c: string, idx: number) => (
                        <li
                          key={idx}
                          className="rounded-sm border border-line bg-ink-800 px-2.5 py-1 font-mono text-[13px] text-fg-2"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {(() => {
                  const hintsList = Array.isArray(problem.hints)
                    ? problem.hints
                    : typeof problem.hints === 'string'
                    ? (() => {
                        try {
                          const p = JSON.parse(problem.hints);
                          return Array.isArray(p) ? p : [problem.hints];
                        } catch {
                          return problem.hints ? [problem.hints] : [];
                        }
                      })()
                    : [];

                  if (!hintsList.length) return null;

                  return (
                    <section className="border-t border-line pt-5">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                        <Lightbulb className="h-4 w-4 text-mark" aria-hidden />
                        Hints
                      </h3>
                      <div className="mt-3 space-y-2">
                        {hintsList.map((hint: string, idx: number) => {
                          const isOpen = expandedHints[idx];
                          return (
                            <div key={idx} className="card overflow-hidden">
                              <button
                                onClick={() => setExpandedHints({ ...expandedHints, [idx]: !isOpen })}
                                aria-expanded={isOpen}
                                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[13px] font-medium text-fg-2 transition-colors hover:text-white"
                              >
                                <span>Hint {idx + 1}</span>
                                {isOpen ? (
                                  <ChevronUp className="h-3.5 w-3.5 text-fg-4" aria-hidden />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5 text-fg-4" aria-hidden />
                                )}
                              </button>
                              {isOpen && (
                                <p className="border-t border-line-soft px-4 py-3 text-[13px] leading-relaxed text-fg-3">
                                  {hint}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })()}
              </div>
            )}

            {activeLeftTab === 'solution' && (
              <div>
                <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                  <h2 className="text-lg font-semibold text-white">Editorial</h2>
                  <Badge tone="mark">Official solution</Badge>
                </div>
                {problem.solution ? (
                  <div className="mt-4 whitespace-pre-line rounded-lg border border-line bg-ink-800 p-5 text-sm leading-relaxed text-fg-2">
                    {problem.solution}
                  </div>
                ) : (
                  <EmptyState
                    icon={BookOpen}
                    title="No editorial published yet"
                    sub="The editorial for this problem has not been written. Try the hints on the description tab."
                  />
                )}
              </div>
            )}

            {activeLeftTab === 'submissions' && (
              <div>
                <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                  <h2 className="text-lg font-semibold text-white">Your submissions</h2>
                  <span className="text-[13px] tabular-nums text-fg-3">
                    {submissionsList.length}
                  </span>
                </div>

                {submissionsList.length === 0 ? (
                  <EmptyState
                    icon={History}
                    title="Nothing submitted yet"
                    sub="Run your code against the sample cases, then submit it to record a verdict here."
                  />
                ) : (
                  <ul className="mt-4 space-y-2">
                    {submissionsList.map((sub: any) => {
                      const accepted = sub.status === 'ACCEPTED';
                      return (
                        <li
                          key={sub.id}
                          className="card flex items-center justify-between gap-4 p-3.5"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            {accepted ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-easy" aria-hidden />
                            ) : (
                              <XCircle className="h-4 w-4 shrink-0 text-hard" aria-hidden />
                            )}
                            <div className="min-w-0">
                              <div
                                className={cn(
                                  'text-sm font-semibold',
                                  accepted ? 'text-easy' : 'text-hard'
                                )}
                              >
                                {accepted ? 'Accepted' : STATUS_TEXT[sub.status] || sub.status}
                              </div>
                              <div className="text-xs tabular-nums text-fg-4">
                                {new Date(sub.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-4 text-right">
                            <span className="rounded-sm border border-line bg-ink-750 px-1.5 py-0.5 text-xs capitalize text-fg-3">
                              {sub.language}
                            </span>
                            <span className="text-sm font-semibold tabular-nums text-fg">
                              {sub.runtimeMs || 0} ms
                            </span>
                            <span className="w-20 text-xs tabular-nums text-fg-4">
                              {sub.passedTests}/{sub.totalTests} passed
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {activeLeftTab === 'notes' && (
              <div>
                <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                  <h2 className="text-lg font-semibold text-white">Your notes</h2>
                  <button
                    onClick={handleSaveNote}
                    className={buttonClass({ variant: noteSaved ? 'secondary' : 'primary', size: 'sm' })}
                  >
                    {noteSaved && <Check className="h-3.5 w-3.5 text-easy" aria-hidden />}
                    {noteSaved ? 'Saved' : 'Save note'}
                  </button>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-fg-3">
                  Write down the edge cases and the complexity you want to remember before an
                  interview.
                </p>

                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Negative numbers break the sort. O(n) time, O(1) space…"
                  aria-label="Notes for this problem"
                  className="textarea mt-3 h-72 font-mono text-[13px]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: editor + console */}
        <div className={cn('flex flex-col bg-ink-950', rightWidthClass)}>
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <CodeEditor
              language={language}
              value={code}
              onChange={handleCodeChange}
            />
          </div>

          {/* Console drawer */}
          <div
            className={cn(
              'flex shrink-0 flex-col border-t border-line bg-ink-850 transition-[height] duration-200',
              consoleOpen ? 'h-64' : 'h-11'
            )}
          >
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-3">
              <div className="flex items-center">
                <button
                  onClick={() => {
                    setActiveConsoleTab('testcase');
                    setConsoleOpen(true);
                  }}
                  aria-current={activeConsoleTab === 'testcase' && consoleOpen ? 'page' : undefined}
                  className={tabClass(activeConsoleTab === 'testcase' && consoleOpen)}
                >
                  <Terminal className="h-3.5 w-3.5" aria-hidden />
                  Test cases
                </button>

                <button
                  onClick={() => {
                    setActiveConsoleTab('result');
                    setConsoleOpen(true);
                  }}
                  aria-current={activeConsoleTab === 'result' && consoleOpen ? 'page' : undefined}
                  className={tabClass(activeConsoleTab === 'result' && consoleOpen)}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  Results
                  {currentResult && (
                    <span
                      className={cn(
                        'ml-1 h-1.5 w-1.5 rounded-full',
                        currentResult.status === 'ACCEPTED' ? 'bg-easy' : 'bg-hard'
                      )}
                      aria-hidden
                    />
                  )}
                </button>
              </div>

              <button
                onClick={() => setConsoleOpen((v) => !v)}
                aria-label={consoleOpen ? 'Collapse console' : 'Expand console'}
                className="btn btn-ghost btn-sm px-2"
              >
                {consoleOpen ? (
                  <ChevronDown className="h-4 w-4" aria-hidden />
                ) : (
                  <ChevronUp className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>

            {consoleOpen && (
              <div className="flex-1 overflow-y-auto p-4 text-[13px]">
                {activeConsoleTab === 'testcase' && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="seg">
                        {problem.testCases?.map((tc: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedCaseIndex(idx);
                              setCustomInput(tc.input);
                            }}
                            aria-pressed={selectedCaseIndex === idx}
                            className={cn(
                              'seg-btn',
                              selectedCaseIndex === idx && 'seg-btn-on',
                              tc.isHidden && 'text-mark'
                            )}
                          >
                            Case {idx + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setRawInputMode((v) => !v)}
                        className="text-[13px] text-fg-3 underline underline-offset-2 transition-colors hover:text-white"
                      >
                        {rawInputMode ? 'Use formatted view' : 'Edit raw input'}
                      </button>
                    </div>

                    {!rawInputMode ? (
                      <div className="space-y-2">
                        {customInput
                          .split('\n')
                          .filter((l) => l.trim().length > 0)
                          .map((line, idx) => (
                            <div key={idx} className="space-y-1">
                              <span className="block text-xs text-fg-4">
                                parameter {idx + 1}
                              </span>
                              <div className="code-well !py-2">{line}</div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div>
                        <label className="label" htmlFor="raw-input">
                          Raw standard input
                        </label>
                        <textarea
                          id="raw-input"
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          className="textarea h-24 font-mono text-[13px]"
                        />
                      </div>
                    )}
                  </div>
                )}

                {activeConsoleTab === 'result' && (
                  <div>
                    {!currentResult ? (
                      <p className="py-8 text-center text-fg-4">
                        Run your code to check the samples, then submit for the full hidden suite.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                          <div
                            className={cn(
                              'flex items-center gap-2 text-base font-semibold',
                              currentResult.status === 'ACCEPTED' ? 'text-easy' : 'text-hard'
                            )}
                          >
                            {currentResult.status === 'ACCEPTED' ? (
                              <CheckCircle2 className="h-5 w-5" aria-hidden />
                            ) : (
                              <XCircle className="h-5 w-5" aria-hidden />
                            )}
                            {STATUS_TEXT[currentResult.status] || currentResult.status}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="rounded-md border border-line bg-ink-750 px-2.5 py-1 text-[13px] text-fg-2">
                              Runtime{' '}
                              <strong className="font-semibold tabular-nums text-white">
                                {currentResult.runtimeMs || 0} ms
                              </strong>
                            </span>
                            <span className="rounded-md border border-line bg-ink-750 px-2.5 py-1 text-[13px] text-fg-2">
                              Passed{' '}
                              <strong className="font-semibold tabular-nums text-white">
                                {currentResult.passedTests}/{currentResult.totalTests}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {currentResult.compileError && (
                          <pre className="whitespace-pre-wrap rounded-lg border border-hard/30 bg-hard/10 p-3 font-mono text-[13px] leading-relaxed text-hard">
                            {currentResult.compileError}
                          </pre>
                        )}

                        {currentResult.testResults?.length > 0 && (
                          <div className="space-y-3">
                            <div className="seg flex-wrap">
                              {currentResult.testResults.map((tc: any) => (
                                <button
                                  key={tc.index}
                                  onClick={() => setSelectedCaseIndex(tc.index - 1)}
                                  aria-pressed={selectedCaseIndex === tc.index - 1}
                                  className={cn(
                                    'seg-btn',
                                    selectedCaseIndex === tc.index - 1 && 'seg-btn-on'
                                  )}
                                >
                                  <span
                                    className={cn(
                                      'mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle',
                                      tc.passed ? 'bg-easy' : 'bg-hard'
                                    )}
                                    aria-hidden
                                  />
                                  Case {tc.index}
                                </button>
                              ))}
                            </div>

                            {(() => {
                              const activeCase =
                                currentResult.testResults[
                                  Math.min(
                                    Math.max(0, selectedCaseIndex),
                                    currentResult.testResults.length - 1
                                  )
                                ];
                              if (!activeCase) return null;
                              return (
                                <div className="card space-y-3 p-3.5">
                                  <div>
                                    <span className="mb-1 block text-xs text-fg-4">Input</span>
                                    <div className="code-well !py-2">
                                      {activeCase.input}
                                    </div>
                                  </div>

                                  <div>
                                    <span className="mb-1 block text-xs text-fg-4">Your output</span>
                                    <div className="code-well !py-2">
                                      {activeCase.actualOutput || '(empty)'}
                                    </div>
                                  </div>

                                  {activeCase.expectedOutput && (
                                    <div>
                                      <span className="mb-1 block text-xs text-fg-4">Expected</span>
                                      <div className="code-well !py-2 !text-easy">
                                        {activeCase.expectedOutput}
                                      </div>
                                    </div>
                                  )}

                                  {activeCase.stderr && (
                                    <div>
                                      <span className="mb-1 block text-xs text-hard">
                                        Standard error
                                      </span>
                                      <pre className="whitespace-pre-wrap rounded-lg border border-hard/30 bg-hard/10 p-2.5 font-mono text-[13px] text-hard">
                                        {activeCase.stderr}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
