import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findMock, sortMock, limitMock, leanMock, updateManyMock, logInfoMock, mockConfig } = vi.hoisted(() => ({
  findMock: vi.fn(),
  sortMock: vi.fn(),
  limitMock: vi.fn(),
  leanMock: vi.fn(),
  updateManyMock: vi.fn(),
  logInfoMock: vi.fn(),
  mockConfig: {
    conference: {
      year: 2026,
      week: 12,
    },
    crawl: {
      maxRequestsPerCrawl: 10,
    },
    voteDateBackfill: {
      recoveryMode: false,
    },
  },
}));

vi.mock('../config.js', () => ({
  config: mockConfig,
}));

vi.mock('crawlee', () => ({
  log: {
    info: logInfoMock,
  },
}));

vi.mock('@democracy-deutschland/bundestagio-common', () => ({
  ConferenceWeekDetailModel: {
    find: findMock,
  },
  ProcedureModel: {
    updateMany: updateManyMock,
  },
}));

describe('fetchRecentConferenceWeeks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockConfig.conference.year = 2026;
    mockConfig.conference.week = 12;
    mockConfig.crawl.maxRequestsPerCrawl = 10;
    mockConfig.voteDateBackfill.recoveryMode = false;
    sortMock.mockReturnThis();
    limitMock.mockReturnThis();
    leanMock.mockResolvedValue([]);
    findMock.mockReturnValue({
      sort: sortMock,
      limit: limitMock,
      lean: leanMock,
    });
  });

  it('uses the configured crawl window so vote-date backfill can include the actual current week', async () => {
    const { fetchRecentConferenceWeeks } = await import('./update-vote-dates');

    await fetchRecentConferenceWeeks();

    expect(findMock).toHaveBeenCalledWith({
      sessions: { $exists: true, $not: { $size: 0 } },
    });
    expect(sortMock).toHaveBeenCalledWith({ thisYear: -1, thisWeek: -1 });
    expect(limitMock).toHaveBeenCalledWith(10);
  });

  it('uses an explicit bounded replay range when voteDate recovery mode is enabled', async () => {
    mockConfig.conference.year = 2025;
    mockConfig.conference.week = 8;
    mockConfig.crawl.maxRequestsPerCrawl = 4;
    mockConfig.voteDateBackfill.recoveryMode = true;

    const { fetchRecentConferenceWeeks } = await import('./update-vote-dates');

    await fetchRecentConferenceWeeks();

    expect(findMock).toHaveBeenCalledWith({
      sessions: { $exists: true, $not: { $size: 0 } },
      $and: [
        {
          $or: [{ thisYear: { $gt: 2025 } }, { thisYear: 2025, thisWeek: { $gte: 8 } }],
        },
        {
          $or: [{ thisYear: { $lt: 2025 } }, { thisYear: 2025, thisWeek: { $lte: 11 } }],
        },
      ],
    });
    expect(sortMock).toHaveBeenCalledWith({ thisYear: 1, thisWeek: 1 });
    expect(limitMock).toHaveBeenCalledWith(4);
  });

  it('keeps recovery replay bounded when the configured window crosses into the next year', async () => {
    mockConfig.conference.year = 2026;
    mockConfig.conference.week = 51;
    mockConfig.crawl.maxRequestsPerCrawl = 5;
    mockConfig.voteDateBackfill.recoveryMode = true;

    const { fetchRecentConferenceWeeks } = await import('./update-vote-dates');

    await fetchRecentConferenceWeeks();

    expect(findMock).toHaveBeenCalledWith({
      sessions: { $exists: true, $not: { $size: 0 } },
      $and: [
        {
          $or: [{ thisYear: { $gt: 2026 } }, { thisYear: 2026, thisWeek: { $gte: 51 } }],
        },
        {
          $or: [{ thisYear: { $lt: 2027 } }, { thisYear: 2027, thisWeek: { $lte: 2 } }],
        },
      ],
    });
    expect(sortMock).toHaveBeenCalledWith({ thisYear: 1, thisWeek: 1 });
    expect(limitMock).toHaveBeenCalledWith(5);
  });
});
