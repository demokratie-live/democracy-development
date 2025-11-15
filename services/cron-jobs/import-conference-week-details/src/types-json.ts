/**
 * Type definitions for Bundestag JSON API
 * Endpoint: /apps/plenar/plenar/conferenceWeekJSON?year=YYYY&week=WW
 */

/**
 * Root response from conferenceWeekJSON endpoint
 */
export interface BundestagJSONResponse {
  next: { week: number; year: number } | null;
  previous: { week: number; year: number } | null;
  conferences: ConferenceJSON[];
}

/**
 * Conference = One session (e.g. "39. Sitzung")
 */
export interface ConferenceJSON {
  conferenceNumber: number; // e.g. 39 for "39. Sitzung"
  conferenceDate: {
    date: string; // e.g. "12. November 2025"
  };
  rows: RowJSON[];
}

/**
 * Row = One agenda item (TOP)
 */
export interface RowJSON {
  time: string; // e.g. "15:30"
  top: string; // e.g. "1" or "" for opening/closing
  topic: TopicJSON;
  status: StatusJSON;
  isProtocol: boolean;
}

/**
 * Topic information (single object, not array)
 */
export interface TopicJSON {
  title: string; // e.g. "Befragung der Bundesregierung (BMAS und BMWSB)"
  detail: string; // HTML string with text, <br/> tags, and <a> tags for documents
  link?: string; // e.g. "/dokumente/textarchiv/2025/kw46-de-regierungsbefragung-1117318"
}

/**
 * Status information (single object, not array)
 */
export interface StatusJSON {
  title: string; // e.g. "beendet", "angenommen", "abgelehnt"
  detail?: string; // HTML string with voting results, timestamps, etc.
}

/**
 * Parsed topic detail (after HTML extraction)
 */
export interface ParsedTopicDetail {
  lines: string[];
  documents: string[];
}

/**
 * Parsed status detail (after HTML extraction)
 */
export interface ParsedStatusDetail {
  lines: string[];
  documents: string[];
}
