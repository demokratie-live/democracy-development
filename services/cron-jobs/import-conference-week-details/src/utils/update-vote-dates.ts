import { log } from 'crawlee';
import {
  ConferenceWeekDetailModel,
  ProcedureModel,
  type IConferenceWeekDetail,
  type ISession,
} from '@democracy-deutschland/bundestagio-common';
import { config } from '../config.js';

export interface VoteDateBackfillResult {
  conferenceWeekCount: number;
  dateGroupCount: number;
  attemptedProcedureCount: number;
  matchedProcedureCount: number;
  modifiedCount: number;
  unmatchedProcedureCount: number;
}

interface VoteDateGroup {
  date: Date;
  procedureIds: string[];
  weekInfo: string;
  sessionInfo: string;
}

interface ConferenceWeekCoordinate {
  year: number;
  week: number;
}

interface ConferenceWeekBackfillWindow {
  mode: 'recent' | 'recovery';
  limit: number;
  sort: { thisYear: 1 | -1; thisWeek: 1 | -1 };
  query: Record<string, unknown>;
  start?: ConferenceWeekCoordinate;
  end?: ConferenceWeekCoordinate;
}

const conferenceWeeksWithSessionsQuery = {
  sessions: { $exists: true, $not: { $size: 0 } },
};

const getIsoWeekAndYear = (date: Date): ConferenceWeekCoordinate => {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utcDate.getUTCDay() || 7;

  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return {
    year: utcDate.getUTCFullYear(),
    week,
  };
};

const getIsoWeekStartDate = ({ year, week }: ConferenceWeekCoordinate): Date => {
  const anchor = new Date(Date.UTC(year, 0, 4 + (week - 1) * 7));
  const day = anchor.getUTCDay() || 7;

  anchor.setUTCDate(anchor.getUTCDate() - day + 1);

  return anchor;
};

export function addConferenceWeeks(coordinate: ConferenceWeekCoordinate, weeksToAdd: number): ConferenceWeekCoordinate {
  const startDate = getIsoWeekStartDate(coordinate);

  startDate.setUTCDate(startDate.getUTCDate() + weeksToAdd * 7);

  return getIsoWeekAndYear(startDate);
}

export function buildConferenceWeekRangeQuery(
  start: ConferenceWeekCoordinate,
  end: ConferenceWeekCoordinate,
): Record<string, unknown> {
  return {
    $and: [
      {
        $or: [{ thisYear: { $gt: start.year } }, { thisYear: start.year, thisWeek: { $gte: start.week } }],
      },
      {
        $or: [{ thisYear: { $lt: end.year } }, { thisYear: end.year, thisWeek: { $lte: end.week } }],
      },
    ],
  };
}

export function resolveConferenceWeekBackfillWindow(
  limit = config.crawl.maxRequestsPerCrawl,
): ConferenceWeekBackfillWindow {
  if (!config.voteDateBackfill.recoveryMode) {
    return {
      mode: 'recent',
      limit,
      sort: { thisYear: -1, thisWeek: -1 },
      query: conferenceWeeksWithSessionsQuery,
    };
  }

  const start = {
    year: config.conference.year,
    week: config.conference.week,
  };
  const end = addConferenceWeeks(start, Math.max(limit - 1, 0));

  return {
    mode: 'recovery',
    limit,
    sort: { thisYear: 1, thisWeek: 1 },
    query: {
      ...conferenceWeeksWithSessionsQuery,
      ...buildConferenceWeekRangeQuery(start, end),
    },
    start,
    end,
  };
}

/**
 * Pure function: Extracts unique procedure IDs from a session's vote topics
 */
export function extractProcedureIdsFromSession(session: ISession): string[] {
  const procedureIds: string[] = [];

  for (const top of session.tops || []) {
    for (const topic of top.topic || []) {
      // Only include topics marked as votes with procedure IDs
      if (topic.isVote && topic.procedureIds && Array.isArray(topic.procedureIds)) {
        procedureIds.push(...topic.procedureIds);
      }
    }
  }

  // Remove duplicates (same procedure might appear in multiple TOPs)
  return [...new Set(procedureIds)];
}

/**
 * Pure function: Groups procedure IDs by their vote date from conference weeks
 */
export function groupProcedureIdsByDate(weeks: IConferenceWeekDetail[]): Map<string, VoteDateGroup> {
  const dateGroups = new Map<string, VoteDateGroup>();

  for (const week of weeks) {
    for (const session of week.sessions) {
      // Skip sessions without dates
      if (!session.date) {
        continue;
      }

      const sessionDate = new Date(session.date);
      const dateKey = sessionDate.toISOString().split('T')[0];
      const procedureIds = extractProcedureIdsFromSession(session);

      if (procedureIds.length > 0) {
        const existing = dateGroups.get(dateKey);
        if (existing) {
          // Merge with existing date group and remove duplicates
          existing.procedureIds = [...new Set([...existing.procedureIds, ...procedureIds])];
        } else {
          dateGroups.set(dateKey, {
            date: sessionDate,
            procedureIds,
            weekInfo: `${week.thisWeek}/${week.thisYear}`,
            sessionInfo: session.session || 'unknown',
          });
        }
      }
    }
  }

  return dateGroups;
}

