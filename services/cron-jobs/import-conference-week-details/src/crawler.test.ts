import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCrawler, crawlConferenceWeeks } from './crawler';
import { resetForTests } from './routes';
import { RequestQueue } from 'crawlee';

// Mock crawlee
vi.mock('crawlee', async () => {
  // Use importActual to keep most of the functionality
  const actual = await vi.importActual('crawlee');

  return {
    ...actual,
    // Override CheerioCrawler with a mock implementation
    CheerioCrawler: vi.fn().mockImplementation(() => ({
      run: vi.fn().mockResolvedValue({
        requestsFinished: 5,
        requestsFailed: 0,
        retryHistogram: [0, 0, 0],
      }),
    })),
    RequestQueue: {
      open: vi.fn().mockResolvedValue({
        addRequest: vi.fn().mockResolvedValue({}),
        addRequests: vi.fn().mockResolvedValue({}),
      }),
    },
  };
});

// Mock router results
vi.mock('./routes.js', async () => {
  const actual = await vi.importActual('./routes.js');

  // Mock crawl results for testing
  const mockResults = [
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
  ];

  return {
    ...actual,
    getResults: vi.fn().mockReturnValue(mockResults),
    resetForTests: vi.fn(),
  };
});

describe('Crawler', () => {
  beforeEach(() => {
    // Reset any state between tests
    resetForTests();
  });

  afterEach(() => {
    // Clear all mocks after each test
    vi.clearAllMocks();
  });

  it('should create a properly configured crawler', async () => {
    const crawler = await createCrawler();
    expect(crawler).toBeDefined();

    // Verify that the crawler was created with the right configuration
    expect(vi.mocked(RequestQueue.open)).toHaveBeenCalled();
  });

  it('should return conference week details from crawlConferenceWeeks', async () => {
    const results = await crawlConferenceWeeks();

    // Check that we got the expected results
    expect(results).toHaveLength(2);
    expect(results[0].year).toBe(2024);
    expect(results[0].week).toBe(20);
    expect(results[1].year).toBe(2024);
    expect(results[1].week).toBe(21);
  });
});
