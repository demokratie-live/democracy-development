import { describe, it, expect, vi } from 'vitest';
import cheerio from 'cheerio';
import { extractSessionInfo } from '../session-parser';
import * as topicParser from '../topic-parser';

describe('Session Parser', () => {
  describe('extractSessionInfo', () => {
    it('should handle invalid title format gracefully', () => {
      const html = `
        <div class="bt-conference-title">Invalid Format</div>
      `;
      const $ = cheerio.load(html);
      const result = extractSessionInfo($);
      expect(result).toHaveLength(0);
    });

    it('should extract session information from table captions', () => {
      const html = `
        <table class="bt-table-data">
          <caption>
            <div class="bt-conference-title">12. Oktober 2022 (59. Sitzung)</div>
          </caption>
        </table>
      `;
      // Mock the extractTopItems function to isolate the test
      const mockExtractTopItems = vi.spyOn(topicParser, 'extractTopItems').mockReturnValue([]);
      const $ = cheerio.load(html);
      const result = extractSessionInfo($);
      expect(result).toHaveLength(1);
      expect(mockExtractTopItems).toHaveBeenCalled();
      mockExtractTopItems.mockRestore();
    });
  });
});
