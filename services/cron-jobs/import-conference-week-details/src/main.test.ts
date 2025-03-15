import { describe, it, expect, vi, beforeEach } from 'vitest';
import { main } from './main';
import { crawlConferenceWeeks } from './crawler';

// Mock the crawler module
vi.mock('./crawler', () => ({
  crawlConferenceWeeks: vi.fn().mockResolvedValue([
    {
      url: '/apps/plenar/plenar/conferenceweekDetail.form?year=2024&week=20',
      year: 2024,
      week: 20,
      sessions: [],
    },
    {
      url: '/apps/plenar/plenar/conferenceweekDetail.form?year=2024&week=21',
      year: 2024,
      week: 21,
      sessions: [],
    },
  ]),
  createCrawler: vi.fn(),
}));

// Mock Crawlee modules
vi.mock('crawlee', async () => {
  return {
    RequestQueue: {
      open: vi.fn().mockResolvedValue({
        addRequest: vi.fn().mockResolvedValue(undefined),
      }),
    },
    CheerioCrawler: vi.fn().mockImplementation(() => ({
      run: vi.fn(),
    })),
    log: {
      setLevel: vi.fn(),
      debug: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
      error: vi.fn(),
      LEVELS: { DEBUG: 0, INFO: 1, WARNING: 2, ERROR: 3 },
    },
  };
});

describe('Crawler Main Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes the crawler and processes requests', async () => {
    // Run the main function
    const results = await main();

    // Check that crawlConferenceWeeks was called
    expect(crawlConferenceWeeks).toHaveBeenCalled();

    // Check that we got the expected results
    expect(results).toHaveLength(2);
    expect(results[0].year).toBe(2024);
    expect(results[0].week).toBe(20);
    expect(results[1].year).toBe(2024);
    expect(results[1].week).toBe(21);
  });
});
