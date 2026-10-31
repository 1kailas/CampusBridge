'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
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
  Loader2,
  Play,
  RotateCcw,
  Send,
  StickyNote,
  Terminal,
  TriangleAlert,
  XCircle,
} from 'lucide-react';
import {
  Badge,
  Button,
  ConfirmDialog,
  DifficultyBadge,
  EmptyState,
  Notice,
  Tag,
  buttonClass,
} from '@/components/ui';
import AuthRequired from '@/components/AuthRequired';
import Markdown from '@/components/Markdown';
import CodeEditor from '@/components/CodeEditor';

type LeftTab = 'description' | 'solution' | 'submissions' | 'notes';
type Language = 'python' | 'cpp' | 'java' | 'javascript';
type PaneTab = 'problem' | 'code';

const STATUS_TEXT: Record<string, string> = {
  ACCEPTED: 'Accepted',
  WRONG_ANSWER: 'Wrong answer',
  TIME_LIMIT_EXCEEDED: 'Time limit exceeded',
  COMPILATION_ERROR: 'Compile error',
  RUNTIME_ERROR: 'Runtime error',
};

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'python', label: 'Python 3' },
  { value: 'cpp', label: 'C++ 17' },
  { value: 'java', label: 'Java 17' },
  { value: 'javascript', label: 'JavaScript' },
];

const LEFT_TABS: { key: LeftTab; label: string; icon: React.ElementType }[] = [
  { key: 'description', label: 'Description', icon: FileCode2 },
  { key: 'solution', label: 'Editorial', icon: BookOpen },
  { key: 'submissions', label: 'Submissions', icon: History },
  { key: 'notes', label: 'Notes', icon: StickyNote },
];

function parseHints(raw: any): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [raw];
    } catch {
      return [raw];
    }
  }
  return [];
}

