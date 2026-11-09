'use client';

import React from 'react';
import { getHighlightParts } from '@/lib/search';

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
  highlightClassName = 'bg-purple-100 text-purple-950 font-bold px-1 rounded border border-purple-200/80',
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
