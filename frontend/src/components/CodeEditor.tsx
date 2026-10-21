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

  const lineCount = (value || '').split('\n').length;

  return (
    <div className={`relative h-full w-full bg-ink-950 font-mono text-[13px] ${className || ''}`}>
      {!editorError && (
        <div className={`h-full w-full ${monacoReady ? 'block' : 'hidden'}`}>
          <MonacoEditor
            height="100%"
            theme="vs-dark"
            language={getMonacoLang(language)}
            value={value}
            onChange={onChange}
            onMount={() => setMonacoReady(true)}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              readOnly,
              fontFamily: "var(--font-plex-mono), 'Fira Code', 'Courier New', monospace",
              renderLineHighlight: 'line',
              contextmenu: true,
              smoothScrolling: false,
              cursorBlinking: 'smooth',
            }}
          />
        </div>
      )}

      {(!monacoReady || editorError) && (
        <div className="flex h-full w-full overflow-hidden bg-ink-950">
          {/* Line numbers gutter */}
          <div className="select-none py-3 pl-3 pr-2 text-right text-xs text-fg-4/60 border-r border-line/40">
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
              placeholder="# Write your solution here..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
