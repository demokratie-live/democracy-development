import {
  ConferenceWeekDetail,
  ConferenceWeekDetailSession,
  ConferenceWeekDetailSessionTop,
  ConferenceWeekDetailSessionTopStatus,
  ConferenceWeekDetailSessionTopTopic,
} from '../types';
import { parseTimeString } from './parsers/date-utils';
import { extractDocumentId } from './parsers/document-parser';

// Minimal shape of incoming JSON based on the new interface sample
export interface JsonWeek {
  next?: { week?: number; year?: number } | null;
  previous?: { week?: number; year?: number } | null;
  conferences: Array<{
    conferenceNumber?: number | string;
    conferenceDate?: { date?: string };
    rows: Array<{
      time?: string | null;
      top?: string | null;
      topic?: { title?: string | null; detail?: string | null; link?: string | null } | null;
      status?: { title?: string | null; detail?: string | null } | null;
      isProtocol?: boolean;
    }>;
  }>;
}

const parseGermanDateToISO = (dateText?: string | null): { iso: string | null; text: string | null } => {
  if (!dateText) return { iso: null, text: null };
  // Expecting e.g. "24. Juni 2025"
  const m = dateText.match(/^(\d{1,2})\.\s+([\wäöüÄÖÜß]+)\s+(\d{4})$/);
  if (!m) return { iso: null, text: dateText };
  const [, d, monthName, y] = m;
  // Map month names to index 0..11
  const months = [
    'januar',
    'februar',
    'märz',
    'april',
    'mai',
    'juni',
    'juli',
    'august',
    'september',
    'oktober',
    'november',
    'dezember',
  ];
  const idx = months.indexOf(monthName.toLowerCase());
  if (idx === -1) return { iso: null, text: dateText };
  const day = String(parseInt(d, 10)).padStart(2, '0');
  const month = String(idx + 1).padStart(2, '0');
  return { iso: `${y}-${month}-${day}`, text: dateText };
};

const splitGroupsByDoubleBreaks = (html?: string | null): string[] => {
  if (!html) return [];
  // Replace 2+ <br> in a row by a group separator
  const marked = html.replace(/(?:<br\s*\/?>\s*){2,}/gi, '§GROUP_BREAK§');
  return marked
    .split('§GROUP_BREAK§')
    .map((s) => s.trim())
    .filter(Boolean);
};

const extractDocumentsFromHtml = (html: string): { documents: string[]; documentIds: string[]; textHtml: string } => {
  // Simple extraction by scanning href attributes; then replace anchors with their text content
  // We’ll use a lightweight DOM via a temporary element with cheerio-like behavior using regex fallback
  const docHrefRegex = /<a[^>]*class=["']?[^"']*dipLink[^"']*["']?[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gim;
  const documents: string[] = [];
  const documentIds: string[] = [];
  let textHtml = html;
  let m: RegExpExecArray | null;
  while ((m = docHrefRegex.exec(html)) !== null) {
    const href = m[1];
    const inner = m[2].replace(/<[^>]+>/g, '').trim();
    if (!documents.includes(href)) {
      documents.push(href);
      const id = extractDocumentId(href);
      if (id) documentIds.push(id);
    }
    // Replace this anchor in the textHtml with its inner text
    textHtml = textHtml.replace(m[0], inner);
  }
  return { documents, documentIds, textHtml };
};

const htmlToLines = (html?: string | null): { lines: string[]; documents: string[]; documentIds: string[] } => {
  if (!html) return { lines: [], documents: [], documentIds: [] };
  const { documents, documentIds, textHtml } = extractDocumentsFromHtml(html);
  // Replace single <br> with newlines
  const withNewlines = textHtml.replace(/<br\s*\/?>/gi, '\n');
  // Strip remaining tags and split lines
  const plain = withNewlines.replace(/<[^>]+>/g, '');
  const lines = plain
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return { lines, documents, documentIds };
};

const parseTopicDetail = (detail?: string | null): ConferenceWeekDetailSessionTopTopic[] => {
  if (!detail) return [];
  const groups = splitGroupsByDoubleBreaks(detail);
  if (groups.length === 0) {
    const { lines, documents, documentIds } = htmlToLines(detail);
    return lines.length || documents.length ? [{ lines, documents, documentIds }] : [];
  }
  const topics: ConferenceWeekDetailSessionTopTopic[] = [];
  for (const g of groups) {
    const { lines, documents, documentIds } = htmlToLines(g);
    if (lines.length || documents.length) topics.push({ lines, documents, documentIds });
  }
  return topics;
};

const parseStatusDetail = (detail?: string | null): ConferenceWeekDetailSessionTopStatus[] => {
  if (!detail) return [];
  const groups = splitGroupsByDoubleBreaks(detail);
  const statuses: ConferenceWeekDetailSessionTopStatus[] = [];
  if (groups.length === 0) {
    const { lines, documents, documentIds } = htmlToLines(detail);
    if (lines.length || documents.length) statuses.push({ lines, documents, documentIds });
    return statuses;
  }
  for (const g of groups) {
    const { lines, documents, documentIds } = htmlToLines(g);
    if (lines.length || documents.length) statuses.push({ lines, documents, documentIds });
  }
  return statuses;
};

export const parseConferenceWeekJson = (
  url: string,
  year: number,
  week: number,
  data: JsonWeek,
): ConferenceWeekDetail => {
  const sessions: ConferenceWeekDetailSession[] = [];

  for (const conf of data.conferences || []) {
    const dateText = conf.conferenceDate?.date || null;
    const { iso } = parseGermanDateToISO(dateText);
    const sessionId = conf.conferenceNumber != null ? String(conf.conferenceNumber) : null;

    const tops: ConferenceWeekDetailSessionTop[] = [];
    for (const row of conf.rows || []) {
      const topicTitle = row.topic?.title ?? null;
      const topicDetail = row.topic?.detail ?? null;
      const topicLink = row.topic?.link ?? null;

      const topic = parseTopicDetail(topicDetail);
      const status = parseStatusDetail(row.status?.detail ?? null);

      tops.push({
        time: parseTimeString(row.time || '', iso || undefined) ?? null,
        top: row.top ?? null,
        heading: topicTitle,
        article: topicLink || null,
        topic,
        status,
      });
    }

    sessions.push({
      date: iso,
      dateText,
      session: sessionId,
      tops,
    });
  }

  return {
    url,
    year,
    week,
    previousWeek:
      data.previous?.year && data.previous?.week
        ? { year: data.previous.year as number, week: data.previous.week as number }
        : undefined,
    nextWeek:
      data.next?.year && data.next?.week
        ? { year: data.next.year as number, week: data.next.week as number }
        : undefined,
    sessions,
  };
};
