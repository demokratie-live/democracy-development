import { CheerioAPI } from 'cheerio';
import { ConferenceWeekDetailSession } from '../../types';
import { getMonthNumber } from './date-utils';
import { extractTopItems } from './topic-parser';

/**
 * Parse session information from a conference detail table
 */
export const extractSessionInfo = ($: CheerioAPI): ConferenceWeekDetailSession[] => {
  const sessions: ConferenceWeekDetailSession[] = [];

  // First try to find session information in table captions (productive HTML)
  $('table.bt-table-data').each((_, table) => {
    const captionEl = $(table).find('caption .bt-conference-title');
    if (!captionEl.length) return;

    const titleText = captionEl.text().trim();
    // Handle special characters in month names and make pattern more robust
    const match = titleText.match(/(\d+)\.\s+([\wäöüÄÖÜß]+)\s+(\d{4})\s+\((\d+)\.\s+Sitzung\)/);
    if (!match) return;

    const [, day, month, year, session] = match;
    const dateText = `${day}. ${month} ${year}`;

    // Create ISO date string (YYYY-MM-DD) to avoid timezone issues
    const monthNum = getMonthNumber(month);
    const paddedDay = day.padStart(2, '0');
    const paddedMonth = String(monthNum + 1).padStart(2, '0'); // Month is 0-indexed in getMonthNumber
    const isoDate = `${year}-${paddedMonth}-${paddedDay}`;

    // Extract top items for this session table
    const tops = extractTopItems($, table, isoDate);

    sessions.push({
      date: isoDate,
      dateText,
      session,
      tops,
    });
  });

  return sessions;
};
