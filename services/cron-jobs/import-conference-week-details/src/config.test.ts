import { describe, it, expect } from 'vitest';
import { buildConfigFrom, config, defaults } from './config.js';

describe('config', () => {
  it('provides default values when env not set', () => {
    expect(config.conference.year).toBe(defaults.CONFERENCE_YEAR);
    expect(config.conference.week).toBe(defaults.CONFERENCE_WEEK);
    expect(config.conference.limit).toBe(defaults.CONFERENCE_LIMIT);
    expect(config.runtime.fullCrawl).toBe(defaults.FULL_CRAWL);
    // Note: config.runtime.isTest will be true when running via vitest
    expect(typeof config.runtime.isTest).toBe('boolean');
    expect(typeof config.db.url).toBe('string');
  });

  it('overrides values from environment via buildConfigFrom', () => {
    const custom = buildConfigFrom({
      CONFERENCE_YEAR: '2030',
      CONFERENCE_WEEK: '12',
      CONFERENCE_LIMIT: '25',
      FULL_CRAWL: 'true',
      TEST: '1',
      DB_URL: 'mongodb://example/db',
    });
    expect(custom.conference.year).toBe(2030);
    expect(custom.conference.week).toBe(12);
    expect(custom.conference.limit).toBe(25);
    expect(custom.runtime.fullCrawl).toBe(true);
    expect(custom.runtime.isTest).toBe(true);
    expect(custom.db.url).toBe('mongodb://example/db');
  });

  it('throws on invalid integer', () => {
    expect(() => buildConfigFrom({ CONFERENCE_WEEK: 'not-a-number' })).toThrow(/Invalid integer/);
  });

  it('parses FULL_CRAWL as boolean correctly', () => {
    expect(buildConfigFrom({ FULL_CRAWL: 'true' }).runtime.fullCrawl).toBe(true);
    expect(buildConfigFrom({ FULL_CRAWL: '1' }).runtime.fullCrawl).toBe(true);
    expect(buildConfigFrom({ FULL_CRAWL: 'false' }).runtime.fullCrawl).toBe(false);
    expect(buildConfigFrom({ FULL_CRAWL: '0' }).runtime.fullCrawl).toBe(false);
    expect(buildConfigFrom({ FULL_CRAWL: undefined }).runtime.fullCrawl).toBe(false);
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
