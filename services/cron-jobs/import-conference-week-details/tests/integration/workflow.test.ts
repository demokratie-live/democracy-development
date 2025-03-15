import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CheerioCrawler, Configuration } from 'crawlee';
import { crawlConferenceWeeks } from '../../src/crawler';

// Mock Crawlee
vi.mock('crawlee', () => {
  // Create a minimal mock that satisfies CheerioCrawler interface
  const createCrawlerMock = (overrides = {}) => {
    const baseMock = {
      run: vi.fn().mockResolvedValue(undefined),
      _parseHTML: vi.fn(),
      _parseHtmlToDom: vi.fn(),
      _runRequestHandler: vi.fn(),
      config: {
        storageManagers: new Map(),
        get: vi.fn(),
      } satisfies Partial<Configuration>,
      ...overrides,
    } as unknown as CheerioCrawler;
    return baseMock;
  };

  // Create a mock router with the needed methods
  const mockRouter = {
    addHandler: vi.fn(),
    addDefaultHandler: vi.fn(),
  };

  return {
    CheerioCrawler: vi.fn().mockImplementation(createCrawlerMock),
    RequestQueue: {
      open: vi.fn().mockResolvedValue({
        addRequests: vi.fn().mockResolvedValue({ processedRequests: [], unprocessedRequests: [] }),
        addRequest: vi.fn().mockResolvedValue({}),
      }),
    },
    // Add this missing export that's used in routes.ts
    createCheerioRouter: vi.fn().mockReturnValue(mockRouter),
    log: {
      debug: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
      error: vi.fn(),
      LEVELS: { DEBUG: 0, INFO: 1, WARNING: 2, ERROR: 3 },
      setLevel: vi.fn(),
    },
  };
});

// Also mock the routes module
vi.mock('../../src/routes', () => {
  return {
    router: {
      addHandler: vi.fn(),
      addDefaultHandler: vi.fn(),
    },
    getResults: vi.fn().mockReturnValue([
      {
        url: '/apps/plenar/plenar/conferenceweekDetail.form?year=2025&week=8',
        year: 2025,
        week: 8,
        previousWeek: {
          year: 2025,
          week: 7,
        },
        nextWeek: {
          year: 2025,
          week: 9,
        },
        sessions: [],
      },
    ]),
    resetForTests: vi.fn(),
  };
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

describe('Conference Week Import Integration', () => {
  it('should handle empty or invalid HTML gracefully', async () => {
    const results = await crawlConferenceWeeks({ maxRequestsPerCrawl: 1 });
    expect(results).toHaveLength(1);
  });

  it('should process full workflow with navigation data', async () => {
    // Since we're now using a router-based approach, we don't need to capture handlers
    const mockCrawler = {
      run: vi.fn().mockResolvedValue({
        requestsFinished: 1,
        requestsFailed: 0,
        retryHistogram: [1],
      }),
      config: {
        storageManagers: new Map(),
        get: vi.fn(),
      },
    } as unknown as CheerioCrawler;

    vi.mocked(CheerioCrawler).mockImplementation(() => mockCrawler);

    const results = await crawlConferenceWeeks({ maxRequestsPerCrawl: 1 });

    // Check that the crawler.run method was called
    expect(mockCrawler.run).toHaveBeenCalled();

    // Verify we get the expected results from the routes module
    expect(results).toEqual([
      {
        url: '/apps/plenar/plenar/conferenceweekDetail.form?year=2025&week=8',
        year: 2025,
        week: 8,
        previousWeek: {
          year: 2025,
          week: 7,
        },
        nextWeek: {
          year: 2025,
          week: 9,
        },
        sessions: [],
      },
    ]);
  });

  it('should handle network errors gracefully', async () => {
    const mockError = new Error('Network error');
    const mockCrawler = {
      run: vi.fn().mockRejectedValue(mockError),
      _parseHTML: vi.fn(),
      _parseHtmlToDom: vi.fn(),
      _runRequestHandler: vi.fn(),
      config: {
        storageManagers: new Map(),
        get: vi.fn(),
      } satisfies Partial<Configuration>,
    } as unknown as CheerioCrawler;

    vi.mocked(CheerioCrawler).mockImplementationOnce(() => mockCrawler);
    await expect(crawlConferenceWeeks({ maxRequestsPerCrawl: 1 })).rejects.toThrow('Network error');
  });
});
