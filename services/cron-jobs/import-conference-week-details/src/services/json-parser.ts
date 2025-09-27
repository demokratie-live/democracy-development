import { ConferenceWeekDetailSession, NavigationData } from '../types.js';

/**
 * Interface for the JSON response structure from conferenceWeekJSON endpoint
 * This is based on the expected structure from the Bundestag API
 */
interface ConferenceWeekJSON {
  year?: number;
  week?: number;
  previousWeek?: {
    year: number;
    week: number;
  };
  nextWeek?: {
    year: number;
    week: number;
  };
  sessions?: Array<{
    date?: string;
    dateText?: string;
    session?: string;
    tops?: Array<{
      time?: string;
      top?: string;
      heading?: string;
      article?: string;
      topic?: Array<{
        lines?: string[];
        documents?: string[];
      }>;
      status?: Array<{
        lines?: string[];
        documents?: string[];
      }>;
    }>;
  }>;
}

/**
 * Extract document IDs from document URLs
 * Uses the same logic as the HTML parser for consistency
 */
const extractDocumentIds = (documents: string[]): string[] => {
  return documents
    .map((doc) => {
      // Match patterns like /btd/20/038/2003858.pdf
      const match = doc.match(/\/btd\/(\d{2})\/(\d{3})\/(\d+)\.pdf$/);
      if (match) {
        const [, major, _minor, fullId] = match;
        // The fullId contains the real number but with leading zeros, we need to extract just the number
        const actualNumber = fullId.substring(fullId.length - 4);
        // Remove leading zeros
        const parsedNumber = parseInt(actualNumber, 10).toString();
        return `${major}/${parsedNumber}`;
      }
      return null;
    })
    .filter((id): id is string => id !== null);
};

/**
 * Parse date/time string to Date object
 */
const parseDateTime = (timeStr: string | undefined): Date | null => {
  if (!timeStr) return null;

  try {
    // Handle various time formats that might come from JSON
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
      // Format: "09:00"
      const today = new Date();
      const [hours, minutes] = timeStr.split(':').map(Number);
      today.setHours(hours, minutes, 0, 0);
      return today;
    }

    // Try parsing as ISO string or other formats
    const parsed = new Date(timeStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  } catch {
    // Ignore parsing errors
  }

  return null;
};

/**
 * Extract navigation data from JSON response
 */
export const extractNavigationDataFromJSON = (jsonData: ConferenceWeekJSON): NavigationData | null => {
  if (!jsonData.previousWeek && !jsonData.nextWeek) {
    return null;
  }

  return {
    previousYear: jsonData.previousWeek?.year || 0,
    previousWeek: jsonData.previousWeek?.week || 0,
    nextYear: jsonData.nextWeek?.year || 0,
    nextWeek: jsonData.nextWeek?.week || 0,
  };
};

/**
 * Extract session information from JSON response
 */
export const extractSessionInfoFromJSON = (jsonData: ConferenceWeekJSON): ConferenceWeekDetailSession[] => {
  if (!jsonData.sessions) {
    return [];
  }

  return jsonData.sessions.map((session) => ({
    date: session.date || null,
    dateText: session.dateText || null,
    session: session.session || null,
    tops: (session.tops || []).map((top) => ({
      time: parseDateTime(top.time),
      top: top.top || null,
      heading: top.heading || null,
      article: top.article || null,
      topic: (top.topic || []).map((topic) => ({
        lines: topic.lines || [],
        documents: topic.documents || [],
        documentIds: extractDocumentIds(topic.documents || []),
      })),
      status: (top.status || []).map((status) => ({
        lines: status.lines || [],
        documents: status.documents || [],
        documentIds: extractDocumentIds(status.documents || []),
      })),
    })),
  }));
};

/**
 * Parse JSON response from conferenceWeekJSON endpoint
 */
export const parseConferenceWeekJSON = (
  jsonResponse: string,
): {
  navigationData: NavigationData | null;
  sessions: ConferenceWeekDetailSession[];
  year?: number;
  week?: number;
} => {
  try {
    const jsonData: ConferenceWeekJSON = JSON.parse(jsonResponse);

    return {
      navigationData: extractNavigationDataFromJSON(jsonData),
      sessions: extractSessionInfoFromJSON(jsonData),
      year: jsonData.year,
      week: jsonData.week,
    };
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
