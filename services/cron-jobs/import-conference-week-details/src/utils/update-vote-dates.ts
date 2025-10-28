import { log } from 'crawlee';
import { ConferenceWeekDetailModel, ProcedureModel } from '@democracy-deutschland/bundestagio-common';

/**
 * Updates voteDate field in procedures based on conference week sessions
 *
 * This function:
 * 1. Queries all conference weeks that have sessions
 * 2. For each session with a date and vote topics, collects procedure IDs
 * 3. Batch updates all procedures with their respective vote dates
 *
 * @returns Object with total number of procedures modified
 */
export async function updateProcedureVoteDates(): Promise<{ modifiedCount: number }> {
  let totalModified = 0;

  // Find only the last 5 conference weeks with sessions
  // This improves performance and focuses on recent/upcoming votes
  const weeks = await ConferenceWeekDetailModel.find({
    sessions: { $exists: true, $not: { $size: 0 } },
  })
    .sort({ thisYear: -1, thisWeek: -1 })
    .limit(5)
    .lean();

  log.info(`Found ${weeks.length} conference weeks with sessions to process`);

  for (const week of weeks) {
    for (const session of week.sessions) {
      // Skip sessions without dates
      if (!session.date) {
        continue;
      }

      const sessionDate = new Date(session.date);

      // Collect all procedure IDs from vote topics in this session
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
      const uniqueProcedureIds = [...new Set(procedureIds)];

      if (uniqueProcedureIds.length > 0) {
        // Batch update all procedures for this session
        const result = await ProcedureModel.updateMany(
          { procedureId: { $in: uniqueProcedureIds } },
          { $set: { voteDate: sessionDate } },
        );

        if (result.modifiedCount > 0) {
          log.info(
            `Week ${week.thisWeek}/${week.thisYear} Session ${session.session}: ` +
              `Updated ${result.modifiedCount}/${uniqueProcedureIds.length} procedures with voteDate ${sessionDate.toISOString().split('T')[0]}`,
          );
        }

        totalModified += result.modifiedCount;
      }
    }
  }

  return { modifiedCount: totalModified };
}
