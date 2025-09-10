import { describe, it, expect } from 'vitest';
import { buildConfigFrom, config, defaults } from './config.js';

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
