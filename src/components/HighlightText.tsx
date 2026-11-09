'use client';

import React from 'react';
import { getHighlightParts } from '@/lib/search';

export const DEFAULT_HIGHLIGHT_CLASS =
  'bg-amber-300 text-amber-950 font-black px-1.5 py-0.5 rounded shadow-sm ring-1 ring-amber-400/90';

interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

export function HighlightText({
  text,
  query,
  className = '',
  highlightClassName = DEFAULT_HIGHLIGHT_CLASS,
}: HighlightTextProps) {
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const parts = getHighlightParts(text, query);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.isMatch ? (
          <mark key={index} className={highlightClassName}>
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </span>
  );
}
