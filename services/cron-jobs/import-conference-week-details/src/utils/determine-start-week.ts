import { log } from 'crawlee';
import { ConferenceWeekDetailModel } from '@democracy-deutschland/bundestagio-common';

/**
 * Determines the starting week for crawling based on database state and mode
 *
 * Strategy:
 * 1. Full Crawl Mode (FULL_CRAWL=true):
 *    - Start at current week, crawl backwards to LEGISLATURE_START_WEEK
 *    - Use for empty DB or data recovery scenarios
 *
 * 2. Normal Mode (default):
 *    - Find last 3 conference weeks with actual sessions
 *    - Start from earliest of those 3
 *    - Efficient for daily updates, only updates relevant weeks
 */

const LEGISLATURE_START_WEEK = 37; // Week 37/2025 = Start of Legislaturperiode 21
const LEGISLATURE_START_YEAR = 2025;
const LOOKBACK_CONFERENCE_WEEKS = 3; // How many past conference weeks with sessions to keep updated

/**
 * Calculate current ISO week number
 */
const getCurrentWeek = (): { week: number; year: number } => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return { week: weekNumber, year: now.getFullYear() };
};

/**
 * Find the last N conference weeks that have actual sessions (non-empty sessions array)
 * Returns them sorted by date (oldest first)
 */
const findLastConferenceWeeksWithSessions = async (count: number): Promise<Array<{ year: number; week: number }>> => {
  try {
    const weeks = await ConferenceWeekDetailModel.find(
      {
        // Only find weeks that have at least one session
        sessions: { $exists: true, $not: { $size: 0 } },
      },
      { thisYear: 1, thisWeek: 1, _id: 0 },
    )
      .sort({ thisYear: -1, thisWeek: -1 }) // Newest first
      .limit(count)
      .lean();

    // Return oldest first (reverse the array)
    return weeks.map((w) => ({ year: w.thisYear, week: w.thisWeek })).reverse();
  } catch (error) {
    log.warning('Error finding conference weeks with sessions', {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
};

/**
 * Determines the optimal starting point for the crawler
 *
 * @param isTest - Whether running in test mode (always returns current week)
 * @param fullCrawl - Whether to do a full crawl (start from current, go back to legislature start)
 */
export const determineStartWeek = async (
  isTest: boolean = false,
  fullCrawl: boolean = false,
): Promise<{ year: number; week: number }> => {
  // In test mode, always use current week
  if (isTest) {
    return getCurrentWeek();
  }

  // Full crawl mode: start from current week and crawl backwards
  if (fullCrawl) {
    log.info('Full crawl mode enabled. Starting from current week and crawling backwards to legislature start.');
    return getCurrentWeek();
  }

  try {
    // Normal mode: Find last 3 conference weeks with sessions
    const lastConferenceWeeks = await findLastConferenceWeeksWithSessions(LOOKBACK_CONFERENCE_WEEKS);

    if (lastConferenceWeeks.length === 0) {
      // No conference weeks with sessions found - start from current week
      log.info('No conference weeks with sessions found in database. Starting from current week.');
      return getCurrentWeek();
    }

    // Start from the oldest of the last N conference weeks
    const startPoint = lastConferenceWeeks[0];

    // Don't go before legislature start
    if (
      startPoint.year < LEGISLATURE_START_YEAR ||
      (startPoint.year === LEGISLATURE_START_YEAR && startPoint.week < LEGISLATURE_START_WEEK)
    ) {
      log.info(
        `Calculated start point (${startPoint.year}-${startPoint.week}) is before legislature start. Using legislature start instead.`,
      );
      return { year: LEGISLATURE_START_YEAR, week: LEGISLATURE_START_WEEK };
    }

    log.info(
      `Normal mode: Found ${lastConferenceWeeks.length} conference weeks with sessions. Starting from oldest: ${startPoint.year}-${startPoint.week}`,
    );
    return startPoint;
  } catch (error) {
    // On error, fall back to current week
    log.warning('Error determining start week from database. Falling back to current week.', {
      error: error instanceof Error ? error.message : String(error),
    });
    return getCurrentWeek();
  }
};

// Export constants for testing
export const CONSTANTS = {
  LEGISLATURE_START_WEEK,
  LEGISLATURE_START_YEAR,
  LOOKBACK_CONFERENCE_WEEKS,
};
