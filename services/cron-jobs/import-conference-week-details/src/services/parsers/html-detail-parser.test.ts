import { parseTopicDetail, parseStatusDetail } from './html-detail-parser';
import { describe, it, expect } from 'vitest';

describe('html-detail-parser', () => {
  describe('parseTopicDetail', () => {
    it('should parse empty string', () => {
      const result = parseTopicDetail('');
      expect(result).toEqual({ lines: [], documents: [] });
    });

    it('should parse plain text', () => {
      const html = 'Befragung der Bundesregierung';
      const result = parseTopicDetail(html);
      expect(result.lines).toContain('Befragung der Bundesregierung');
      expect(result.documents).toHaveLength(0);
    });

    it('should parse text with line breaks', () => {
      const html = 'Befragung der Bundesregierung<br/>BMAS und BMWSB';
      const result = parseTopicDetail(html);
      expect(result.lines).toContain('Befragung der Bundesregierung');
      expect(result.lines).toContain('BMAS und BMWSB');
    });

    it('should extract document links', () => {
      const html = 'Antrag der Fraktion<br/><a href="/dokumente/drucksache-20-12345">Drucksache 20/12345</a>';
      const result = parseTopicDetail(html);
      expect(result.lines).toContain('Antrag der Fraktion');
      expect(result.lines).toContain('Drucksache 20/12345');
      expect(result.documents).toContain('https://www.bundestag.de/dokumente/drucksache-20-12345');
    });

    it('should handle multiple links', () => {
      const html = '<a href="/dok1">Drucksache 20/1</a><br/><a href="/dok2">Drucksache 20/2</a>';
      const result = parseTopicDetail(html);
      expect(result.lines).toHaveLength(2);
      expect(result.documents).toHaveLength(2);
      expect(result.documents).toContain('https://www.bundestag.de/dok1');
      expect(result.documents).toContain('https://www.bundestag.de/dok2');
    });

    it('should handle real-world example', () => {
      const html = `Aktuelle Stunde<br/>auf Verlangen der Fraktion der CDU/CSU<br/>Wirtschaftspolitik der Bundesregierung<br/><a href="/dokumente/textarchiv/2025/kw46-de-aktuelle-stunde-1117316">Zu den Reden</a>`;
      const result = parseTopicDetail(html);

      expect(result.lines).toContain('Aktuelle Stunde');
      expect(result.lines).toContain('auf Verlangen der Fraktion der CDU/CSU');
      expect(result.lines).toContain('Wirtschaftspolitik der Bundesregierung');
      expect(result.lines).toContain('Zu den Reden');
      expect(result.documents).toContain(
        'https://www.bundestag.de/dokumente/textarchiv/2025/kw46-de-aktuelle-stunde-1117316',
      );
    });

    it('should drop malformed and non-Bundestag links', () => {
      const html = [
        '<a href="https://example.com/dokumente/drucksache-20-12345">Extern</a>',
        '<a href="javascript:alert(1)">Bad</a>',
        '<a href="/dokumente/drucksache-20-12345">Bundestag</a>',
      ].join('<br/>');

      const result = parseTopicDetail(html);

      expect(result.documents).toEqual(['https://www.bundestag.de/dokumente/drucksache-20-12345']);
    });

    it('should keep dserver document links through normalization', () => {
      const html = '<a href="https://dserver.bundestag.de/btd/21/001/2100123.pdf">Drucksache 21/123</a>';

      const result = parseTopicDetail(html);

      expect(result.lines).toContain('Drucksache 21/123');
      expect(result.documents).toEqual(['https://www.bundestag.de/btd/21/001/2100123.pdf']);
    });
  });

  describe('parseStatusDetail', () => {
    it('should parse empty string', () => {
      const result = parseStatusDetail('');
      expect(result).toEqual({ lines: [], documents: [] });
    });

    it('should parse simple status text', () => {
      const html = 'angenommen';
      const result = parseStatusDetail(html);
      expect(result.lines).toContain('angenommen');
      expect(result.documents).toHaveLength(0);
    });

    it('should parse multi-line status', () => {
      const html = 'angenommen<br/>Ja: 350<br/>Nein: 200<br/>Enthaltungen: 50';
      const result = parseStatusDetail(html);
      expect(result.lines.length).toBeGreaterThan(0);
      expect(result.lines.join(' ')).toContain('angenommen');
      expect(result.lines.join(' ')).toContain('350');
    });

    it('should handle voting results format', () => {
      const html = `angenommen<br/>in namentlicher Abstimmung mit 520 gegen 97 Stimmen bei 5 Enthaltungen`;
      const result = parseStatusDetail(html);

      expect(result.lines.join(' ')).toContain('angenommen');
      expect(result.lines.join(' ')).toContain('namentlicher Abstimmung');
      expect(result.lines.join(' ')).toContain('520');
      expect(result.lines.join(' ')).toContain('97');
    });
  });
});
