import { log } from 'crawlee';
import { config } from './config.js';
import type { IConferenceWeekDetail } from '@democracy-deutschland/bundestagio-common';
import { fetchConferenceWeeks, type FetchConferenceWeekOptions } from './services/json-fetcher';
import { mapJSONToConferenceWeekDetail } from './services/json-to-session-mapper';
import { getProcedureIds } from './utils/vote-detection';

export interface CrawlerConfig {
  baseUrl?: string;
  maxConcurrency?: number;
  retryOnBlocked?: boolean;
  maxRequestRetries?: number;
  maxRequestsPerMinute?: number;
  maxRequestsPerCrawl?: number;
}

export const DEFAULT_CONFIG: CrawlerConfig = {
  baseUrl: 'https://www.bundestag.de/apps/plenar/plenar',
  maxConcurrency: 1,
  retryOnBlocked: true,
  maxRequestRetries: 10,
  maxRequestsPerMinute: 60,
  maxRequestsPerCrawl: config.crawl.maxRequestsPerCrawl,
};

/**
 * Fetches and processes conference weeks from Bundestag JSON API
 * Replaces the old CheerioCrawler-based implementation
 */
export const crawlConferenceWeeks = async (
  crawlerConfig: Partial<CrawlerConfig> = {},
): Promise<Partial<IConferenceWeekDetail>[]> => {
  const fullConfig = { ...DEFAULT_CONFIG, ...crawlerConfig };
  const results: Partial<IConferenceWeekDetail>[] = [];

  // Determine starting point (current year/week or configured)
  const fetchOptions: FetchConferenceWeekOptions = {
    year: config.conference.year,
    week: config.conference.week,
  };

  log.info('Starting conference week import', {
    startYear: fetchOptions.year,
    startWeek: fetchOptions.week,
    maxRequests: fullConfig.maxRequestsPerCrawl,
  });

  try {
    // Fetch multiple weeks from JSON API
    const fetchedWeeks = await fetchConferenceWeeks(fetchOptions, fullConfig.maxRequestsPerCrawl || 10);

    // Process each fetched week
    for (const { data, year, week } of fetchedWeeks) {
      log.info(`Processing conference week ${year}-${week}`);

      // Map JSON to database schema
      const conferenceWeek = mapJSONToConferenceWeekDetail(data, year, week);

      // Populate procedureIds for topics with documents
      // This requires async database lookup
      for (const session of conferenceWeek.sessions || []) {
        for (const top of session.tops) {
          for (const topic of top.topic) {
            if (topic.documents.length > 0) {
              topic.procedureIds = await getProcedureIds(topic.documents);
            }
          }
        }
      }

      results.push(conferenceWeek);
    }

    log.info(`Successfully processed ${results.length} conference weeks`);
  } catch (error) {
    log.error('Error during conference week import', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  return results;
};
