import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { getISOWeeksInYear, getNextISOWeek, fetchConferenceWeeks } from './json-fetcher';

// Mock crawlee logger
vi.mock('crawlee', () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    setLevel: vi.fn(),
    LEVELS: { INFO: 'info' },
  },
}));

// Mock axios so no real network requests are made
vi.mock('axios');
const mockedAxiosGet = vi.fn();
vi.mocked(axios).get = mockedAxiosGet;
vi.mocked(axios).isAxiosError = <T = unknown, D = unknown>(err: unknown): err is import('axios').AxiosError<T, D> =>
  typeof err === 'object' && err !== null && 'isAxiosError' in err;

// ---------------------------------------------------------------------------
// getISOWeeksInYear
// ---------------------------------------------------------------------------
describe('getISOWeeksInYear', () => {
  it('returns 52 for a regular year (2023)', () => {
    expect(getISOWeeksInYear(2023)).toBe(52);
  });

  it('returns 53 for a long year (2020)', () => {
    // 2020: Dec 31 is Thursday → 53 weeks
    expect(getISOWeeksInYear(2020)).toBe(53);
  });

  it('returns 53 for 2015 (Jan 1 is Thursday)', () => {
    expect(getISOWeeksInYear(2015)).toBe(53);
  });
});

// ---------------------------------------------------------------------------
// getNextISOWeek
// ---------------------------------------------------------------------------
describe('getNextISOWeek', () => {
  it('advances to the next week in the same year', () => {
    expect(getNextISOWeek(2025, 10)).toEqual({ year: 2025, week: 11 });
  });

  it('wraps to week 1 of the next year after the last week of a 52-week year', () => {
    expect(getNextISOWeek(2023, 52)).toEqual({ year: 2024, week: 1 });
  });

  it('wraps to week 1 of the next year after week 53 of a 53-week year', () => {
    expect(getNextISOWeek(2020, 53)).toEqual({ year: 2021, week: 1 });
  });

  it('stays in the same year after week 52 of a 53-week year', () => {
    expect(getNextISOWeek(2020, 52)).toEqual({ year: 2020, week: 53 });
  });
});

// ---------------------------------------------------------------------------
// fetchConferenceWeeks – skip-week behaviour
// ---------------------------------------------------------------------------

const emptyWeekResponse = {
  status: 200,
  data: { next: null, previous: null, conferences: [] },
};

const weekWithNextResponse = {
  status: 200,
  data: {
    next: { year: 2026, week: 7 },
    previous: null,
    conferences: [{ conferenceNumber: 1, conferenceDate: { date: '9. Februar 2026' }, rows: [] }],
  },
};

const weekNoNextResponse = {
  status: 200,
  data: {
    next: null,
    previous: null,
    conferences: [{ conferenceNumber: 2, conferenceDate: { date: '16. Februar 2026' }, rows: [] }],
  },
};

describe('fetchConferenceWeeks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns results for weeks that have sessions', async () => {
    mockedAxiosGet
      .mockResolvedValueOnce(weekWithNextResponse) // week 6 → has data, next = week 7
      .mockResolvedValueOnce(weekNoNextResponse); // week 7 → has data, no next

    const results = await fetchConferenceWeeks({ year: 2026, week: 6 }, 5);

    expect(results).toHaveLength(2);
    expect(results[0].week).toBe(6);
    expect(results[1].week).toBe(7);
  });

  it('skips a week that returns 404 and fetches the next week', async () => {
    mockedAxiosGet
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 404 } }) // week 5 → 404
      .mockResolvedValueOnce(weekNoNextResponse); // week 6 → has data, no next

    const results = await fetchConferenceWeeks({ year: 2026, week: 5 }, 5);

    expect(results).toHaveLength(1);
    expect(results[0].week).toBe(6);
    expect(mockedAxiosGet).toHaveBeenCalledTimes(2);
  });

  it('skips multiple consecutive weeks without sessions', async () => {
    mockedAxiosGet
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 404 } }) // week 5 → 404
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 404 } }) // week 6 → 404
      .mockResolvedValueOnce(weekNoNextResponse); // week 7 → has data, no next

    const results = await fetchConferenceWeeks({ year: 2026, week: 5 }, 5);

    expect(results).toHaveLength(1);
    expect(results[0].week).toBe(7);
  });

  it('returns empty array if all weeks within limit are unavailable', async () => {
    mockedAxiosGet.mockRejectedValue({ isAxiosError: true, response: { status: 404 } });

    const results = await fetchConferenceWeeks({ year: 2026, week: 5 }, 3);

    expect(results).toHaveLength(0);
    expect(mockedAxiosGet).toHaveBeenCalledTimes(3);
  });

  it('stops when there is no next week available', async () => {
    mockedAxiosGet.mockResolvedValueOnce(emptyWeekResponse);

    const results = await fetchConferenceWeeks({ year: 2026, week: 6 }, 5);

    expect(results).toHaveLength(1);
    expect(mockedAxiosGet).toHaveBeenCalledTimes(1);
  });
});
