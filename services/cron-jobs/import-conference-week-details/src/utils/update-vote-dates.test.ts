import { describe, it, expect } from 'vitest';
import { extractProcedureIdsFromSession, groupProcedureIdsByDate } from './update-vote-dates';
import type { IConferenceWeekDetail, ISession } from '@democracy-deutschland/bundestagio-common';

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
