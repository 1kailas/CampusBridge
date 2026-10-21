'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Code2,
  ExternalLink,
  FileText,
  Layers,
  ListChecks,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import {
  Badge,
  DifficultyBadge,
  EmptyState,
  LoadingState,
  Notice,
  PageHeader,
  buttonClass,
} from '@/components/ui';

const COMMON_RECRUITERS = [
  'Amazon',
  'Google',
  'Microsoft',
  'TCS Digital',
  'TCS NQT',
  'Infosys DPhi',
  'Wipro Turbo',
  'Cognizant',
  'Flipkart',
  'Goldman Sachs',
  'Adobe',
  'Accenture',
];

const CATEGORIES = [
  'Arrays',
  'Strings',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Linked List',
  'Trees',
  'Heap / Priority Queue',
  'Backtracking',
  'Graphs',
  'Dynamic Programming',
  'Greedy',
  'Bit Manipulation',
];

type TestCase = {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  explanation: string;
};

export default function AdminPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [publishing, setPublishing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Problem metadata
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [category, setCategory] = useState('Arrays');
  const [description, setDescription] = useState('');
  const [companyTags, setCompanyTags] = useState<string[]>(['Amazon', 'TCS Digital']);
  const [newTagInput, setNewTagInput] = useState('');

  // Method signature generator
  const [functionName, setFunctionName] = useState('solve');
  const [paramNames, setParamNames] = useState('nums');
  const [returnType, setReturnType] = useState('int');

  // Custom code templates
  const [customTemplatesEnabled, setCustomTemplatesEnabled] = useState(false);
  const [pythonTemplate, setPythonTemplate] = useState('');
  const [cppTemplate, setCppTemplate] = useState('');
  const [javaTemplate, setJavaTemplate] = useState('');
  const [jsTemplate, setJsTemplate] = useState('');

  // Statement parts
  const [constraintsText, setConstraintsText] = useState(
    '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4'
  );
  const [hintsText, setHintsText] = useState(
    'Consider using a hash set for O(n) lookup time.\nCheck if x - 1 exists to identify the start of a sequence.'
  );
  const [editorialText, setEditorialText] = useState('');

  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      input: '[100, 4, 200, 1, 3, 2]',
      expectedOutput: '4',
      isHidden: false,
      explanation: 'The longest consecutive run is [1, 2, 3, 4].',
    },
    {
      input: '[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]',
      expectedOutput: '9',
      isHidden: false,
      explanation: 'The run [0, 1, …, 8] has length 9.',
    },
    {
      input: '[]',
      expectedOutput: '0',
      isHidden: true,
      explanation: 'Empty array edge case.',
    },
  ]);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const list = await api.getProblems();
      setProblems(list || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    );
  };

  const generateTemplates = () => {
    const fn = functionName.trim() || 'solve';
    const params = paramNames.trim() || 'nums';

    const pyRet = returnType === 'int' ? 'int' : returnType === 'bool' ? 'bool' : returnType === 'string' ? 'str' : returnType === 'list' ? 'List[int]' : 'any';
    const cppRet = returnType === 'int' ? 'int' : returnType === 'bool' ? 'bool' : returnType === 'string' ? 'string' : returnType === 'list' ? 'vector<int>' : 'int';
    const javaRet = returnType === 'int' ? 'int' : returnType === 'bool' ? 'boolean' : returnType === 'string' ? 'String' : returnType === 'list' ? 'int[]' : 'int';
    const jsRet = returnType === 'int' ? 'number' : returnType === 'bool' ? 'boolean' : returnType === 'string' ? 'string' : returnType === 'list' ? 'number[]' : 'number';

    const py = `class Solution:\n    def ${fn}(self, ${params}) -> ${pyRet}:\n        # Write your placement solution here\n        pass\n`;

    const cpp = `class Solution {\npublic:\n    ${cppRet} ${fn}(vector<int>& ${params}) {\n        // Write your placement solution here\n        return 0;\n    }\n};\n`;

    const java = `class Solution {\n    public ${javaRet} ${fn}(int[] ${params}) {\n        // Write your placement solution here\n        return 0;\n    }\n}\n`;

    const js = `/**\n * @return {${jsRet}}\n */\nvar ${fn} = function(${params}) {\n    // Write your placement solution here\n};\n`;

    return { python: py, cpp, java, javascript: js };
  };

  const addTag = (tag: string) => {
    const clean = tag.trim();
    if (clean && !companyTags.includes(clean)) setCompanyTags([...companyTags, clean]);
  };

  const removeTag = (tag: string) => {
    setCompanyTags(companyTags.filter((t) => t !== tag));
  };

  const addTestCase = (hidden = false) => {
    setTestCases([...testCases, { input: '', expectedOutput: '', isHidden: hidden, explanation: '' }]);
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: any) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  const removeTestCase = (index: number) => {
    if (testCases.length <= 1) {
      window.alert('A problem needs at least one test case.');
      return;
    }
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setStatusMsg({ type: 'error', text: 'Title and slug are both required.' });
      return;
    }

    if (testCases.some((tc) => !tc.input.trim() || !tc.expectedOutput.trim())) {
      setStatusMsg({
        type: 'error',
        text: 'Every test case needs both an input and an expected output.',
      });
      return;
    }

    try {
      setPublishing(true);
      setStatusMsg(null);

      const templates = customTemplatesEnabled
        ? {
            python: pythonTemplate,
            cpp: cppTemplate,
            java: javaTemplate,
            javascript: jsTemplate,
          }
        : generateTemplates();

      const constraints = constraintsText.split('\n').map((s) => s.trim()).filter(Boolean);
      const hints = hintsText.split('\n').map((s) => s.trim()).filter(Boolean);

      const examples = testCases
        .filter((tc) => !tc.isHidden)
        .slice(0, 3)
        .map((tc) => ({
          input: tc.input,
          output: tc.expectedOutput,
          explanation: tc.explanation || undefined,
        }));

      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        difficulty,
        category,
        description: description.trim(),
        examples,
        constraints,
        companyTags,
        defaultTemplates: templates,
        hints,
        solution: editorialText.trim(),
        testCases: testCases.map((tc) => ({
          input: tc.input.trim(),
          expectedOutput: tc.expectedOutput.trim(),
          isHidden: tc.isHidden,
          explanation: tc.explanation.trim(),
        })),
      };

      await api.createProblem(payload);
      setStatusMsg({ type: 'success', text: `“${title.trim()}” is live in the problem set.` });

      await loadProblems();

      setTitle('');
      setSlug('');
      setDescription('');
      setEditorialText('');
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'The problem could not be published.' });
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteProblem = async (id: string, probTitle: string) => {
    if (!window.confirm(`Delete “${probTitle}”? Its submissions and test cases go with it.`)) {
      return;
    }

    try {
      await api.deleteProblem(id);
      setProblems(problems.filter((p) => p.id !== id));
    } catch (err: any) {
      window.alert('Could not delete this problem: ' + err.message);
    }
  };

  const generatedPreview = generateTemplates();

  const cardHead = (Icon: React.ElementType, text: string, aside?: React.ReactNode) => (
    <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5 sm:px-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
        <Icon className="h-4 w-4 text-fg-3" aria-hidden />
        {text}
      </h2>
      {aside}
    </div>
  );

  return (
    <div className="w-full flex-1">
      <div className="shell page">
        <PageHeader
          title="Question studio"
          sub="Author placement round questions with a clean method signature, sample cases for the console, and hidden cases that only run on submission."
          actions={
            <>
              <div className="seg">
                <button
                  onClick={() => setActiveTab('create')}
                  aria-pressed={activeTab === 'create'}
                  className={cn('seg-btn flex items-center gap-1.5', activeTab === 'create' && 'seg-btn-on')}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  New question
                </button>
                <button
                  onClick={() => setActiveTab('manage')}
                  aria-pressed={activeTab === 'manage'}
                  className={cn('seg-btn flex items-center gap-1.5', activeTab === 'manage' && 'seg-btn-on')}
                >
                  <Layers className="h-3.5 w-3.5" aria-hidden />
                  All questions ({problems.length})
                </button>
              </div>

              <Link href="/problems" className={buttonClass({ size: 'sm' })}>
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                Solve as a student
                <ExternalLink className="h-3 w-3 text-fg-4" aria-hidden />
              </Link>
            </>
          }
        />

        {statusMsg && (
          <Notice
            tone={statusMsg.type === 'success' ? 'ok' : 'err'}
            icon={statusMsg.type === 'success' ? CheckCircle2 : AlertCircle}
            action={
              statusMsg.type === 'success' && slug ? (
                <Link
                  href={`/problems/${slug}`}
                  className="underline underline-offset-2 hover:opacity-80"
                >
                  Open in the workspace
                </Link>
              ) : (
                <button
                  onClick={() => setStatusMsg(null)}
                  aria-label="Dismiss"
                  className="opacity-70 hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )
            }
          >
            {statusMsg.text}
          </Notice>
        )}

        {activeTab === 'create' ? (
          <form onSubmit={handlePublish} className="grid gap-5 lg:grid-cols-12">
            {/* ---------------------------------------------------- left column */}
            <div className="space-y-5 lg:col-span-7">
              <section className="card overflow-hidden">
                {cardHead(FileText, 'Problem information')}
                <div className="space-y-4 p-5 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="q-title">
                        Title <span className="text-hard">*</span>
                      </label>
                      <input
                        id="q-title"
                        required
                        placeholder="Longest consecutive sequence"
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="label" htmlFor="q-slug">
                        URL slug <span className="text-hard">*</span>
                      </label>
                      <input
                        id="q-slug"
                        required
                        placeholder="longest-consecutive-sequence"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="input font-mono text-[13px]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <span className="label">Difficulty</span>
                      <div className="grid grid-cols-3 gap-2">
                        {(['EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => setDifficulty(diff)}
                            aria-pressed={difficulty === diff}
                            className={cn(
                              'h-9 rounded-md border text-[13px] font-medium capitalize transition-colors',
                              difficulty === diff
                                ? diff === 'EASY'
                                  ? 'border-easy/50 bg-easy/15 text-easy'
                                  : diff === 'MEDIUM'
                                    ? 'border-medium/50 bg-medium/15 text-medium'
                                    : 'border-hard/50 bg-hard/15 text-hard'
                                : 'border-line bg-ink-700 text-fg-3 hover:text-fg'
                            )}
                          >
                            {diff.toLowerCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="label" htmlFor="q-category">
                        Pattern
                      </label>
                      <select
                        id="q-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="select"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label" htmlFor="q-tags">
                      Recruiting drives{' '}
                      <span className="label-hint">the rounds this question appears in</span>
                    </label>

                    <div className="mb-2.5 flex flex-wrap gap-1.5">
                      {companyTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-sm border border-mark/30 bg-mark/10 px-2 py-0.5 text-xs font-medium text-mark"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            aria-label={`Remove ${tag}`}
                            className="text-mark/70 transition-colors hover:text-hard"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_RECRUITERS.filter((r) => !companyTags.includes(r))
                        .slice(0, 8)
                        .map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => addTag(r)}
                            className="chip h-7 text-xs"
                          >
                            <Plus className="h-3 w-3" aria-hidden />
                            {r}
                          </button>
                        ))}
                    </div>

                    <div className="mt-2.5 flex gap-2">
                      <input
                        id="q-tags"
                        type="text"
                        placeholder="Add another company"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newTagInput) {
                              addTag(newTagInput);
                              setNewTagInput('');
                            }
                          }
                        }}
                        className="input flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newTagInput) {
                            addTag(newTagInput);
                            setNewTagInput('');
                          }
                        }}
                        className={buttonClass({ size: 'md' })}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="card overflow-hidden">
                {cardHead(BookOpen, 'Statement and constraints')}
                <div className="space-y-4 p-5 sm:p-6">
                  <div>
                    <label className="label" htmlFor="q-desc">
                      Description <span className="text-hard">*</span>
                    </label>
                    <textarea
                      id="q-desc"
                      required
                      rows={6}
                      placeholder="Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence. Your solution must run in O(n) time."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="textarea"
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="q-constraints">
                      Constraints <span className="label-hint">one per line</span>
                    </label>
                    <textarea
                      id="q-constraints"
                      rows={3}
                      value={constraintsText}
                      onChange={(e) => setConstraintsText(e.target.value)}
                      className="textarea font-mono text-[13px]"
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="q-hints">
                      Hints <span className="label-hint">one per line</span>
                    </label>
                    <textarea
                      id="q-hints"
                      rows={2}
                      placeholder="Consider hashing the values you have already seen…"
                      value={hintsText}
                      onChange={(e) => setHintsText(e.target.value)}
                      className="textarea"
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="q-editorial">
                      Editorial <span className="label-hint">the approach students read after submitting</span>
                    </label>
                    <textarea
                      id="q-editorial"
                      rows={3}
                      placeholder="Explain the O(n) hash-set solution and why sorting is unnecessary…"
                      value={editorialText}
                      onChange={(e) => setEditorialText(e.target.value)}
                      className="textarea"
                    />
                  </div>
                </div>
              </section>

              <button
                type="submit"
                disabled={publishing}
                className={buttonClass({ variant: 'primary', size: 'lg', block: true })}
              >
                <Send className="h-4 w-4" aria-hidden />
                {publishing ? 'Publishing…' : 'Publish to the problem set'}
              </button>
            </div>

            {/* --------------------------------------------------- right column */}
            <div className="space-y-5 lg:col-span-5">
              <section className="card overflow-hidden">
                {cardHead(
                  Code2,
                  'Starter signature',
                  <span className="text-xs text-fg-4">no stdin boilerplate</span>
                )}
                <div className="space-y-4 p-5 sm:p-6">
                  <p className="text-[13px] leading-relaxed text-fg-3">
                    Students see only the method signature. The judge handles reading input and
                    printing output.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label" htmlFor="q-fn">
                        Function
                      </label>
                      <input
                        id="q-fn"
                        value={functionName}
                        onChange={(e) => setFunctionName(e.target.value)}
                        placeholder="twoSum"
                        className="input font-mono text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="label" htmlFor="q-return">
                        Returns
                      </label>
                      <select
                        id="q-return"
                        value={returnType}
                        onChange={(e) => setReturnType(e.target.value)}
                        className="select font-mono text-[13px]"
                      >
                        <option value="int">int / number</option>
                        <option value="bool">boolean</option>
                        <option value="string">string</option>
                        <option value="list">list / array</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label" htmlFor="q-params">
                      Parameters <span className="label-hint">comma separated</span>
                    </label>
                    <input
                      id="q-params"
                      value={paramNames}
                      onChange={(e) => setParamNames(e.target.value)}
                      placeholder="nums, target"
                      className="input font-mono text-[13px]"
                    />
                  </div>

                  <div>
                    <span className="label">Python starter</span>
                    <pre className="code-well max-h-44 overflow-y-auto">
                      {generatedPreview.python}
                    </pre>
                  </div>

                  <label className="flex cursor-pointer items-center gap-2 text-[13px] text-fg-3">
                    <input
                      type="checkbox"
                      checked={customTemplatesEnabled}
                      onChange={(e) => setCustomTemplatesEnabled(e.target.checked)}
                      className="h-4 w-4 rounded-xs accent-mark"
                    />
                    Write my own templates for all four languages
                  </label>

                  {customTemplatesEnabled && (
                    <div className="space-y-3 border-t border-line pt-4">
                      {[
                        { key: 'python', label: 'Python 3', value: pythonTemplate, set: setPythonTemplate },
                        { key: 'cpp', label: 'C++', value: cppTemplate, set: setCppTemplate },
                        { key: 'java', label: 'Java', value: javaTemplate, set: setJavaTemplate },
                        { key: 'javascript', label: 'JavaScript', value: jsTemplate, set: setJsTemplate },
                      ].map((t) => (
                        <div key={t.key}>
                          <label className="label" htmlFor={`tpl-${t.key}`}>
                            {t.label}
                          </label>
                          <textarea
                            id={`tpl-${t.key}`}
                            rows={3}
                            value={t.value}
                            onChange={(e) => t.set(e.target.value)}
                            className="textarea font-mono text-[13px]"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="card overflow-hidden">
                {cardHead(
                  ListChecks,
                  `Test cases (${testCases.length})`,
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => addTestCase(false)}
                      className="btn btn-sm btn-secondary"
                    >
                      <Plus className="h-3.5 w-3.5 text-easy" aria-hidden />
                      Sample
                    </button>
                    <button
                      type="button"
                      onClick={() => addTestCase(true)}
                      className="btn btn-sm btn-secondary"
                    >
                      <Plus className="h-3.5 w-3.5 text-mark" aria-hidden />
                      Hidden
                    </button>
                  </div>
                )}

                <div className="space-y-3 p-5 sm:p-6">
                  <p className="text-[13px] leading-relaxed text-fg-3">
                    Sample cases show up in the console. Hidden cases only run when a student
                    submits.
                  </p>

                  <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                    {testCases.map((tc, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'rounded-lg border bg-ink-750 p-3.5',
                          tc.isHidden ? 'border-mark/30' : 'border-line'
                        )}
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-white">
                              Case {idx + 1}
                            </span>
                            <Badge tone={tc.isHidden ? 'mark' : 'easy'}>
                              {tc.isHidden ? 'Hidden' : 'Sample'}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-fg-3">
                              <input
                                type="checkbox"
                                checked={tc.isHidden}
                                onChange={(e) => updateTestCase(idx, 'isHidden', e.target.checked)}
                                className="h-3.5 w-3.5 rounded-xs accent-mark"
                              />
                              Hidden
                            </label>
                            <button
                              type="button"
                              onClick={() => removeTestCase(idx)}
                              aria-label={`Delete case ${idx + 1}`}
                              className="rounded-sm p-1 text-fg-4 transition-colors hover:text-hard"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <div>
                            <label className="label !mb-1" htmlFor={`tc-in-${idx}`}>
                              Input
                            </label>
                            <input
                              id={`tc-in-${idx}`}
                              type="text"
                              value={tc.input}
                              onChange={(e) => updateTestCase(idx, 'input', e.target.value)}
                              placeholder="[2, 7, 11, 15]"
                              className="input font-mono text-[13px]"
                            />
                          </div>

                          <div>
                            <label className="label !mb-1" htmlFor={`tc-out-${idx}`}>
                              Expected output
                            </label>
                            <input
                              id={`tc-out-${idx}`}
                              type="text"
                              value={tc.expectedOutput}
                              onChange={(e) => updateTestCase(idx, 'expectedOutput', e.target.value)}
                              placeholder="4 or [0, 1]"
                              className="input font-mono text-[13px] text-easy"
                            />
                          </div>

                          <div>
                            <label className="label !mb-1" htmlFor={`tc-exp-${idx}`}>
                              Explanation <span className="label-hint">optional</span>
                            </label>
                            <input
                              id={`tc-exp-${idx}`}
                              type="text"
                              value={tc.explanation}
                              onChange={(e) => updateTestCase(idx, 'explanation', e.target.value)}
                              placeholder="nums[0] + nums[1] = 9"
                              className="input"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </form>
        ) : (
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5 sm:px-6">
              <h2 className="text-sm font-semibold text-white">
                All questions{' '}
                <span className="ml-1 font-normal tabular-nums text-fg-3">
                  ({problems.length})
                </span>
              </h2>
              <button onClick={loadProblems} className={buttonClass({ size: 'sm' })}>
                <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} aria-hidden />
                Refresh
              </button>
            </div>

            {loading && problems.length === 0 ? (
              <LoadingState label="Loading questions…" />
            ) : problems.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No questions published yet"
                sub="Write your first question and publish it to the set."
                action={
                  <button
                    onClick={() => setActiveTab('create')}
                    className="btn btn-primary btn-sm"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    New question
                  </button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="table min-w-[820px]">
                  <thead className="thead">
                    <tr>
                      <th scope="col">Question</th>
                      <th scope="col" className="w-32 text-center">
                        Difficulty
                      </th>
                      <th scope="col" className="w-44">
                        Pattern
                      </th>
                      <th scope="col" className="w-64">
                        Drives
                      </th>
                      <th scope="col" className="w-28 text-right">
                        Acceptance
                      </th>
                      <th scope="col" className="w-28 text-right">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="tbody">
                    {problems.map((prob) => (
                      <tr key={prob.id}>
                        <td className="td">
                          <Link
                            href={`/problems/${prob.slug}`}
                            className="text-[15px] font-medium text-white transition-colors hover:text-mark"
                          >
                            {prob.title}
                          </Link>
                          <div className="mt-0.5 font-mono text-xs text-fg-4">
                            /problems/{prob.slug}
                          </div>
                        </td>

                        <td className="td text-center">
                          <DifficultyBadge
                            difficulty={prob.difficulty}
                            className="min-w-[70px] justify-center"
                          />
                        </td>

                        <td className="td text-sm text-fg-2">{prob.category}</td>

                        <td className="td">
                          <div className="flex flex-wrap gap-1">
                            {(prob.companyTags || []).slice(0, 3).map((tag: string) => (
                              <span key={tag} className="tag">
                                {tag}
                              </span>
                            ))}
                            {(prob.companyTags || []).length > 3 && (
                              <span className="self-center text-xs text-fg-4">
                                +{(prob.companyTags || []).length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="td num text-right text-sm text-fg-2">
                          {prob.acceptanceRate}%
                        </td>

                        <td className="td text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/problems/${prob.slug}`}
                              title="Open in the workspace"
                              aria-label={`Open ${prob.title} in the workspace`}
                              className="btn btn-sm btn-secondary w-8 px-0"
                            >
                              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                            </Link>
                            <button
                              onClick={() => handleDeleteProblem(prob.id, prob.title)}
                              title="Delete question"
                              aria-label={`Delete ${prob.title}`}
                              className="btn btn-sm btn-danger w-8 px-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
