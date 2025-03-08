import { ConferenceWeekDetailParser } from '../ConferenceWeekDetailParser';
import { DataPackage } from '@democracy-deutschland/scapacra';
import { ConferenceWeekDetailsData, ConferenceWeekDetailsMeta } from '../ConferenceWeekDetailBrowser';

export interface TestTop {
  time: Date | null;
  top: string | null;
  heading: string | null;
  article: string | null;
  topic: Array<{ lines: string[]; documents: string[] }>;
  status: Array<{ line: string; documents: string[] }>;
}

export interface TestSession {
  date: Date | null;
  dateText: string | null;
  session: string | null;
  tops: TestTop[];
}

export interface TestParserData {
  id: string;
  previous: { year: number | null; week: number | null };
  this: { year: number | null; week: number | null };
  next: { year: number | null; week: number | null };
  sessions: TestSession[];
}

// Create a type that includes all methods we need to test
export type TestableParser = {
  [K in keyof ConferenceWeekDetailParser]: ConferenceWeekDetailParser[K];
} & {
  parseYearsAndWeeks(input: string): {
    lastYear: number | null;
    lastWeek: number | null;
    nextYear: number | null;
    nextWeek: number | null;
  };
  getThisYearAndWeek(sessions: TestSession[]): {
    thisYear: number | null;
    thisWeek: number | null;
  };
  parseSession(dateText: string, sessionNumber: string, sessionData: string): TestSession;
  extractDocuments(text: string): string[];
  parseTopicData(topic: string, top: TestTop): void;
  parseStatusData(statusText: string, top: TestTop): void;
  parseTops(sessionData: string, dateText: string): TestTop[];
  parseTopicParts(content: string): Array<{ lines: string[]; documents: string[] }>;
  extractTopicContent(topic: string): string;
  extractStatusContent(statusText: string): string;
  generateId(
    input: DataPackage<ConferenceWeekDetailsData, ConferenceWeekDetailsMeta>,
    year: number | null,
    week: number | null,
  ): string;
};
