import { beforeEach, describe, expect, it, vi } from 'vitest';
import { extractProcedureIdsFromSession, groupProcedureIdsByDate, updateProcedureVoteDates } from './update-vote-dates';
import type { IConferenceWeekDetail, ISession } from '@democracy-deutschland/bundestagio-common';

const { findMock, sortMock, limitMock, leanMock, updateManyMock, logInfoMock } = vi.hoisted(() => ({
  findMock: vi.fn(),
  sortMock: vi.fn(),
  limitMock: vi.fn(),
  leanMock: vi.fn(),
  updateManyMock: vi.fn(),
  logInfoMock: vi.fn(),
}));

vi.mock('../config.js', () => ({
  config: {
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

beforeEach(() => {
  vi.clearAllMocks();
  sortMock.mockReturnThis();
  limitMock.mockReturnThis();
  leanMock.mockResolvedValue([]);
  findMock.mockReturnValue({
    sort: sortMock,
    limit: limitMock,
    lean: leanMock,
  });
});

describe('extractProcedureIdsFromSession', () => {
  it('should extract unique procedure IDs from vote topics', () => {
    const session = {
      tops: [
        {
          topic: [
            {
              isVote: true,
              procedureIds: ['proc-1', 'proc-2'],
            },
            {
              isVote: true,
              procedureIds: ['proc-3'],
            },
          ],
        },
      ],
    } as unknown as ISession;

    const result = extractProcedureIdsFromSession(session);

    expect(result).toEqual(['proc-1', 'proc-2', 'proc-3']);
  });

  it('should remove duplicate procedure IDs', () => {
    const session = {
      tops: [
        {
          topic: [
            {
              isVote: true,
              procedureIds: ['proc-1', 'proc-2'],
            },
          ],
        },
        {
          topic: [
            {
              isVote: true,
              procedureIds: ['proc-2', 'proc-3'],
            },
          ],
        },
      ],
    } as unknown as ISession;
    const result = extractProcedureIdsFromSession(session);

    expect(result).toEqual(['proc-1', 'proc-2', 'proc-3']);
  });

  it('should ignore topics that are not marked as votes', () => {
    const session = {
      tops: [
        {
          topic: [
            {
              isVote: false,
              procedureIds: ['proc-1'],
            },
            {
              isVote: true,
              procedureIds: ['proc-2'],
            },
          ],
        },
      ],
    } as unknown as ISession;
    const result = extractProcedureIdsFromSession(session);

    expect(result).toEqual(['proc-2']);
  });

  it('should ignore topics without procedureIds', () => {
    const session = {
      tops: [
        {
          topic: [
            {
              isVote: true,
              procedureIds: undefined,
            },
            {
              isVote: true,
              procedureIds: ['proc-1'],
            },
          ],
        },
      ],
    } as unknown as ISession;
    const result = extractProcedureIdsFromSession(session);

    expect(result).toEqual(['proc-1']);
  });

  it('should handle empty session with no tops', () => {
    const session = {
      tops: [],
    } as unknown as ISession;
    const result = extractProcedureIdsFromSession(session);

    expect(result).toEqual([]);
  });

  it('should handle session with undefined tops', () => {
    const session = {} as unknown as ISession;

    const result = extractProcedureIdsFromSession(session);

    expect(result).toEqual([]);
  });

  it('should handle tops with empty topic arrays', () => {
    const session = {
      tops: [
        {
          topic: [],
        },
      ],
    } as unknown as ISession;
    const result = extractProcedureIdsFromSession(session);

    expect(result).toEqual([]);
  });

  it('should handle non-array procedureIds gracefully', () => {
    const session = {
      tops: [
        {
          topic: [
            {
              isVote: true,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              procedureIds: 'not-an-array' as any,
            },
            {
              isVote: true,
              procedureIds: ['proc-1'],
            },
          ],
        },
      ],
    } as unknown as ISession;
    const result = extractProcedureIdsFromSession(session);

    expect(result).toEqual(['proc-1']);
  });
});

describe('groupProcedureIdsByDate', () => {
  it('should group procedure IDs by date', () => {
    const weeks = [
      {
        thisWeek: 42,
        thisYear: 2024,
        sessions: [
          {
            date: '2024-10-15',
            session: 'Session 1',
            tops: [
              {
                topic: [
                  {
                    isVote: true,
                    procedureIds: ['proc-1', 'proc-2'],
                  },
                ],
              },
            ],
          },
          {
            date: '2024-10-16',
            session: 'Session 2',
            tops: [
              {
                topic: [
                  {
                    isVote: true,
                    procedureIds: ['proc-3'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as unknown as IConferenceWeekDetail[];
    const result = groupProcedureIdsByDate(weeks);

    expect(result.size).toBe(2);
    expect(result.get('2024-10-15')).toEqual({
      date: new Date('2024-10-15'),
      procedureIds: ['proc-1', 'proc-2'],
      weekInfo: '42/2024',
      sessionInfo: 'Session 1',
    });
    expect(result.get('2024-10-16')).toEqual({
      date: new Date('2024-10-16'),
      procedureIds: ['proc-3'],
      weekInfo: '42/2024',
      sessionInfo: 'Session 2',
    });
  });

  it('should merge procedure IDs from sessions with the same date', () => {
    const weeks = [
      {
        thisWeek: 42,
        thisYear: 2024,
        sessions: [
          {
            date: '2024-10-15',
            session: 'Session 1',
            tops: [
              {
                topic: [
                  {
                    isVote: true,
                    procedureIds: ['proc-1'],
                  },
                ],
              },
            ],
          },
          {
            date: '2024-10-15',
            session: 'Session 2',
            tops: [
              {
                topic: [
                  {
                    isVote: true,
                    procedureIds: ['proc-2'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as unknown as IConferenceWeekDetail[];
    const result = groupProcedureIdsByDate(weeks);

    expect(result.size).toBe(1);
    expect(result.get('2024-10-15')?.procedureIds).toEqual(['proc-1', 'proc-2']);
  });

  it('should remove duplicates when merging same-date sessions', () => {
    const weeks = [
      {
        thisWeek: 42,
        thisYear: 2024,
        sessions: [
          {
            date: '2024-10-15',
            session: 'Session 1',
            tops: [
              {
                topic: [
                  {
                    isVote: true,
                    procedureIds: ['proc-1', 'proc-2'],
                  },
                ],
              },
            ],
          },
          {
            date: '2024-10-15',
            session: 'Session 2',
            tops: [
              {
                topic: [
                  {
                    isVote: true,
                    procedureIds: ['proc-2', 'proc-3'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as unknown as IConferenceWeekDetail[];
    const result = groupProcedureIdsByDate(weeks);

    expect(result.size).toBe(1);
    expect(result.get('2024-10-15')?.procedureIds).toEqual(['proc-1', 'proc-2', 'proc-3']);
  });

  it('should skip sessions without dates', () => {
    const weeks = [
      {
        thisWeek: 42,
        thisYear: 2024,
        sessions: [
          {
            date: undefined,
            session: 'Session 1',
            tops: [
              {
                topic: [
                  {
                    isVote: true,
                    procedureIds: ['proc-1'],
                  },
                ],
              },
            ],
          },
          {
            date: '2024-10-15',
            session: 'Session 2',
            tops: [
              {
                topic: [
                  {
                    isVote: true,
                    procedureIds: ['proc-2'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as unknown as IConferenceWeekDetail[];
    const result = groupProcedureIdsByDate(weeks);

    expect(result.size).toBe(1);
    expect(result.get('2024-10-15')?.procedureIds).toEqual(['proc-2']);
  });

  it('should skip sessions with no procedure IDs', () => {
    const weeks = [
      {
        thisWeek: 42,
        thisYear: 2024,
        sessions: [
          {
            date: '2024-10-15',
            session: 'Session 1',
            tops: [
              {
                topic: [
                  {
                    isVote: false,
                    procedureIds: ['proc-1'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as unknown as IConferenceWeekDetail[];
    const result = groupProcedureIdsByDate(weeks);

    expect(result.size).toBe(0);
  });

  it('should handle empty weeks array', () => {
    const weeks = [] as unknown as IConferenceWeekDetail[];

    const result = groupProcedureIdsByDate(weeks);

    expect(result.size).toBe(0);
  });

  it('should handle weeks with empty sessions', () => {
    const weeks = [
      {
        thisWeek: 42,
        thisYear: 2024,
        sessions: [],
      },
    ] as unknown as IConferenceWeekDetail[];
    const result = groupProcedureIdsByDate(weeks);

    expect(result.size).toBe(0);
  });

  it('should handle missing session info gracefully', () => {
    const weeks = [
      {
        thisWeek: 42,
        thisYear: 2024,
        sessions: [
          {
            date: '2024-10-15',
            session: undefined,
            tops: [
              {
                topic: [
                  {
                    isVote: true,
                    procedureIds: ['proc-1'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as unknown as IConferenceWeekDetail[];
    const result = groupProcedureIdsByDate(weeks);

    expect(result.size).toBe(1);
    expect(result.get('2024-10-15')?.sessionInfo).toBe('unknown');
  });

  it('should group procedures from multiple weeks with same date', () => {
    const weeks = [
      {
        thisWeek: 42,
        thisYear: 2024,
        sessions: [
          {
            date: '2024-10-15',
            session: 'Session 1',
            tops: [
              {
                topic: [
                  {
                    isVote: true,
                    procedureIds: ['proc-1'],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        thisWeek: 43,
        thisYear: 2024,
        sessions: [
          {
            date: '2024-10-15',
            session: 'Session A',
            tops: [
              {
                topic: [
                  {
                    isVote: true,
                    procedureIds: ['proc-2'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as unknown as IConferenceWeekDetail[];
    const result = groupProcedureIdsByDate(weeks);

    expect(result.size).toBe(1);
    expect(result.get('2024-10-15')?.procedureIds).toEqual(['proc-1', 'proc-2']);
  });
});

describe('updateProcedureVoteDates', () => {
  it('should return structured counters for successful backfill work', async () => {
    leanMock.mockResolvedValue([
      {
        thisWeek: 42,
        thisYear: 2024,
        sessions: [
          {
            date: new Date('2024-10-15'),
            session: 'Session 1',
            tops: [
              {
                topic: [
                  {
                    lines: [],
                    documents: [],
                    isVote: true,
                    procedureIds: ['proc-1', 'proc-2'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as unknown as IConferenceWeekDetail[]);
    updateManyMock.mockResolvedValue({
      matchedCount: 2,
      modifiedCount: 1,
    });

    const result = await updateProcedureVoteDates();

    expect(result).toEqual({
      conferenceWeekCount: 1,
      dateGroupCount: 1,
      attemptedProcedureCount: 2,
      matchedProcedureCount: 2,
      modifiedCount: 1,
      unmatchedProcedureCount: 0,
    });
  });

  it('should surface zero-match backfill work in structured counters', async () => {
    leanMock.mockResolvedValue([
      {
        thisWeek: 42,
        thisYear: 2024,
        sessions: [
          {
            date: new Date('2024-10-15'),
            session: 'Session 1',
            tops: [
              {
                topic: [
                  {
                    lines: [],
                    documents: [],
                    isVote: true,
                    procedureIds: ['missing-1', 'missing-2'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as unknown as IConferenceWeekDetail[]);
    updateManyMock.mockResolvedValue({
      matchedCount: 0,
      modifiedCount: 0,
    });

    const result = await updateProcedureVoteDates();

    expect(result).toEqual({
      conferenceWeekCount: 1,
      dateGroupCount: 1,
      attemptedProcedureCount: 2,
      matchedProcedureCount: 0,
      modifiedCount: 0,
      unmatchedProcedureCount: 2,
    });
  });

  it.each([
    {
      mode: 'recent-mode ordering',
      weeks: [
        {
          thisWeek: 42,
          thisYear: 2024,
          sessions: [
            {
              date: new Date('2024-10-16'),
              session: 'Later session',
              tops: [
                {
                  topic: [
                    {
                      lines: [],
                      documents: [],
                      isVote: true,
                      procedureIds: ['shared-proc'],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          thisWeek: 41,
          thisYear: 2024,
          sessions: [
            {
              date: new Date('2024-10-15'),
              session: 'Earlier session',
              tops: [
                {
                  topic: [
                    {
                      lines: [],
                      documents: [],
                      isVote: true,
                      procedureIds: ['shared-proc'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      mode: 'recovery-mode ordering',
      weeks: [
        {
          thisWeek: 41,
          thisYear: 2024,
          sessions: [
            {
              date: new Date('2024-10-15'),
              session: 'Earlier session',
              tops: [
                {
                  topic: [
                    {
                      lines: [],
                      documents: [],
                      isVote: true,
                      procedureIds: ['shared-proc'],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          thisWeek: 42,
          thisYear: 2024,
          sessions: [
            {
              date: new Date('2024-10-16'),
              session: 'Later session',
              tops: [
                {
                  topic: [
                    {
                      lines: [],
                      documents: [],
                      isVote: true,
                      procedureIds: ['shared-proc'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ])('should choose the latest detected voteDate regardless of %s', async ({ weeks }) => {
    leanMock.mockResolvedValue(weeks as unknown as IConferenceWeekDetail[]);
    updateManyMock.mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
    });

    const result = await updateProcedureVoteDates();

    expect(updateManyMock).toHaveBeenCalledTimes(1);
    expect(updateManyMock).toHaveBeenCalledWith(
      { procedureId: { $in: ['shared-proc'] } },
      { $set: { voteDate: new Date('2024-10-16') } },
    );
    expect(result).toEqual({
      conferenceWeekCount: 2,
      dateGroupCount: 1,
      attemptedProcedureCount: 1,
      matchedProcedureCount: 1,
      modifiedCount: 1,
      unmatchedProcedureCount: 0,
    });
  });
});
