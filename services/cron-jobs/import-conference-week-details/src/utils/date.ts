/**
 * ISO 8601 week date utilities.
 *
 * ISO week rules:
 *  - Week 1 is the week containing the first Thursday of the year.
 *  - Weeks start on Monday.
 *  - The ISO year may differ from the calendar year (e.g. 1 Jan may belong to
 *    week 52/53 of the previous year).
 */

/**
 * Returns the ISO 8601 year and week number for the given date (or today).
 */
export function getCurrentISOWeek(now: Date = new Date()): { year: number; week: number } {
  // Work in UTC to avoid DST edge-cases; read UTC components so that "now"
  // is also interpreted as UTC (avoids off-by-one near midnight in negative
  // UTC-offset timezones, e.g. UTC-5 where 23:00 local is already next day UTC).
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  // Shift to the nearest Thursday (Mon=1 … Sun=7)
  const dayOfWeek = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayOfWeek);
  const isoYear = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return { year: isoYear, week: weekNo };
}

/**
 * Returns the ISO 8601 year and week number for the week immediately following
 * the supplied year/week pair, correctly rolling over at year boundaries.
 */
export function getNextISOWeek(year: number, week: number): { year: number; week: number } {
  const lastWeek = getLastISOWeekOfYear(year);
  if (week >= lastWeek) {
    return { year: year + 1, week: 1 };
  }
  return { year, week: week + 1 };
}

/**
 * Returns the number of ISO weeks in the given year (52 or 53).
 * A year has 53 weeks if 1 Jan or 31 Dec falls on a Thursday.
 */
export function getLastISOWeekOfYear(year: number): number {
  // Dec 28 is always within the last ISO week of the year
  const dec28 = new Date(Date.UTC(year, 11, 28));
  const { week } = getCurrentISOWeek(dec28);
  return week;
}
