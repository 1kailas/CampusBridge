'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => null,
});

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
  className?: string;
  readOnly?: boolean;
}

const PLACEHOLDERS: Record<string, string> = {
  python: '# Write your solution here...',
  cpp: '// Write your solution here...',
  java: '// Write your solution here...',
  javascript: '// Write your solution here...',
};

export default function CodeEditor({
  language,
  value,
  onChange,
  className,
  readOnly = false,
}: CodeEditorProps) {
  const [monacoReady, setMonacoReady] = useState(false);
  const [editorError, setEditorError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // If Monaco hasn't mounted in 4s (e.g. offline/restricted network), fallback gracefully
    const timer = setTimeout(() => {
      setEditorError((prev) => (!monacoReady ? true : prev));
    }, 4000);

    return () => clearTimeout(timer);
  }, [monacoReady]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const getMonacoLang = (l: string) => {
    if (l === 'python') return 'python';
    if (l === 'cpp' || l === 'c++') return 'cpp';
    if (l === 'java') return 'java';
    if (l === 'javascript' || l === 'js') return 'javascript';
    return 'plaintext';
  };

  const defineTheme = (monaco: any) => {
    monaco.editor.defineTheme('campusbridge', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '8B99B4', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'A5B4FC' },
        { token: 'string', foreground: '6EE7B7' },
        { token: 'number', foreground: 'FBBF24' },
        { token: 'type', foreground: '67E8F9' },
        { token: 'function', foreground: 'C4B5FD' },
        { token: 'variable', foreground: 'E8EDF8' },
        { token: 'operator', foreground: 'B6C2D9' },
      ],
      colors: {
        'editor.background': '#050914',
        'editor.foreground': '#E8EDF8',
        'editorLineNumber.foreground': '#3B4A66',
        'editorLineNumber.activeForeground': '#A7B5D0',
        'editor.lineHighlightBackground': '#0A1322',
        'editor.selectionBackground': '#263B64',
        'editor.inactiveSelectionBackground': '#182947',
        'editorCursor.foreground': '#A5B4FC',
        'editorIndentGuide.background1': '#152036',
        'editorIndentGuide.activeBackground1': '#2B3D5E',
        'editorWidget.background': '#0C1424',
        'editorWidget.border': '#1D2A44',
        'editorSuggestWidget.background': '#0C1424',
        'editorSuggestWidget.border': '#1D2A44',
        'editorSuggestWidget.selectedBackground': '#1C2C48',
        'editorHoverWidget.background': '#0C1424',
        'editorHoverWidget.border': '#1D2A44',
        'editorBracketMatch.background': '#1C2C48',
        'editorBracketMatch.border': '#6366F1',
        'scrollbarSlider.background': '#2A3D6155',
        'scrollbarSlider.hoverBackground': '#3B527D88',
        'scrollbarSlider.activeBackground': '#3B527D',
      },
    });
  };

  const lineCount = Math.max((value || '').split('\n').length, 1);

  return (
    <div className={`relative h-full w-full bg-ink-950 font-mono text-[13px] ${className || ''}`}>
      {!editorError && (
        <div className={`h-full w-full ${monacoReady ? 'block' : 'hidden'}`}>
          <MonacoEditor
            height="100%"
            theme="campusbridge"
            beforeMount={defineTheme}
            language={getMonacoLang(language)}
            value={value}
            onChange={onChange}
            onMount={() => setMonacoReady(true)}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineHeight: 24,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              readOnly,
              padding: { top: 12, bottom: 12 },
              fontFamily: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace",
              renderLineHighlight: 'line',
              contextmenu: true,
              smoothScrolling: false,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              folding: true,
              guides: { indentation: true },
              overviewRulerBorder: false,
              scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
            }}
          />
        </div>
      )}

      {(!monacoReady || editorError) && (
        <div className="flex h-full w-full overflow-hidden bg-ink-950">
          {/* Line numbers gutter */}
          <div className="select-none border-r border-line/50 py-3 pl-3 pr-2 text-right text-xs text-fg-4/60">
            {Array.from({ length: Math.max(lineCount, 15) }, (_, i) => (
              <div key={i + 1} className="leading-[1.625rem]">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code textarea */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              readOnly={readOnly}
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              className="h-full w-full resize-none bg-transparent p-3 font-mono text-sm leading-[1.625rem] text-fg focus:outline-none"
              placeholder={PLACEHOLDERS[language] || '// Write your solution here...'}
            />
          </div>
        </div>
      )}
    </div>
  );
}
