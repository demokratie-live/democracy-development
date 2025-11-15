import type { BundestagJSONResponse, ConferenceJSON, RowJSON } from '../types-json';
import { parseTopicDetail, parseStatusDetail } from './parsers/html-detail-parser';
import type { IConferenceWeekDetail, ISession } from '@democracy-deutschland/bundestagio-common';
import type { ITop } from '@democracy-deutschland/bundestagio-common/dist/models/ConferenceWeekDetail/ConferenceWeekDetail/Session/Top';
import type { ITopic } from '@democracy-deutschland/bundestagio-common/dist/models/ConferenceWeekDetail/ConferenceWeekDetail/Session/Top/Topic';
import type { IStatus } from '@democracy-deutschland/bundestagio-common/dist/models/ConferenceWeekDetail/ConferenceWeekDetail/Session/Top/Status';
import { isVote } from '../utils/vote-detection';

/**
 * Maps JSON API response to database schema format
 */
export function mapJSONToConferenceWeekDetail(
  json: BundestagJSONResponse,
  year: number,
  week: number,
): Partial<IConferenceWeekDetail> {
  return {
    id: `${year}-${week}`,
    thisYear: year,
    thisWeek: week,
    previousYear: json.previous?.year ?? null,
    previousWeek: json.previous?.week ?? null,
    nextYear: json.next?.year ?? null,
    nextWeek: json.next?.week ?? null,
    URL: null, // No longer available in JSON API
    sessions: json.conferences.map((conference) => mapConferenceToSession(conference)),
  };
}

/**
 * Maps a single conference to a session
 */
function mapConferenceToSession(conference: ConferenceJSON): ISession {
  return {
    date: parseGermanDate(conference.conferenceDate.date),
    dateText: conference.conferenceDate.date,
    session: `${conference.conferenceNumber}`,
    tops: conference.rows.map((row) => mapRowToTop(row, conference.conferenceDate.date)),
  };
}

/**
 * Maps a single row to a TOP (agenda item)
 */
function mapRowToTop(row: RowJSON, conferenceDate: string): ITop {
  // Parse topic detail HTML
  const topicDetail = parseTopicDetail(row.topic.detail || '');

  // Parse status detail HTML if available
  const statusDetail = row.status.detail ? parseStatusDetail(row.status.detail) : { lines: [], documents: [] };

  // Combine topic title with parsed lines
  const allTopicLines = [row.topic.title || '', ...topicDetail.lines].filter(Boolean);

  // Extract heading (first line of topic)
  const heading = allTopicLines[0] || null;

  // Determine if this is a vote
  const isVoteResult = isVote(allTopicLines, heading, topicDetail.documents, statusDetail.lines);

  // Note: procedureIds will be populated later via getProcedureIds
  // This keeps the mapper synchronous and testable without database
  const procedureIds: string[] = [];

  // Create topic array (always single element in new JSON API)
  const topic: ITopic[] = [
    {
      lines: allTopicLines,
      documents: topicDetail.documents,
      isVote: isVoteResult,
      procedureIds,
    },
  ];

  // Create status array from status lines
  const status: IStatus[] = statusDetail.lines.map((line: string) => ({
    line,
    documents: statusDetail.documents,
  }));

  // Add status title if different from detail lines
  if (row.status.title && !statusDetail.lines.includes(row.status.title)) {
    status.unshift({
      line: row.status.title,
      documents: [],
    });
  }

  return {
    time: parseGermanDateTime(conferenceDate, row.time),
    top: row.top || null,
    heading,
    article: null, // Not available in JSON API
    topic,
    status,
  };
}

/**
 * Parses German date format "12. November 2025" to Date object
 */
function parseGermanDate(dateString: string): Date | null {
  if (!dateString) return null;

  const germanMonths: { [key: string]: number } = {
    Januar: 0,
    Februar: 1,
    März: 2,
    April: 3,
    Mai: 4,
    Juni: 5,
    Juli: 6,
    August: 7,
    September: 8,
    Oktober: 9,
    November: 10,
    Dezember: 11,
  };

  // Match pattern: "12. November 2025"
  const match = dateString.match(/(\d+)\.\s+(\w+)\s+(\d{4})/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const monthName = match[2];
  const year = parseInt(match[3], 10);

  const month = germanMonths[monthName];
  if (month === undefined) return null;

  return new Date(year, month, day);
}

/**
 * Parses German date + time to Date object
 */
function parseGermanDateTime(dateString: string, timeString: string): Date | null {
  const date = parseGermanDate(dateString);
  if (!date || !timeString) return date;

  // Parse time "15:30"
  const timeMatch = timeString.match(/(\d{1,2}):(\d{2})/);
  if (!timeMatch) return date;

  const hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);

  date.setHours(hours, minutes, 0, 0);
  return date;
}
