import { describe, it, expect } from 'vitest';
import cheerio from 'cheerio';
import { isValidConferenceWeekUrl, getEntryPageUrl, extractEntryUrls } from '../url-parser';

describe('URL Parser', () => {
  describe('isValidConferenceWeekUrl', () => {
    it('should validate conference week URLs with valid input', () => {
      expect(isValidConferenceWeekUrl('/apps/plenar/plenar/conferenceweekDetail.form?year=2024&week=8')).toBe(true);
    });

    it('should reject invalid conference week URLs', () => {
      expect(isValidConferenceWeekUrl('/invalid/url')).toBe(false);
    });

    it('should handle null input gracefully', () => {
      expect(isValidConferenceWeekUrl(null)).toBe(false);
    });

    it('should handle undefined input gracefully', () => {
      expect(isValidConferenceWeekUrl(undefined)).toBe(false);
    });
  });

  describe('getEntryPageUrl', () => {
    it('should extract entry page URL from element', () => {
      const html = '<div data-dataloader-url="/apps/plenar/plenar/conferenceweekDetail.form?year=2024&week=8"></div>';
      const $ = cheerio.load(html);
      const result = getEntryPageUrl($, $('div')[0]);
      expect(result).toBe('/apps/plenar/plenar/conferenceweekDetail.form?year=2024&week=8');
    });
  });

  describe('extractEntryUrls', () => {
    it('should extract entry URLs from main page', () => {
      const html = `
        <div class="bt-module-row-sitzungsablauf">
          <div data-dataloader-url="/apps/plenar/plenar/conferenceweekDetail.form?year=2024&week=8"></div>
          <div data-dataloader-url="/invalid/url"></div>
        </div>
      `;
      const $ = cheerio.load(html);
      const result = extractEntryUrls($);
      expect(result).toEqual(['/apps/plenar/plenar/conferenceweekDetail.form?year=2024&week=8']);
    });

    it('should extract URL directly from main element when available', () => {
      const html = `
        <div class="bt-module-row-sitzungsablauf" data-dataloader-url="/apps/plenar/plenar/conferenceweekDetail.form?year=2024&week=9">
          <div data-dataloader-url="/apps/plenar/plenar/conferenceweekDetail.form?year=2024&week=8"></div>
        </div>
      `;
      const $ = cheerio.load(html);
      const result = extractEntryUrls($);
      expect(result).toEqual(['/apps/plenar/plenar/conferenceweekDetail.form?year=2024&week=9']);
    });
  });
});
