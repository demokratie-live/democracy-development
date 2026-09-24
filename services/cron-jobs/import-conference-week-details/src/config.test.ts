import { describe, it, expect } from 'vitest';
import { buildConfigFrom, config, defaults, getISOWeekForDate } from './config.js';

describe('config', () => {
  it('provides default values when env not set', () => {
    expect(config.conference.year).toBe(defaults.CONFERENCE_YEAR);
    expect(config.conference.week).toBe(defaults.CONFERENCE_WEEK);
    expect(config.conference.limit).toBe(defaults.CONFERENCE_LIMIT);
    expect(config.crawl.maxRequestsPerCrawl).toBe(defaults.CRAWL_MAX_REQUESTS_PER_CRAWL);
    expect(typeof config.db.url).toBe('string');
  });

  it('overrides values from environment via buildConfigFrom', () => {
    const custom = buildConfigFrom({
      CONFERENCE_YEAR: '2030',
      CONFERENCE_WEEK: '12',
      CONFERENCE_LIMIT: '25',
      CRAWL_MAX_REQUESTS_PER_CRAWL: '42',
      TEST: '1',
      DB_URL: 'mongodb://example/db',
    });
    expect(custom.conference.year).toBe(2030);
    expect(custom.conference.week).toBe(12);
    expect(custom.conference.limit).toBe(25);
    expect(custom.crawl.maxRequestsPerCrawl).toBe(42);
    expect(custom.runtime.isTest).toBe(true);
    expect(custom.db.url).toBe('mongodb://example/db');
  });

  it('throws on invalid integer', () => {
    expect(() => buildConfigFrom({ CONFERENCE_WEEK: 'not-a-number' })).toThrow(/Invalid integer/);
  });

  it('is immutable', () => {
    expect(Object.isFrozen(config)).toBe(true);
    const originalWeek = config.conference.week;
    try {
      (config.conference as unknown as { week: number }).week = originalWeek + 1000;
    } catch {
      // ignore
    }
    // Value must remain unchanged
    expect(config.conference.week).toBe(originalWeek);
  });
});

describe('getISOWeekForDate', () => {
  it('returns the correct week for a mid-year Monday', () => {
    // 2025-03-10 is a Monday in week 11
    expect(getISOWeekForDate(new Date('2025-03-10T00:00:00Z'))).toEqual({ year: 2025, week: 11 });
  });

  it('returns the correct week for a mid-year Friday', () => {
    // 2025-03-14 is a Friday, still in week 11
    expect(getISOWeekForDate(new Date('2025-03-14T00:00:00Z'))).toEqual({ year: 2025, week: 11 });
  });

  it('handles year-end: last days of 2024 belong to ISO year 2025 week 1', () => {
    // 2024-12-30 (Monday) is in ISO week 1 of 2025
    expect(getISOWeekForDate(new Date('2024-12-30T00:00:00Z'))).toEqual({ year: 2025, week: 1 });
  });

  it('handles year-start: Jan 1 of 2021 belongs to ISO year 2020 week 53', () => {
    // 2021-01-01 (Friday) is in the last ISO week of 2020
    expect(getISOWeekForDate(new Date('2021-01-01T00:00:00Z'))).toEqual({ year: 2020, week: 53 });
  });

  it('defaults use the current date and produce sensible values', () => {
    const { year, week } = getISOWeekForDate();
    expect(year).toBeGreaterThanOrEqual(2025);
    expect(week).toBeGreaterThanOrEqual(1);
    expect(week).toBeLessThanOrEqual(53);
  });
});
