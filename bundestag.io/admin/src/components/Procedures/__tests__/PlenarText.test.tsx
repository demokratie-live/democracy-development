import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { highlight, PlenarText } from '../PlenarText';

describe('PlenarText', () => {
  it('marks parties, result words and document numbers', () => {
    const parts = highlight('Die Vorlage 21/9151 ist mit den Stimmen der SPD abgelehnt.', ['21/9151']);
    expect(parts.filter((p) => p.color).map((p) => p.text)).toEqual(['21/9151', 'SPD', 'abgelehnt']);
    expect(parts.map((p) => p.text).join('')).toBe('Die Vorlage 21/9151 ist mit den Stimmen der SPD abgelehnt.');
  });

  it('prefers the longer match and treats document numbers literally', () => {
    const parts = highlight('dagegen alle übrigen; Drucksache 21/1+2', ['21/1+2']);
    expect(parts.filter((p) => p.color).map((p) => p.text)).toEqual(['alle übrigen', '21/1+2']);
  });

  it('renders protocol text as text, never as HTML', () => {
    const { container } = render(<PlenarText text={'<img src=x onerror="alert(1)"> SPD'} docIds={[]} />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toBe('<img src=x onerror="alert(1)"> SPD');
    expect(container.querySelector('mark')?.textContent).toBe('SPD');
  });
});
