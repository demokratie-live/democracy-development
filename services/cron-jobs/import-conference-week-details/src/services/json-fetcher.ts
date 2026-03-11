import axios from 'axios';
import { log } from 'crawlee';
import type { BundestagJSONResponse } from '../types-json';
import { getNextISOWeek } from '../utils/date.js';

const BUNDESTAG_API_BASE = 'https://www.bundestag.de/apps/plenar/plenar';

export interface FetchConferenceWeekOptions {
  year: number;
  week: number;
}

/**
 * Fetches conference week details from Bundestag JSON API
 */
export async function fetchConferenceWeek(options: FetchConferenceWeekOptions): Promise<BundestagJSONResponse> {
  const { year, week } = options;
  const url = `${BUNDESTAG_API_BASE}/conferenceWeekJSON?year=${year}&week=${week}`;

  log.info(`Fetching conference week: ${year}-${week}`, { url });

  try {
    const response = await axios.get<BundestagJSONResponse>(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'DEMOCRACY Deutschland Import Service',
        Accept: 'application/json',
      },
    });

    if (response.status === 404) {
      throw new Error(`Conference week ${year}-${week} not found (404)`);
    }

    if (!response.data || !response.data.conferences) {
      throw new Error(`Invalid response structure for ${year}-${week}`);
    }

    log.info(`Successfully fetched conference week ${year}-${week}`, {
      conferenceCount: response.data.conferences.length,
      hasNext: !!response.data.next,
      hasPrevious: !!response.data.previous,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        log.warning(`Conference week ${year}-${week} not found (404)`);
        throw new Error(`Conference week ${year}-${week} not found`);
      }
      log.error(`HTTP error fetching ${year}-${week}`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      throw new Error(`HTTP ${error.response?.status} error fetching ${year}-${week}`);
    }
    log.error(`Error fetching conference week ${year}-${week}`, {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Fetches multiple conference weeks in sequence starting from `options`.
 *
 * Navigation strategy:
 *  1. If the API returns a response, follow the `next` pointer to reach the
 *     next session week (the API skips non-session weeks automatically).
 *  2. If the API returns 404 for the starting week (e.g. the current week has
 *     no sessions yet), advance one ISO week at a time for up to
 *     MAX_LOOKAHEAD_WEEKS consecutive misses before giving up.  This ensures
 *     the crawler can always find the next upcoming session even when starting
 *     from a non-session week.
 */
export async function fetchConferenceWeeks(
  options: FetchConferenceWeekOptions,
  limit: number = 10,
): Promise<Array<{ data: BundestagJSONResponse; year: number; week: number }>> {
  /** How many consecutive 404s we tolerate before giving up entirely */
  const MAX_LOOKAHEAD_WEEKS = 4;

  const results: Array<{
    data: BundestagJSONResponse;
    year: number;
    week: number;
  }> = [];

  let currentYear = options.year;
  let currentWeek = options.week;
  let consecutiveMisses = 0;

  while (results.length < limit) {
    try {
      const data = await fetchConferenceWeek({
        year: currentYear,
        week: currentWeek,
      });

      // A successful response resets the consecutive-miss counter.
      consecutiveMisses = 0;
      results.push({ data, year: currentYear, week: currentWeek });

      // Navigate to next week via the API's own pointer (fastest path).
      if (data.next) {
        currentYear = data.next.year;
        currentWeek = data.next.week;
      } else {
        log.info('No more upcoming weeks available');
        break;
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        consecutiveMisses++;
        if (consecutiveMisses >= MAX_LOOKAHEAD_WEEKS) {
          log.info(
            `No session data found for ${MAX_LOOKAHEAD_WEEKS} consecutive weeks starting at ` +
              `${options.year}-W${String(options.week).padStart(2, '0')}, stopping`,
          );
          break;
        }
        // Advance one ISO week manually and retry.
        const next = getNextISOWeek(currentYear, currentWeek);
        log.info(
          `Week ${currentYear}-W${String(currentWeek).padStart(2, '0')} not found, trying ${next.year}-W${String(next.week).padStart(2, '0')}`,
        );
        currentYear = next.year;
        currentWeek = next.week;
        continue;
      }
      throw error;
    }
  }

  log.info(`Fetched ${results.length} conference weeks`);
  return results;
}
