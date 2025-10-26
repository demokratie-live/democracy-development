import { CheerioAPI } from 'cheerio';
import { CheerioCrawlerOptions, CrawlerAddRequestsResult } from 'crawlee';

// Conference week detail session information
export interface ConferenceWeekDetailSession {
  date: string | null;
  dateText: string | null;
  session: string | null;
  tops: ConferenceWeekDetailSessionTop[];
}

export interface ConferenceWeekDetailSessionTop {
  time: Date | null;
  top: string | null;
  heading: string | null;
  article: string | null;
  topic: ConferenceWeekDetailSessionTopTopic[];
  status: ConferenceWeekDetailSessionTopStatus[];
}

export interface ConferenceWeekDetailSessionTopTopic {
  lines: string[];
  documents: string[];
  documentIds?: string[]; // Add document IDs for easier reference
}

export interface ConferenceWeekDetailSessionTopStatus {
  lines: string[];
  documents: string[];
  documentIds?: string[]; // Add document IDs for easier reference
}

// Define the structure of a conference week detail
export interface ConferenceWeekDetail {
  url: string;
  year: number;
  week: number;
  previousWeek?: {
    year: number;
    week: number;
  };
  nextWeek?: {
    year: number;
    week: number;
  };
  sessions: ConferenceWeekDetailSession[];
}

// Configuration options for the crawler
export interface CrawlerConfig extends CheerioCrawlerOptions {
  baseUrl: string;
  maxConcurrency: number;
  retryOnBlocked: boolean;
  maxRequestRetries: number;
  maxRequestsPerMinute: number;
}

// Handler context for request processing
export interface HandlerContext {
  $: CheerioAPI;
  request: { url: string };
  crawler?: {
    addRequests: (requests: { url: string }[]) => Promise<CrawlerAddRequestsResult>;
  };
}

// Navigation data from meta slider
export interface NavigationData {
  previousYear: number;
  previousWeek: number;
  nextYear: number;
  nextWeek: number;
}
