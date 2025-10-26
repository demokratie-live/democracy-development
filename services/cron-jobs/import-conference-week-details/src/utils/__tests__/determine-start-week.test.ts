import { describe, it, expect, vi, beforeEach } from 'vitest';
import { determineStartWeek, CONSTANTS } from '../determine-start-week';
import { ConferenceWeekDetailModel } from '@democracy-deutschland/bundestagio-common';

// Mock the model
vi.mock('@democracy-deutschland/bundestagio-common', () => ({
  ConferenceWeekDetailModel: {
    find: vi.fn(),
  },
}));

describe('determineStartWeek', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return current week in test mode', async () => {
    const result = await determineStartWeek(true, false);

    expect(result).toHaveProperty('week');
    expect(result).toHaveProperty('year');
    expect(result.year).toBe(2025);
    expect(result.week).toBeGreaterThan(0);
    expect(result.week).toBeLessThanOrEqual(53);
  });

  it('should return current week when database is empty', async () => {
    vi.mocked(ConferenceWeekDetailModel.find).mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    } as any);

    const result = await determineStartWeek(false, false);

    expect(result).toHaveProperty('week');
    expect(result).toHaveProperty('year');
    expect(result.year).toBe(2025);
  });

  it('should find last 3 conference weeks with sessions in normal mode', async () => {
    const conferenceWeeks = [
      { thisYear: 2025, thisWeek: 42 },
      { thisYear: 2025, thisWeek: 41 },
      { thisYear: 2025, thisWeek: 38 },
    ];

    vi.mocked(ConferenceWeekDetailModel.find).mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(conferenceWeeks),
    } as any);

    const result = await determineStartWeek(false, false);

    // Should start from oldest of last 3 weeks with sessions = week 38
    expect(result.year).toBe(2025);
    expect(result.week).toBe(38);
  });

  it('should not go before legislature start', async () => {
    const conferenceWeeks = [
      { thisYear: 2025, thisWeek: 36 }, // Before legislature start
    ];

    vi.mocked(ConferenceWeekDetailModel.find).mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(conferenceWeeks),
    } as any);

    const result = await determineStartWeek(false, false);

    // Should clamp to legislature start (37)
    expect(result.year).toBe(CONSTANTS.LEGISLATURE_START_YEAR);
    expect(result.week).toBe(CONSTANTS.LEGISLATURE_START_WEEK);
  });

  it('should return current week in full crawl mode', async () => {
    // Full crawl mode should NOT query database
    const result = await determineStartWeek(false, true);

    // Should return current week
    expect(result.year).toBe(2025);
    expect(result.week).toBeGreaterThan(0);
    expect(result.week).toBeLessThanOrEqual(53);
  });

  it('should fall back to current week on error', async () => {
    vi.mocked(ConferenceWeekDetailModel.find).mockImplementation(() => {
      throw new Error('Database error');
    });

    const result = await determineStartWeek(false, false);

    expect(result).toHaveProperty('week');
    expect(result).toHaveProperty('year');
    expect(result.year).toBe(2025);
  });

  it('should find weeks with non-empty sessions array only', async () => {
    const conferenceWeeks = [
      { thisYear: 2025, thisWeek: 42 },
      { thisYear: 2025, thisWeek: 39 },
    ];

    vi.mocked(ConferenceWeekDetailModel.find).mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(conferenceWeeks),
    } as any);

    const result = await determineStartWeek(false, false);

    // Should use weeks that have sessions
    expect(result.year).toBe(2025);
    expect(result.week).toBe(39); // Oldest of returned weeks
  });
});
