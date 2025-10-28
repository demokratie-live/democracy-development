import { log } from 'crawlee';
import {
  ConferenceWeekDetailModel,
  ProcedureModel,
  type IConferenceWeekDetail,
  type ISession,
} from '@democracy-deutschland/bundestagio-common';

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
export function groupProcedureIdsByDate(
  weeks: IConferenceWeekDetail[],
): Map<string, { date: Date; procedureIds: string[]; weekInfo: string; sessionInfo: string }> {
  const dateGroups = new Map<string, { date: Date; procedureIds: string[]; weekInfo: string; sessionInfo: string }>();

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

/**
 * Database access: Fetches recent conference weeks with sessions
 */
export async function fetchRecentConferenceWeeks(limit = 5): Promise<IConferenceWeekDetail[]> {
  return ConferenceWeekDetailModel.find({
    sessions: { $exists: true, $not: { $size: 0 } },
  })
    .sort({ thisYear: -1, thisWeek: -1 })
    .limit(limit)
    .lean();
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
 * 1. Fetches recent conference weeks that have sessions
 * 2. Groups procedure IDs by their vote dates
 * 3. Batch updates all procedures with their respective vote dates
 *
 * @returns Object with total number of procedures modified
 */
export async function updateProcedureVoteDates(): Promise<{ modifiedCount: number }> {
  const weeks = await fetchRecentConferenceWeeks();
  log.info(`Found ${weeks.length} conference weeks with sessions to process`);

  const dateGroups = groupProcedureIdsByDate(weeks);
  let totalModified = 0;

  for (const [dateKey, group] of dateGroups) {
    const result = await updateProceduresVoteDate(group.procedureIds, group.date);

    if (result.modifiedCount > 0) {
      log.info(
        `Week ${group.weekInfo} Session ${group.sessionInfo}: ` +
          `Updated ${result.modifiedCount}/${group.procedureIds.length} procedures with voteDate ${dateKey}`,
      );
    }

    totalModified += result.modifiedCount;
  }

  return { modifiedCount: totalModified };
}
