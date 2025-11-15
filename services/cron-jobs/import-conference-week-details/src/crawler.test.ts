import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { crawlConferenceWeeks } from './crawler';

// Mock the JSON fetcher
vi.mock('./services/json-fetcher', () => ({
  fetchConferenceWeeks: vi.fn().mockResolvedValue([
    {
      data: {
        next: null,
        previous: null,
        conferences: [],
      },
      year: 2024,
      week: 20,
    },
    {
      data: {
        next: null,
        previous: null,
        conferences: [],
      },
      year: 2024,
      week: 21,
    },
  ]),
}));

// Mock the JSON-to-session mapper
vi.mock('./services/json-to-session-mapper', () => ({
  mapJSONToConferenceWeekDetail: vi.fn().mockImplementation((_data, year, week) => ({
    id: `${year}-${week}`,
    thisYear: year,
    thisWeek: week,
    sessions: [],
  })),
}));

// Mock vote detection
vi.mock('./utils/vote-detection', () => ({
  getProcedureIds: vi.fn().mockResolvedValue([]),
}));

describe('Crawler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return conference week details from crawlConferenceWeeks', async () => {
    const results = await crawlConferenceWeeks();

    // Check that we got the expected results
    expect(results).toHaveLength(2);
    expect(results[0].thisYear).toBe(2024);
    expect(results[0].thisWeek).toBe(20);
    expect(results[1].thisYear).toBe(2024);
    expect(results[1].thisWeek).toBe(21);
  });
});
