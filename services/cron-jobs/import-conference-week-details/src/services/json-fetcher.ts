import axios from 'axios';
import { log } from 'crawlee';
import type { BundestagJSONResponse } from '../types-json';

const BUNDESTAG_API_BASE = 'https://www.bundestag.de/apps/plenar/plenar';

export interface FetchConferenceWeekOptions {
  year: number;
  week: number;
}

/**
 * Returns the number of ISO weeks in a given year.
 * ISO week 1 is the week containing the year's first Thursday.
 * A year has 53 ISO weeks when Jan 1 or Dec 31 falls on Thursday,
 * because that extra Thursday either starts or extends a week into a new year.
 */
export function getISOWeeksInYear(year: number): number {
  const jan1Day = new Date(Date.UTC(year, 0, 1)).getUTCDay();
  const dec31Day = new Date(Date.UTC(year, 11, 31)).getUTCDay();
  return jan1Day === 4 || dec31Day === 4 ? 53 : 52;
}

/**
 * Advances to the next ISO week, crossing the year boundary when necessary.
 */
export function getNextISOWeek(year: number, week: number): { year: number; week: number } {
  if (week < getISOWeeksInYear(year)) {
    return { year, week: week + 1 };
  }
  return { year: year + 1, week: 1 };
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
 * Fetches multiple conference weeks in sequence starting from the given week.
 * When a week has no sessions (404), advances to the next ISO week and continues.
 * Stops when there are no more upcoming weeks or the limit is reached.
 */
export async function fetchConferenceWeeks(
  options: FetchConferenceWeekOptions,
  limit: number = 10,
): Promise<Array<{ data: BundestagJSONResponse; year: number; week: number }>> {
  const results: Array<{
    data: BundestagJSONResponse;
    year: number;
    week: number;
  }> = [];

  let currentYear = options.year;
  let currentWeek = options.week;

  for (let i = 0; i < limit; i++) {
    try {
      const data = await fetchConferenceWeek({
        year: currentYear,
        week: currentWeek,
      });

      results.push({ data, year: currentYear, week: currentWeek });

      // Navigate to next week (forward to newer weeks)
      if (data.next) {
        currentYear = data.next.year;
        currentWeek = data.next.week;
      } else {
        log.info('No more upcoming weeks available');
        break;
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        // Week has no sessions – advance to the next week and keep going
        log.info(`Week ${currentYear}-${currentWeek} not available, trying next week`);
        const next = getNextISOWeek(currentYear, currentWeek);
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
