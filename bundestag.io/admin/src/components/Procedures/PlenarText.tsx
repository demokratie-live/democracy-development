import React from 'react';

// highlight colours as in the old admin; parties, result words and document numbers
const PARTY_COLORS: [string, string][] = [
  ['Grüne', '#abffb3'],
  ['Linke', '#fa9db0'],
  ['CDU', '#d1c9ca'],
  ['CSU', '#d1c9ca'],
  ['Union', '#d1c9ca'],
  ['FDP', '#f8ffa6'],
  ['AfD', '#94fff8'],
  ['SPD', '#fab59d'],
  ['alle übrigen', '#ffe1a1'],
];
const KEYWORD_COLOR = '#ffb3f2';
const KEYWORDS = ['abgelehnt', 'angenommen'];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Splits the text into plain parts and highlighted parts. The protocol text is
 * rendered as text, never as HTML.
 */
export const highlight = (text: string, docIds: string[]) => {
  const colors = new Map<string, string>(PARTY_COLORS);
  for (const word of [...KEYWORDS, ...docIds]) colors.set(word, KEYWORD_COLOR);
  const words = Array.from(colors.keys())
    .filter(Boolean)
    // longest first, so "alle übrigen" wins over shorter matches
    .sort((a, b) => b.length - a.length);
  if (!words.length || !text) return [{ text, color: undefined as string | undefined }];

  const pattern = new RegExp(`(${words.map(escape).join('|')})`, 'g');
  return text
    .split(pattern)
    .filter(Boolean)
    .map((part) => ({ text: part, color: colors.get(part) }));
};

export const PlenarText: React.FC<{ text: string; docIds: string[] }> = ({ text, docIds }) => (
  <p className="leading-relaxed">
    {highlight(text, docIds).map(({ text: part, color }, i) =>
      color ? (
        <mark key={i} className="rounded-sm px-0.5 text-inherit" style={{ backgroundColor: color }}>
          {part}
        </mark>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    )}
  </p>
);
