import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import type { BundestagJSONResponse } from '../types-json';
import { fetchConferenceWeeks } from './json-fetcher';

// Mock axios at the module level so fetchConferenceWeek uses our fake HTTP responses.
vi.mock('axios');
const mockedAxiosGet = vi.mocked(axios.get);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function axiosOk(data: BundestagJSONResponse) {
  return Promise.resolve({ status: 200, data });
}

function makeResponse(overrides: Partial<BundestagJSONResponse> = {}): BundestagJSONResponse {
  return { conferences: [], next: null, previous: null, ...overrides };
}

/** Simulates an axios 404 error the way axios itself throws it. */
function axiosNotFound() {
  const error = Object.assign(new Error('Not Found'), {
    isAxiosError: true,
    response: { status: 404, statusText: 'Not Found' },
  });
  return Promise.reject(error);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('fetchConferenceWeeks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Make axios.isAxiosError work for our fake errors.
    vi.spyOn(axios, 'isAxiosError').mockImplementation((err): err is import('axios').AxiosError =>
      Boolean((err as { isAxiosError?: boolean }).isAxiosError),
    );
  });

  it('returns a single week when the API reports no next week', async () => {
    mockedAxiosGet.mockResolvedValueOnce({ status: 200, data: makeResponse({ next: null }) });

    const results = await fetchConferenceWeeks({ year: 2025, week: 10 });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ year: 2025, week: 10 });
  });

  it('follows next pointers returned by the API', async () => {
    mockedAxiosGet
      .mockResolvedValueOnce(axiosOk(makeResponse({ next: { year: 2025, week: 20 } })))
      .mockResolvedValueOnce(axiosOk(makeResponse({ next: null })));

    const results = await fetchConferenceWeeks({ year: 2025, week: 10 });

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ year: 2025, week: 10 });
    expect(results[1]).toMatchObject({ year: 2025, week: 20 });
    expect(mockedAxiosGet).toHaveBeenCalledTimes(2);
  });

  it('respects the limit parameter', async () => {
    // Return a chain of weeks that would never end without the limit.
    mockedAxiosGet.mockImplementation(async (url: string) => {
      const match = /year=(\d+)&week=(\d+)/.exec(url as string);
      const week = match ? Number(match[2]) : 1;
      return axiosOk(makeResponse({ next: { year: 2025, week: week + 1 } }));
    });

    const results = await fetchConferenceWeeks({ year: 2025, week: 1 }, 3);

    expect(results).toHaveLength(3);
    expect(mockedAxiosGet).toHaveBeenCalledTimes(3);
  });

  it('advances one week at a time on 404 and stops after MAX_LOOKAHEAD_WEEKS consecutive misses', async () => {
    // All weeks return 404.
    mockedAxiosGet.mockImplementation(() => axiosNotFound());

    const results = await fetchConferenceWeeks({ year: 2025, week: 10 });

    expect(results).toHaveLength(0);
    // MAX_LOOKAHEAD_WEEKS = 4 → should have attempted exactly 4 calls.
    expect(mockedAxiosGet).toHaveBeenCalledTimes(4);
  });

  it('resets consecutive-miss counter after a successful response', async () => {
    mockedAxiosGet
      // Week 10: 404 (miss 1)
      .mockImplementationOnce(() => axiosNotFound())
      // Week 11 (lookahead): success, no next
      .mockResolvedValueOnce(axiosOk(makeResponse({ next: null })));

    const results = await fetchConferenceWeeks({ year: 2025, week: 10 });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ year: 2025, week: 11 });
    expect(mockedAxiosGet).toHaveBeenCalledTimes(2);
  });
});