export default function ProblemWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [problem, setProblem] = useState<any>(null);
  const [allProblems, setAllProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);
  const [failed, setFailed] = useState(false);

  const [activeLeftTab, setActiveLeftTab] = useState<LeftTab>('description');
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [splitRatio, setSplitRatio] = useState<'50/50' | '40/60' | '60/40' | 'full'>('50/50');
  const [mobileTab, setMobileTab] = useState<PaneTab>('problem');

  const [consoleOpen, setConsoleOpen] = useState(true);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'testcase' | 'result'>('testcase');
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [rawInputMode, setRawInputMode] = useState(false);

  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [runResult, setRunResult] = useState<any>(null);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);

  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteNotice, setNoteNotice] = useState('');
  const [noteError, setNoteError] = useState('');
  const [expandedHints, setExpandedHints] = useState<Record<number, boolean>>({});
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  useEffect(() => {
    async function loadProblem() {
      if (!api.getUser()) {
        setSignedOut(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setFailed(false);

        const [data, problemsList] = await Promise.all([
          api.getProblemBySlug(slug),
          api.getProblems(),
        ]);

        setProblem(data);
        setAllProblems(problemsList || []);
        setNoteContent(data.userNote || '');

        const savedKey = `campusbridge_code_${slug}_python`;
        const localSaved = localStorage.getItem(savedKey);
        setCode(localSaved ?? data.defaultTemplates?.python ?? '');

        if (Array.isArray(data.testCases) && data.testCases.length > 0) {
          setCustomInput(data.testCases[0].input || '');
        }

        api
          .getProblemSubmissions(data.id)
          .then((submissions) => setSubmissionsList(submissions || []))
          .catch(() => {});
      } catch (error) {
        console.error('Failed to load problem:', error);
        setFailed(true);
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadProblem();
  }, [slug]);

  const handleLanguageChange = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    setActionError('');

    const savedKey = `campusbridge_code_${slug}_${nextLanguage}`;
    const localSaved = localStorage.getItem(savedKey);

    setCode(localSaved ?? problem?.defaultTemplates?.[nextLanguage] ?? '');
  };

  const handleCodeChange = (nextCode: string | undefined) => {
    const value = nextCode || '';
    setCode(value);
    if (slug) {
      localStorage.setItem(`campusbridge_code_${slug}_${language}`, value);
    }
  };

  const resetCode = () => {
    if (!problem?.defaultTemplates?.[language]) return;
    setCode(problem.defaultTemplates[language]);
    localStorage.removeItem(`campusbridge_code_${slug}_${language}`);
    setConfirmResetOpen(false);
    setActionError('');
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setActionError('Your browser blocked clipboard access. Select the code and copy it manually.');
      setActiveConsoleTab('result');
      setConsoleOpen(true);
    }
  };

  const handleRunCode = async () => {
    if (!problem) return;

    setRunning(true);
    setActionError('');
    setRunResult(null);
    setSubmissionResult(null);
    setActiveConsoleTab('result');
    setConsoleOpen(true);

    try {
      const inputToSend = rawInputMode ? customInput.trim() : undefined;
      const result = await api.runCode(problem.id, language, code, inputToSend);
      setRunResult(result);
      setSelectedCaseIndex(0);
    } catch (error: any) {
      setActionError(
        error?.message ||
          'Code execution failed. Check that the judging service is running, then try again.'
      );
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!problem) return;

    setSubmitting(true);
    setActionError('');
    setRunResult(null);
    setSubmissionResult(null);
    setActiveConsoleTab('result');
    setConsoleOpen(true);

    try {
      const result = await api.submitCode(problem.id, language, code);
      setSubmissionResult(result);
      setSelectedCaseIndex(0);

      if (result.status === 'ACCEPTED') {
        setProblem((previous: any) => ({ ...previous, isSolved: true }));
        try {
          const confetti = (await import('canvas-confetti')).default;
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }

      const submissions = await api.getProblemSubmissions(problem.id);
      setSubmissionsList(submissions || []);
    } catch (error: any) {
      setActionError(
        error?.message ||
          'Submission failed. Check your connection, then submit again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNote = async () => {
    if (!problem) return;

    setSavingNote(true);
    setNoteNotice('');
    setNoteError('');

    try {
      await api.saveProblemNote(problem.id, noteContent);
      setNoteNotice('Note saved to your account.');
    } catch {
      setNoteError('Your note could not be saved. Check that the backend is running, then retry.');
    } finally {
      setSavingNote(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        handleSubmitCode();
      } else if ((event.metaKey || event.ctrlKey) && event.key === "'") {
        event.preventDefault();
        handleRunCode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem, language, code, customInput, rawInputMode]);

  const currentIdx = allProblems.findIndex((entry) => entry.slug === slug);
  const prevProblem = currentIdx > 0 ? allProblems[currentIdx - 1] : null;
  const nextProblem =
    currentIdx >= 0 && currentIdx < allProblems.length - 1 ? allProblems[currentIdx + 1] : null;

  if (signedOut) {
    return (
      <AuthRequired
        title="Sign in to open the coding workspace"
        description="Run code, submit solutions, and keep notes against your own account."
      />
    );
  }

  if (loading) {
    return (
      <div className="flex w-full flex-1 items-center justify-center bg-ink-900">
        <div className="empty" role="status">
          <span className="spinner spinner-lg" aria-hidden />
          <p className="empty-sub">Opening the workspace…</p>
        </div>
      </div>
    );
  }

  if (failed || !problem) {
    return (
      <div className="w-full flex-1">
        <div className="shell page">
          <div className="card">
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
      </div>
    );
  }

  const currentResult = submissionResult || runResult;
  const resultKind = submissionResult ? 'Submission result' : 'Sample run';
  const hints = parseHints(problem.hints);
  const testCases: any[] = Array.isArray(problem.testCases) ? problem.testCases : [];

  const leftWidth =
    splitRatio === '40/60'
      ? 'lg:w-[40%]'
      : splitRatio === '60/40'
        ? 'lg:w-[60%]'
        : 'lg:w-1/2';

  const rightWidth =
    splitRatio === '40/60'
      ? 'lg:w-[60%]'
      : splitRatio === '60/40'
        ? 'lg:w-[40%]'
        : 'lg:w-1/2';

  const leftClass = cn(
    'flex flex-col border-line bg-ink-850 lg:border-r',
    mobileTab === 'problem' ? 'w-full' : 'hidden lg:flex',
    splitRatio === 'full' ? 'lg:hidden' : leftWidth
  );

  const rightClass = cn(
    'flex flex-col bg-ink-950',
    mobileTab === 'code' ? 'w-full' : 'hidden lg:flex',
    splitRatio === 'full' ? 'lg:w-full' : rightWidth
  );

  const moveLeftTab = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();

    const current = LEFT_TABS.findIndex((tab) => tab.key === activeLeftTab);
    let next = current;
    if (event.key === 'ArrowLeft') next = Math.max(0, current - 1);
    if (event.key === 'ArrowRight') next = Math.min(LEFT_TABS.length - 1, current + 1);
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = LEFT_TABS.length - 1;

    setActiveLeftTab(LEFT_TABS[next].key);
    window.requestAnimationFrame(() => {
      document.getElementById(`left-tab-${LEFT_TABS[next].key}`)?.focus();
    });
  };

  return (
    <div className="flex h-[calc(100dvh-4rem-1px)] w-full flex-col overflow-hidden bg-ink-900">
      {/* -------------------------------------------------------- workspace bar */}
      <div className="shrink-0 border-b border-line bg-ink-850">
        <div className="shell flex h-12 items-center justify-between gap-2 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href="/problems"
              aria-label="Back to the problem set"
              className="flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-fg-3 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">Problem set</span>
            </Link>

            <div className="hidden shrink-0 items-center border-l border-r border-line px-1 lg:flex">
              <button
                type="button"
                onClick={() => prevProblem && router.push(`/problems/${prevProblem.slug}`)}
                disabled={!prevProblem}
                aria-label={
                  prevProblem ? `Previous problem: ${prevProblem.title}` : 'No previous problem'
                }
                className="rounded p-1 text-fg-3 transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => nextProblem && router.push(`/problems/${nextProblem.slug}`)}
                disabled={!nextProblem}
                aria-label={nextProblem ? `Next problem: ${nextProblem.title}` : 'No next problem'}
                className="rounded p-1 text-fg-3 transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <h1 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white">
              <span className="truncate">{problem.title}</span>
              {problem.isSolved ? (
                <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-easy">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  <span className="sr-only">Solved</span>
                </span>
              ) : null}
            </h1>

            <span className="hidden shrink-0 sm:block">
              <DifficultyBadge difficulty={problem.difficulty} />
            </span>
          </div>

          <div className="seg hidden shrink-0 lg:flex" aria-label="Pane width">
            {(['50/50', '40/60', '60/40'] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => setSplitRatio(ratio)}
                aria-pressed={splitRatio === ratio}
                className={cn('seg-btn', splitRatio === ratio && 'seg-btn-on')}
              >
                {ratio.replace('/', ':')}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSplitRatio(splitRatio === 'full' ? '50/50' : 'full')}
              aria-pressed={splitRatio === 'full'}
              className={cn('seg-btn', splitRatio === 'full' && 'seg-btn-on')}
            >
              {splitRatio === 'full' ? 'Split' : 'Full'}
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <label className="sr-only" htmlFor="workspace-language">
              Language
            </label>
            <select
              id="workspace-language"
              value={language}
              onChange={(event) => handleLanguageChange(event.target.value as Language)}
              className="select h-8 w-[104px] text-[13px] sm:w-auto"
            >
              {LANGUAGES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleCopyCode}
              aria-label="Copy code"
              className="btn btn-sm btn-secondary hidden w-8 px-0 lg:inline-flex"
            >
              {copiedCode ? (
                <Check className="h-3.5 w-3.5 text-easy" aria-hidden />
              ) : (
                <ClipboardCopy className="h-3.5 w-3.5" aria-hidden />
              )}
            </button>

            <button
              type="button"
              onClick={() => setConfirmResetOpen(true)}
              disabled={!problem.defaultTemplates?.[language]}
              aria-label="Reset to the starter template"
              className="btn btn-sm btn-secondary hidden w-8 px-0 lg:inline-flex"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            </button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleRunCode}
              disabled={running || submitting}
              aria-label="Run sample tests"
            >
              {running ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Play className="h-3.5 w-3.5" aria-hidden />
              )}
              <span className="hidden sm:inline">{running ? 'Running' : 'Run'}</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitCode}
              disabled={running || submitting}
              aria-label="Submit solution"
            >
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Send className="h-3.5 w-3.5" aria-hidden />
              )}
              <span className="hidden sm:inline">{submitting ? 'Judging' : 'Submit'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* mobile pane switch */}
      <div className="shrink-0 border-b border-line bg-ink-850 lg:hidden">
        <div className="shell flex h-10 items-center justify-between gap-3">
          <div role="tablist" aria-label="Workspace panes" className="seg">
            <button
              id="workspace-statement-tab"
              role="tab"
              aria-selected={mobileTab === 'problem'}
              aria-controls="workspace-statement"
              onClick={() => setMobileTab('problem')}
              className={cn('seg-btn', mobileTab === 'problem' && 'seg-btn-on')}
            >
              Problem
            </button>
            <button
              id="workspace-editor-tab"
              role="tab"
              aria-selected={mobileTab === 'code'}
              aria-controls="workspace-editor"
              onClick={() => setMobileTab('code')}
              className={cn('seg-btn', mobileTab === 'code' && 'seg-btn-on')}
            >
              Editor
            </button>
          </div>
          <span className="truncate text-xs text-fg-3">{problem.category}</span>
        </div>
      </div>

      {/* --------------------------------------------------------------- body */}
      <div className="flex w-full flex-1 overflow-hidden">
        {/* Left: statement */}
        <div
          id="workspace-statement"
          role="tabpanel"
          aria-labelledby={`left-tab-${activeLeftTab}`}
          className={leftClass}
        >
          <div
            role="tablist"
            aria-label="Problem details"
            onKeyDown={moveLeftTab}
            className="flex h-10 shrink-0 items-center overflow-x-auto border-b border-line bg-ink-850 px-1 scrollbar-none"
          >
            {LEFT_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeLeftTab === tab.key;

              return (
                <button
                  key={tab.key}
                  id={`left-tab-${tab.key}`}
                  role="tab"
                  aria-selected={active}
                  aria-controls="left-tab-panel"
                  tabIndex={active ? 0 : -1}
                  onClick={() => setActiveLeftTab(tab.key)}
                  className={cn(
                    'relative flex h-10 shrink-0 items-center gap-1.5 px-3 text-[13px] font-medium transition-colors after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:rounded-full after:bg-mark-bright',
                    active
                      ? 'text-white after:opacity-100'
                      : 'text-fg-3 after:opacity-0 hover:text-fg'
                  )}
                >
                  <Icon className="hidden h-3.5 w-3.5 sm:block" aria-hidden />
                  {tab.label}
                  {tab.key === 'submissions' && submissionsList.length > 0 ? (
                    <span className="ml-0.5 rounded bg-ink-700 px-1 text-2xs tabular-nums text-fg-2">
                      {submissionsList.length}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div
            id="left-tab-panel"
            role="tabpanel"
            aria-labelledby={`left-tab-${activeLeftTab}`}
            className="flex-1 space-y-6 overflow-y-auto p-5 text-sm leading-relaxed sm:p-6 lg:p-7"
          >
            {activeLeftTab === 'description' ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-[-0.022em] text-white">
                    {problem.title}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <DifficultyBadge difficulty={problem.difficulty} />
                    <Badge>{problem.category}</Badge>
                    {problem.acceptanceRate != null ? (
                      <span className="text-[13px] tabular-nums text-fg-3">
                        {problem.acceptanceRate}% acceptance
                      </span>
                    ) : null}
                  </div>
                </div>

                {problem.companyTags?.length > 0 ? (
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
                ) : null}

                <Markdown text={problem.description} className="text-sm text-fg-2" />

                {Array.isArray(problem.examples) && problem.examples.length > 0 ? (
                  <section aria-labelledby="workspace-examples">
                    <h3 id="workspace-examples" className="text-sm font-semibold text-white">
                      Examples
                    </h3>
                    <div className="mt-3 space-y-3">
                      {problem.examples.map((example: any, index: number) => (
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
                            {example.explanation ? (
                              <p className="border-t border-line-soft pt-2 font-sans text-[13px] leading-relaxed text-fg-2">
                                {example.explanation}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {Array.isArray(problem.constraints) && problem.constraints.length > 0 ? (
                  <section aria-labelledby="workspace-constraints">
                    <h3 id="workspace-constraints" className="text-sm font-semibold text-white">
                      Constraints
                    </h3>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {problem.constraints.map((constraint: string, index: number) => (
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

                {hints.length > 0 ? (
                  <section className="border-t border-line pt-5" aria-labelledby="workspace-hints">
                    <h3
                      id="workspace-hints"
                      className="flex items-center gap-2 text-sm font-semibold text-white"
                    >
                      <Lightbulb className="h-4 w-4 text-mark-bright" aria-hidden />
                      Hints
                    </h3>
                    <div className="mt-3 space-y-2">
                      {hints.map((hint: string, index: number) => {
                        const open = Boolean(expandedHints[index]);

                        return (
                          <div key={index} className="card overflow-hidden">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedHints((previous) => ({
                                  ...previous,
                                  [index]: !open,
                                }))
                              }
                              aria-expanded={open}
                              aria-controls={`hint-panel-${index}`}
                              className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[13px] font-medium text-fg-2 transition-colors hover:text-white"
                            >
                              <span>Hint {index + 1}</span>
                              {open ? (
                                <ChevronUp className="h-3.5 w-3.5 text-fg-3" aria-hidden />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5 text-fg-3" aria-hidden />
                              )}
                            </button>
                            {open ? (
                              <p
                                id={`hint-panel-${index}`}
                                className="border-t border-line-soft px-4 py-3 text-[13px] leading-relaxed text-fg-2"
                              >
                                {hint}
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ) : null}
              </div>
            ) : null}

            {activeLeftTab === 'solution' ? (
              <div>
                <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                  <h2 className="text-lg font-semibold text-white">Editorial</h2>
                  <Badge tone="mark">Official solution</Badge>
                </div>
                {problem.solution ? (
                  <div className="mt-4 rounded-lg border border-line bg-ink-800 p-5">
                    <Markdown text={problem.solution} className="text-sm text-fg-2" />
                  </div>
                ) : (
                  <EmptyState
                    icon={BookOpen}
                    title="No editorial published yet"
                    sub="The editorial for this problem has not been written. Try the hints on the description tab."
                  />
                )}
              </div>
            ) : null}

            {activeLeftTab === 'submissions' ? (
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
                    {submissionsList.map((submission: any) => {
                      const accepted = submission.status === 'ACCEPTED';

                      return (
                        <li key={submission.id} className="card p-3.5">
                          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                            <div className="flex min-w-0 items-start gap-2.5">
                              {accepted ? (
                                <CheckCircle2
                                  className="mt-0.5 h-4 w-4 shrink-0 text-easy"
                                  aria-hidden
                                />
                              ) : (
                                <XCircle
                                  className="mt-0.5 h-4 w-4 shrink-0 text-hard"
                                  aria-hidden
                                />
                              )}
                              <div className="min-w-0">
                                <div
                                  className={cn(
                                    'text-sm font-semibold',
                                    accepted ? 'text-easy' : 'text-hard'
                                  )}
                                >
                                  {accepted
                                    ? 'Accepted'
                                    : STATUS_TEXT[submission.status] || submission.status}
                                </div>
                                <div className="mt-0.5 text-xs tabular-nums text-fg-3">
                                  {new Date(submission.createdAt).toLocaleString()}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pl-6 text-xs">
                              <Tag className="capitalize">{submission.language}</Tag>
                              <span className="font-semibold tabular-nums text-fg-2">
                                {submission.runtimeMs || 0} ms
                              </span>
                              <span className="tabular-nums text-fg-3">
                                {submission.passedTests}/{submission.totalTests} passed
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : null}

            {activeLeftTab === 'notes' ? (
              <div>
                <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                  <h2 className="text-lg font-semibold text-white">Your notes</h2>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSaveNote}
                    disabled={savingNote}
                  >
                    {savingNote ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    )}
                    {savingNote ? 'Saving…' : 'Save note'}
                  </Button>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-fg-3">
                  Write down the edge cases and the complexity you want to remember before an
                  interview.
                </p>

                {noteNotice ? (
                  <div className="mt-3">
                    <Notice tone="ok" icon={CheckCircle2}>
                      {noteNotice}
                    </Notice>
                  </div>
                ) : null}

                {noteError ? (
                  <div className="mt-3">
                    <Notice tone="err" icon={TriangleAlert}>
                      {noteError}
                    </Notice>
                  </div>
                ) : null}

                <textarea
                  value={noteContent}
                  onChange={(event) => {
                    setNoteContent(event.target.value);
                    setNoteNotice('');
                    setNoteError('');
                  }}
                  placeholder="Negative numbers break the sort. O(n) time, O(1) space…"
                  aria-label="Notes for this problem"
                  className="textarea mt-3 h-72 font-mono text-[13px]"
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: editor + console */}
        <div
          id="workspace-editor"
          role="tabpanel"
          aria-labelledby="workspace-editor-tab"
          className={rightClass}
        >
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <CodeEditor language={language} value={code} onChange={handleCodeChange} />
          </div>

          {/* Console drawer */}
          <div
            className={cn(
              'flex shrink-0 flex-col border-t border-line bg-ink-850 transition-[height] duration-200',
              consoleOpen ? 'h-56 sm:h-64' : 'h-11'
            )}
          >
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-3">
              <div
                role="tablist"
                aria-label="Console"
                className="flex min-w-0 items-center overflow-x-auto scrollbar-none"
              >
                <button
                  id="console-tab-testcase"
                  role="tab"
                  aria-selected={activeConsoleTab === 'testcase'}
                  aria-controls="console-panel"
                  tabIndex={activeConsoleTab === 'testcase' ? 0 : -1}
                  onClick={() => {
                    setActiveConsoleTab('testcase');
                    setConsoleOpen(true);
                  }}
                  className={cn(
                    'relative flex h-10 shrink-0 items-center gap-1.5 px-2.5 text-[13px] font-medium transition-colors after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-mark-bright',
                    activeConsoleTab === 'testcase' && consoleOpen
                      ? 'text-white after:opacity-100'
                      : 'text-fg-3 after:opacity-0 hover:text-fg'
                  )}
                >
                  <Terminal className="h-3.5 w-3.5" aria-hidden />
                  Test cases
                </button>

                <button
                  id="console-tab-result"
                  role="tab"
                  aria-selected={activeConsoleTab === 'result'}
                  aria-controls="console-panel"
                  tabIndex={activeConsoleTab === 'result' ? 0 : -1}
                  onClick={() => {
                    setActiveConsoleTab('result');
                    setConsoleOpen(true);
                  }}
                  className={cn(
                    'relative flex h-10 shrink-0 items-center gap-1.5 px-2.5 text-[13px] font-medium transition-colors after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-mark-bright',
                    activeConsoleTab === 'result' && consoleOpen
                      ? 'text-white after:opacity-100'
                      : 'text-fg-3 after:opacity-0 hover:text-fg'
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  Results
                  {currentResult ? (
                    <span
                      className={cn(
                        'ml-1 h-1.5 w-1.5 rounded-full',
                        currentResult.status === 'ACCEPTED' ? 'bg-easy' : 'bg-hard'
                      )}
                      aria-hidden
                    />
                  ) : null}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setConsoleOpen((value) => !value)}
                aria-expanded={consoleOpen}
                aria-controls="console-panel"
                aria-label={consoleOpen ? 'Collapse console' : 'Expand console'}
                className="btn btn-ghost btn-sm shrink-0 px-2"
              >
                {consoleOpen ? (
                  <ChevronDown className="h-4 w-4" aria-hidden />
                ) : (
                  <ChevronUp className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>

            {consoleOpen ? (
              <div
                id="console-panel"
                role="tabpanel"
                aria-labelledby={`console-tab-${activeConsoleTab}`}
                className="flex-1 overflow-y-auto p-4 text-[13px]"
              >
                {activeConsoleTab === 'testcase' ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {testCases.length > 0 ? (
                        <div className="seg flex-wrap" aria-label="Sample cases">
                          {testCases.map((testCase: any, index: number) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setSelectedCaseIndex(index);
                                setCustomInput(testCase.input || '');
                              }}
                              aria-pressed={selectedCaseIndex === index}
                              className={cn(
                                'seg-btn',
                                selectedCaseIndex === index && 'seg-btn-on'
                              )}
                            >
                              Case {index + 1}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-fg-3">No sample cases published.</span>
                      )}

                      <button
                        type="button"
                        onClick={() => setRawInputMode((value) => !value)}
                        className="text-[13px] text-fg-3 underline underline-offset-2 transition-colors hover:text-white"
                      >
                        {rawInputMode ? 'Use formatted view' : 'Edit raw input'}
                      </button>
                    </div>

                    {!rawInputMode ? (
                      <div className="space-y-2">
                        {customInput
                          .split('\n')
                          .filter((line) => line.trim().length > 0)
                          .map((line, index) => (
                            <div key={index} className="space-y-1">
                              <span className="block text-xs text-fg-3">
                                Parameter {index + 1}
                              </span>
                              <div className="code-well !py-2">{line}</div>
                            </div>
                          ))}
                        {!customInput.trim() ? (
                          <p className="text-fg-3">This case has no input.</p>
                        ) : null}
                      </div>
                    ) : (
                      <div>
                        <label className="label" htmlFor="raw-input">
                          Raw standard input
                        </label>
                        <textarea
                          id="raw-input"
                          value={customInput}
                          onChange={(event) => setCustomInput(event.target.value)}
                          className="textarea h-24 font-mono text-[13px]"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {actionError ? (
                      <Notice tone="err" icon={TriangleAlert}>
                        {actionError}
                      </Notice>
                    ) : !currentResult ? (
                      <p className="py-8 text-center text-fg-3">
                        Run your code against the samples, then submit for the full hidden suite.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <div
                          className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3"
                          role="status"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span
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
                            </span>
                            <span className="text-xs text-fg-3">{resultKind}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
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

                        {currentResult.compileError ? (
                          <pre className="whitespace-pre-wrap rounded-lg border border-hard/30 bg-hard/10 p-3 font-mono text-[13px] leading-relaxed text-hard">
                            {currentResult.compileError}
                          </pre>
                        ) : null}

                        {Array.isArray(currentResult.testResults) &&
                        currentResult.testResults.length > 0 ? (
                          <div className="space-y-3">
                            <div className="seg flex-wrap" aria-label="Result cases">
                              {currentResult.testResults.map((testCase: any) => (
                                <button
                                  key={testCase.index}
                                  type="button"
                                  onClick={() => setSelectedCaseIndex(testCase.index - 1)}
                                  aria-pressed={selectedCaseIndex === testCase.index - 1}
                                  className={cn(
                                    'seg-btn',
                                    selectedCaseIndex === testCase.index - 1 && 'seg-btn-on'
                                  )}
                                >
                                  <span
                                    className={cn(
                                      'mr-1.5 inline-block h-1.5 w-1.5 rounded-full',
                                      testCase.passed ? 'bg-easy' : 'bg-hard'
                                    )}
                                    aria-hidden
                                  />
                                  Case {testCase.index}
                                </button>
                              ))}
                            </div>

                            {(() => {
                              const results = currentResult.testResults;
                              const activeCase =
                                results[
                                  Math.min(
                                    Math.max(0, selectedCaseIndex),
                                    results.length - 1
                                  )
                                ];
                              if (!activeCase) return null;

                              return (
                                <div className="card space-y-3 p-3.5">
                                  <div>
                                    <span className="mb-1 block text-xs text-fg-3">Input</span>
                                    <div className="code-well !py-2">{activeCase.input}</div>
                                  </div>

                                  <div>
                                    <span className="mb-1 block text-xs text-fg-3">
                                      Your output
                                    </span>
                                    <div className="code-well !py-2">
                                      {activeCase.actualOutput || '(empty)'}
                                    </div>
                                  </div>

                                  {activeCase.expectedOutput ? (
                                    <div>
                                      <span className="mb-1 block text-xs text-fg-3">
                                        Expected
                                      </span>
                                      <div className="code-well !py-2 !text-easy">
                                        {activeCase.expectedOutput}
                                      </div>
                                    </div>
                                  ) : null}

                                  {activeCase.stderr ? (
                                    <div>
                                      <span className="mb-1 block text-xs text-hard">
                                        Standard error
                                      </span>
                                      <pre className="whitespace-pre-wrap rounded-lg border border-hard/30 bg-hard/10 p-2.5 font-mono text-[13px] text-hard">
                                        {activeCase.stderr}
                                      </pre>
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })()}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmResetOpen}
        title="Reset the editor?"
        description={`This replaces your ${language} code with the starter template. Your current code cannot be recovered.`}
        confirmLabel="Reset code"
        tone="danger"
        onConfirm={resetCode}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
}
