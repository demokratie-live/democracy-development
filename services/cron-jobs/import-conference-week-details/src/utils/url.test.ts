import { describe, it, expect } from 'vitest';
import { parseUrlParams, processConferenceWeekDetailUrl } from './url';

describe('URL Processing', () => {
  describe('parseUrlParams', () => {
    it('should parse valid year and week parameters', () => {
      const result = parseUrlParams('?year=2024&week=8');
      expect(result).toEqual({ year: 2024, week: 8 });
    });

    it('should return null for missing parameters', () => {
      expect(parseUrlParams('?year=2024')).toBeNull();
      expect(parseUrlParams('?week=8')).toBeNull();
      expect(parseUrlParams('')).toBeNull();
    });

    it('should return null for invalid number formats', () => {
      expect(parseUrlParams('?year=invalid&week=8')).toBeNull();
      expect(parseUrlParams('?year=2024&week=invalid')).toBeNull();
    });

    it('should handle malformed URLs gracefully', () => {
      expect(parseUrlParams('invalid-url')).toBeNull();
      expect(parseUrlParams('?invalid-format')).toBeNull();
    });
  });

  describe('processConferenceWeekDetailUrl', () => {
    it('should process valid bundestag URLs', () => {
      const url = 'https://www.bundestag.de/apps/plenar/plenar/conferenceweekDetail.form?year=2024&week=8';
      const result = processConferenceWeekDetailUrl(url);
      expect(result).toEqual([
        {
          url: '/apps/plenar/plenar/conferenceweekDetail.form?year=2024&week=8',
          year: 2024,
          week: 8,
          sessions: [], // Add the sessions array to the expected result
        },
      ]);
    });

    it('should handle URLs without domain prefix', () => {
      const url = '/apps/plenar/plenar/conferenceweekDetail.form?year=2024&week=8';
      const result = processConferenceWeekDetailUrl(url);
      expect(result).toEqual([
        {
          url: '/apps/plenar/plenar/conferenceweekDetail.form?year=2024&week=8',
          year: 2024,
          week: 8,
          sessions: [], // Add the sessions array to the expected result
        },
      ]);
    });

    it('should return empty array for invalid URLs', () => {
      expect(processConferenceWeekDetailUrl('invalid-url')).toEqual([]);
      expect(processConferenceWeekDetailUrl('https://www.bundestag.de/invalid')).toEqual([]);
    });
  });
});
