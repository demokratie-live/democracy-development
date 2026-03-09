import { describe, it, expect } from 'vitest';
import { buildConfigFrom, config, defaults } from './config.js';

function getIsoWeekAndYear(date: Date): { year: number; week: number } {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return {
    year: utcDate.getUTCFullYear(),
    week,
  };
}

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
      VOTEDATE_RECOVERY_MODE: '1',
      TEST: '1',
      DB_URL: 'mongodb://example/db',
    });
    expect(custom.conference.year).toBe(2030);
    expect(custom.conference.week).toBe(12);
    expect(custom.conference.limit).toBe(25);
    expect(custom.crawl.maxRequestsPerCrawl).toBe(42);
    expect(custom.voteDateBackfill.recoveryMode).toBe(true);
    expect(custom.runtime.isTest).toBe(true);
    expect(custom.db.url).toBe('mongodb://example/db');
  });

  it('disables voteDate recovery mode by default', () => {
    const defaultConfig = buildConfigFrom({
      VOTEDATE_RECOVERY_MODE: undefined,
    });

    expect(defaultConfig.voteDateBackfill.recoveryMode).toBe(false);
  });

  it('throws on invalid integer', () => {
    expect(() => buildConfigFrom({ CONFERENCE_WEEK: 'not-a-number' })).toThrow(/Invalid integer/);
  });

  it('uses the current ISO week as default start when no conference env overrides are provided', () => {
    const expected = getIsoWeekAndYear(new Date());

    const dynamicDefault = buildConfigFrom({
      CONFERENCE_YEAR: undefined,
      CONFERENCE_WEEK: undefined,
    });

    expect(dynamicDefault.conference.year).toBe(expected.year);
    expect(dynamicDefault.conference.week).toBe(expected.week);
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
