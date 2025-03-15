import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ConferenceWeekDetail } from './types';

// Mock the main and routes modules
const mockMain = vi.fn();
const mockGetResults = vi.fn();

// Mock the Crawlee log module
const mockLogInfo = vi.fn();
const mockLogError = vi.fn();

vi.mock('./main.js', () => ({
  main: mockMain,
}));

vi.mock('./routes.js', () => ({
  getResults: mockGetResults,
}));

vi.mock('crawlee', () => ({
  log: {
    setLevel: vi.fn(),
    info: mockLogInfo,
    error: mockLogError,
    LEVELS: { DEBUG: 0, INFO: 1, WARNING: 2, ERROR: 3 },
  },
}));

// Mock process.exit for testing
const mockProcessExit = vi.spyOn(process, 'exit').mockImplementation((code) => code as never);

describe('Main Process', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful crawling', async () => {
    const mockData: readonly ConferenceWeekDetail[] = [
      {
        url: '/apps/plenar/plenar/conferenceweekDetail.form?year=2024&week=1',
        year: 2024,
        week: 1,
        sessions: [],
        previousWeek: { year: 2024, week: 52 },
        nextWeek: { year: 2024, week: 2 },
      },
    ];

    // Setup mocks
    mockMain.mockResolvedValueOnce({
      processedRequests: 10,
      failedRequests: 0,
      retryRequests: 0,
    });
    mockGetResults.mockReturnValueOnce(mockData);

    // Import the module under test after mocks are set up
    const { run } = await import('./index');
    await run();

    // Verify expectations
    expect(mockMain).toHaveBeenCalled();
    expect(mockGetResults).toHaveBeenCalled();
    expect(mockLogInfo).toHaveBeenCalledWith('Fetched conference weeks:', mockData);
    expect(mockLogError).not.toHaveBeenCalled();
    expect(mockProcessExit).not.toHaveBeenCalled();
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network error occurred');
    mockMain.mockRejectedValueOnce(networkError);

    const { run } = await import('./index');
    await run();

    expect(mockLogError).toHaveBeenNthCalledWith(1, 'Error while importing conference week details (NETWORK_ERROR):', {
      message: 'Network error occurred',
    });
    expect(mockLogError).toHaveBeenNthCalledWith(2, 'Original error:', { error: networkError });
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it('should handle unknown errors', async () => {
    const unknownError = 'Unexpected error';
    mockMain.mockRejectedValueOnce(unknownError);

    const { run } = await import('./index');
    await run();

    expect(mockLogError).toHaveBeenNthCalledWith(1, 'Error while importing conference week details (UNKNOWN_ERROR):', {
      error: 'Unexpected error',
    });
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });
});