export function resolveCanonicalVoteDateGroups(dateGroups: Map<string, VoteDateGroup>): Map<string, VoteDateGroup> {
  const latestVoteDateByProcedure = new Map<string, { date: Date; weekInfo: string; sessionInfo: string }>();

  for (const group of dateGroups.values()) {
    for (const procedureId of group.procedureIds) {
      const currentAssignment = latestVoteDateByProcedure.get(procedureId);

      if (!currentAssignment || group.date.getTime() > currentAssignment.date.getTime()) {
        latestVoteDateByProcedure.set(procedureId, {
          date: group.date,
          weekInfo: group.weekInfo,
          sessionInfo: group.sessionInfo,
        });
      }
    }
  }

  const canonicalDateGroups = new Map<string, VoteDateGroup>();
  const sortedAssignments = [...latestVoteDateByProcedure.entries()].sort(
    ([leftProcedureId, leftAssignment], [rightProcedureId, rightAssignment]) =>
      leftAssignment.date.getTime() - rightAssignment.date.getTime() || leftProcedureId.localeCompare(rightProcedureId),
  );

  for (const [procedureId, assignment] of sortedAssignments) {
    const dateKey = assignment.date.toISOString().split('T')[0];
    const existing = canonicalDateGroups.get(dateKey);

    if (existing) {
      existing.procedureIds.push(procedureId);
      continue;
    }

    canonicalDateGroups.set(dateKey, {
      date: assignment.date,
      procedureIds: [procedureId],
      weekInfo: assignment.weekInfo,
      sessionInfo: assignment.sessionInfo,
    });
  }

  return canonicalDateGroups;
}

/**
 * Database access: Fetches the same number of recent conference weeks that the importer can crawl by default
 */
export async function fetchRecentConferenceWeeks(
  limit = config.crawl.maxRequestsPerCrawl,
): Promise<IConferenceWeekDetail[]> {
  const window = resolveConferenceWeekBackfillWindow(limit);

  return ConferenceWeekDetailModel.find(window.query).sort(window.sort).limit(window.limit).lean();
}

/**
 * Database access: Updates procedures with a specific vote date
 */
export async function updateProceduresVoteDate(
  procedureIds: string[],
  voteDate: Date,
): Promise<{ modifiedCount: number; matchedCount: number }> {
  const result = await ProcedureModel.updateMany({ procedureId: { $in: procedureIds } }, { $set: { voteDate } });

  return {
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount,
  };
}

/**
 * Main orchestrator: Updates voteDate field in procedures based on conference week sessions
 *
 * This function:
 * 1. Fetches the imported conference-week window that has sessions
 * 2. Groups procedure IDs by their vote dates
 * 3. Batch updates all procedures with their respective vote dates
 *
 * @returns Structured counters for the backfill stage
 */
export async function updateProcedureVoteDates(): Promise<VoteDateBackfillResult> {
  const backfillWindow = resolveConferenceWeekBackfillWindow();
  const weeks = await fetchRecentConferenceWeeks();
  log.info('Found conference weeks with sessions to process', {
    backfillMode: backfillWindow.mode,
    backfillLimit: backfillWindow.limit,
    backfillStart: backfillWindow.start ? `${backfillWindow.start.year}-${backfillWindow.start.week}` : undefined,
    backfillEnd: backfillWindow.end ? `${backfillWindow.end.year}-${backfillWindow.end.week}` : undefined,
    conferenceWeekCount: weeks.length,
  });

  const dateGroups = resolveCanonicalVoteDateGroups(groupProcedureIdsByDate(weeks));
  let attemptedProcedureCount = 0;
  let matchedProcedureCount = 0;
  let modifiedCount = 0;

  for (const [dateKey, group] of dateGroups) {
    const result = await updateProceduresVoteDate(group.procedureIds, group.date);
    const attemptedCount = group.procedureIds.length;
    const unmatchedCount = attemptedCount - result.matchedCount;

    log.info('voteDate backfill batch result', {
      date: dateKey,
      conflictRule: 'latest-detected-session-date',
      weekInfo: group.weekInfo,
      sessionInfo: group.sessionInfo,
      attemptedProcedureCount: attemptedCount,
      matchedProcedureCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      unmatchedProcedureCount: unmatchedCount,
    });

    attemptedProcedureCount += attemptedCount;
    matchedProcedureCount += result.matchedCount;
    modifiedCount += result.modifiedCount;
  }

  return {
    conferenceWeekCount: weeks.length,
    dateGroupCount: dateGroups.size,
    attemptedProcedureCount,
    matchedProcedureCount,
    modifiedCount,
    unmatchedProcedureCount: attemptedProcedureCount - matchedProcedureCount,
  };
}
