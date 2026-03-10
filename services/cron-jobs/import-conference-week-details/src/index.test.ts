import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConferenceWeekDetail } from './types';

const {
  mockMain,
  mockLogInfo,
  mockLogError,
  mockMongoConnect,
  mockFindOneAndUpdate,
  mockUpdateProcedureVoteDates,
  mockConfig,
} = vi.hoisted(() => ({
  mockMain: vi.fn(),
  mockLogInfo: vi.fn(),
  mockLogError: vi.fn(),
  mockMongoConnect: vi.fn(),
  mockFindOneAndUpdate: vi.fn(),
  mockUpdateProcedureVoteDates: vi.fn(),
  mockConfig: {
    runtime: { isTest: true },
    db: { url: 'mongodb://localhost:27017/test' },
  },
}));

vi.mock('./main.js', () => ({
  main: mockMain,
}));

vi.mock('./config.js', () => ({
  config: mockConfig,
}));

vi.mock('./utils/update-vote-dates.js', () => ({
  updateProcedureVoteDates: mockUpdateProcedureVoteDates,
}));

vi.mock('crawlee', () => ({
  log: {
    setLevel: vi.fn(),
    info: mockLogInfo,
    error: mockLogError,
    LEVELS: { DEBUG: 0, INFO: 1, WARNING: 2, ERROR: 3 },
  },
}));

vi.mock('@democracy-deutschland/bundestagio-common', () => ({
  mongoConnect: mockMongoConnect,
  ConferenceWeekDetailModel: {
    findOneAndUpdate: mockFindOneAndUpdate,
  },
}));

const mockProcessExit = vi.spyOn(process, 'exit').mockImplementation((code) => code as never);

describe('Main Process', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockConfig.runtime.isTest = true;
    mockConfig.db.url = 'mongodb://localhost:27017/test';
    mockFindOneAndUpdate.mockResolvedValue(undefined);
    mockMongoConnect.mockResolvedValue(undefined);
    mockUpdateProcedureVoteDates.mockResolvedValue({
      conferenceWeekCount: 1,
      dateGroupCount: 1,
      attemptedProcedureCount: 1,
      matchedProcedureCount: 1,
      modifiedCount: 1,
      unmatchedProcedureCount: 0,
    });
  });

  it('should handle successful crawling in test mode', async () => {
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

    mockMain.mockResolvedValueOnce(mockData);

    const { run } = await import('./index');
    await run();

    expect(mockMain).toHaveBeenCalled();
    expect(mockLogInfo).toHaveBeenCalledWith('Fetched conference weeks:', { count: mockData.length });
    expect(mockMongoConnect).not.toHaveBeenCalled();
    expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
    expect(mockUpdateProcedureVoteDates).not.toHaveBeenCalled();
    expect(mockLogError).not.toHaveBeenCalled();
    expect(mockProcessExit).not.toHaveBeenCalled();
  });

  it('should log structured voteDate backfill results and exit successfully', async () => {
    mockConfig.runtime.isTest = false;
    const mockData = [
      {
        id: 'cw-2024-1',
        thisYear: 2024,
        thisWeek: 1,
        sessions: [],
      },
    ];
    const backfillResult = {
      conferenceWeekCount: 1,
      dateGroupCount: 1,
      attemptedProcedureCount: 2,
      matchedProcedureCount: 1,
      modifiedCount: 1,
      unmatchedProcedureCount: 1,
    };

    mockMain.mockResolvedValueOnce(mockData);
    mockUpdateProcedureVoteDates.mockResolvedValueOnce(backfillResult);

    const { run } = await import('./index');
    await run();

    expect(mockMongoConnect).toHaveBeenCalledWith('mongodb://localhost:27017/test');
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { id: 'cw-2024-1' },
      mockData[0],
      expect.objectContaining({
        upsert: true,
        new: true,
        runValidators: true,
      }),
    );
    expect(mockUpdateProcedureVoteDates).toHaveBeenCalledTimes(1);
    expect(mockLogInfo).toHaveBeenCalledWith('✅ VoteDate backfill summary', backfillResult);
    expect(mockProcessExit).toHaveBeenCalledWith(0);
  });

  it('should fail fast when voteDate backfill throws after save', async () => {
    mockConfig.runtime.isTest = false;
    mockMain.mockResolvedValueOnce([
      {
        id: 'cw-2024-1',
        thisYear: 2024,
        thisWeek: 1,
        sessions: [],
      },
    ]);
    mockUpdateProcedureVoteDates.mockRejectedValueOnce(new Error('voteDate update failed'));

    const { run } = await import('./index');
    await run();

    expect(mockFindOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(mockLogError).toHaveBeenCalledWith('❌ voteDate backfill failed after saving conference weeks:', {
      message: 'voteDate update failed',
    });
    expect(mockProcessExit).toHaveBeenCalledWith(1);
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
