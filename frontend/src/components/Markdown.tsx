import React from 'react';
import { cn } from '@/lib/cn';

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;

    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={key} className="font-semibold text-fg">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={key}
          className="rounded border border-line bg-ink-750 px-1 py-0.5 font-mono text-[0.9em] text-fg-2"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

/**
 * Renders the small Markdown subset used by problem statements and
 * editorials: paragraphs, line breaks, bold text, and inline code.
 * Text is rendered as React nodes, never injected as HTML.
 */
export default function Markdown({
  text,
  className,
}: {
  text?: string | null;
  className?: string;
}) {
  if (!text) return null;

  const blocks = String(text)
    .trim()
    .split(/\n{2,}/)
    .filter((block) => block.trim().length > 0);

  return (
    <div className={cn('space-y-3 text-sm leading-relaxed text-fg-2', className)}>
      {blocks.map((block, index) => (
        <p key={index} className="whitespace-pre-line">
          {renderInline(block, `block-${index}`)}
        </p>
      ))}
    </div>
  );
}
