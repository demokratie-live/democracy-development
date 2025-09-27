import { describe, it, expect } from 'vitest';
import { buildConferenceWeekUrl, getUrlDataSource } from './url-builder';
import { AppConfig } from '../config';

describe('URL Builder', () => {
  const mockConfig: AppConfig = {
    conference: {
      year: 2025,
      week: 39,
      limit: 10,
    },
    crawl: {
      maxRequestsPerCrawl: 10,
    },
    db: {
      url: 'mongodb://localhost:27017/bundestagio',
    },
    runtime: {
      isTest: true,
    },
    dataSource: {
      type: 'html',
    },
  };

  describe('buildConferenceWeekUrl', () => {
    it('should build HTML URL when dataSource is html', () => {
      const result = buildConferenceWeekUrl(mockConfig);
      expect(result).toBe(
        'https://www.bundestag.de/apps/plenar/plenar/conferenceweekDetail.form?year=2025&week=39&limit=10',
      );
    });

    it('should build JSON URL when dataSource is json', () => {
      const jsonConfig = { ...mockConfig, dataSource: { type: 'json' as const } };
      const result = buildConferenceWeekUrl(jsonConfig);
      expect(result).toBe('https://www.bundestag.de/apps/plenar/plenar/conferenceWeekJSON?year=2025&week=39');
    });

    it('should use custom year and week when provided', () => {
      const result = buildConferenceWeekUrl(mockConfig, 2024, 12);
      expect(result).toBe(
        'https://www.bundestag.de/apps/plenar/plenar/conferenceweekDetail.form?year=2024&week=12&limit=10',
      );
    });

    it('should not include limit parameter for JSON endpoint', () => {
      const jsonConfig = { ...mockConfig, dataSource: { type: 'json' as const } };
      const result = buildConferenceWeekUrl(jsonConfig);
      expect(result).not.toContain('limit=');
      expect(result).toBe('https://www.bundestag.de/apps/plenar/plenar/conferenceWeekJSON?year=2025&week=39');
    });
  });

  describe('getUrlDataSource', () => {
    it('should detect HTML URL', () => {
      const url = 'https://www.bundestag.de/apps/plenar/plenar/conferenceweekDetail.form?year=2025&week=39';
      expect(getUrlDataSource(url)).toBe('html');
    });

    it('should detect JSON URL', () => {
      const url = 'https://www.bundestag.de/apps/plenar/plenar/conferenceWeekJSON?year=2025&week=39';
      expect(getUrlDataSource(url)).toBe('json');
    });

    it('should throw error for unknown URL format', () => {
      const url = 'https://www.bundestag.de/unknown-endpoint';
      expect(() => getUrlDataSource(url)).toThrow('Unknown URL format');
    });
  });
});
