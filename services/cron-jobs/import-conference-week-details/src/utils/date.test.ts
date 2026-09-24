import { describe, it, expect } from 'vitest';
import { getCurrentISOWeek, getNextISOWeek, getLastISOWeekOfYear } from './date';

describe('getCurrentISOWeek', () => {
  it('returns correct week for a known Monday', () => {
    // 2025-W46 starts on Monday 10 Nov 2025
    expect(getCurrentISOWeek(new Date('2025-11-10'))).toEqual({ year: 2025, week: 46 });
  });

  it('returns correct week for a Sunday at the end of the same week', () => {
    // Sunday 16 Nov 2025 is still W46
    expect(getCurrentISOWeek(new Date('2025-11-16'))).toEqual({ year: 2025, week: 46 });
  });

  it('handles year rollover: 2025-12-29 is W01 of 2026', () => {
    expect(getCurrentISOWeek(new Date('2025-12-29'))).toEqual({ year: 2026, week: 1 });
  });

  it('handles year rollover: 2020-12-31 is W53 of 2020', () => {
    expect(getCurrentISOWeek(new Date('2020-12-31'))).toEqual({ year: 2020, week: 53 });
  });

  it('returns a year close to the current calendar year when called without args', () => {
    const { year, week } = getCurrentISOWeek();
    const currentYear = new Date().getFullYear();
    expect(year).toBeGreaterThanOrEqual(currentYear - 1);
    expect(year).toBeLessThanOrEqual(currentYear + 1);
    expect(week).toBeGreaterThanOrEqual(1);
    expect(week).toBeLessThanOrEqual(53);
  });
});

describe('getLastISOWeekOfYear', () => {
  it('returns 52 for most years', () => {
    expect(getLastISOWeekOfYear(2023)).toBe(52);
    expect(getLastISOWeekOfYear(2024)).toBe(52);
  });

  it('returns 53 for long years (e.g. 2020, 2015)', () => {
    expect(getLastISOWeekOfYear(2020)).toBe(53);
    expect(getLastISOWeekOfYear(2015)).toBe(53);
  });
});

describe('getNextISOWeek', () => {
  it('advances by one week within the same year', () => {
    expect(getNextISOWeek(2025, 1)).toEqual({ year: 2025, week: 2 });
    expect(getNextISOWeek(2025, 45)).toEqual({ year: 2025, week: 46 });
  });

  it('rolls over to week 1 of the next year at a 52-week year boundary', () => {
    // 2024 has 52 weeks
    expect(getNextISOWeek(2024, 52)).toEqual({ year: 2025, week: 1 });
  });

  it('rolls over to week 1 of the next year at a 53-week year boundary', () => {
    // 2020 has 53 weeks
    expect(getNextISOWeek(2020, 53)).toEqual({ year: 2021, week: 1 });
  });
});
