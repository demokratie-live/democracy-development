import { createCheerioRouter, CheerioCrawlingContext } from 'crawlee';
import axios from 'axios';
import { extractEntryUrls, extractNavigationData, extractSessionInfo } from './services/html-parser.js';
import { processConferenceWeekDetailUrl } from './utils/url.js';
import { ConferenceWeekDetail } from './types.js';
import { parseConferenceWeekJson, JsonWeek } from './services/json-parser.js';
import { parseUrlParams } from './utils/url.js';

// Storage for crawled results
const crawledResults: ConferenceWeekDetail[] = [];

// Track processed URLs to avoid duplicates
const processedUrls = new Set<string>();

// Create a router to handle different request types
export const router = createCheerioRouter();

// Type for handler context - we don't need to override enqueueLinks anymore
export type HandlerContext = CheerioCrawlingContext;

// Type for default handler context
interface DefaultHandlerContext {
  request: { url: string };
  log: {
    info: (message: string) => void;
    warning: (message: string) => void;
    error: (message: string) => void;
  };
  userData?: {
    reset?: boolean;
    sourceUrl?: string;
  };
}

// Export the handler functions for testing
export const startHandler = async ({ $, request, enqueueLinks, log, response }: HandlerContext): Promise<void> => {
  log.info(`Processing start URL: ${request.url}`);

  log.info(`Response status:`);
  console.log(Object.entries(response.headers));
  if (String(response.headers[':status']) !== '200') {
    log.error(`Failed to fetch start URL: ${request.url}`);
    log.error(`Response status: ${response.headers[':status']}`);
    log.error(`Response headers: ${JSON.stringify(response.headers)}`);
    log.error(`Response body: ${$('body').text()}`);
    throw new Error(`Failed to fetch start URL: ${request.url}`);
  }

  // Extract conference week URLs
  const entryUrls = extractEntryUrls($);

  if (entryUrls.length > 0) {
    // Enqueue all detail URLs with a label
    for (const relativeUrl of entryUrls) {
      const absoluteUrl = new URL(relativeUrl, 'https://www.bundestag.de').href;

      // Skip already processed URLs
      if (processedUrls.has(absoluteUrl)) continue;

      await enqueueLinks({
        urls: [absoluteUrl],
        label: 'DETAIL',
        userData: {
          sourceUrl: request.url,
        },
      });
    }
    log.info(`Enqueued ${entryUrls.length} conference week detail URLs`);
  } else {
    log.warning('No conference week URLs found on the start page');
  }

  // Mark the start URL as processed after we've handled it
  processedUrls.add(request.url);
};

// Export the detail handler for testing
export const detailHandler = async ({ $, request, enqueueLinks, log }: HandlerContext): Promise<void> => {
  log.info(`Processing detail page: ${request.url}`);

  // Skip already processed URLs
  if (processedUrls.has(request.url)) {
    log.info(`Skipping already processed URL: ${request.url}`);
    return;
  }

  // Try new JSON-based interface first
  const params = parseUrlParams(request.url);
  let usedJson = false;
  if (params) {
    const { year, week } = params;
    const jsonUrl = `https://www.bundestag.de/tagesordnung?week=${encodeURIComponent(week)}&year=${encodeURIComponent(
      year,
    )}`;

    try {
      const response = await axios.get(jsonUrl, {
        headers: { Accept: 'application/json' },
        // Sometimes the site requires same-origin; but axios from server is fine
        validateStatus: (status) => status >= 200 && status < 300,
      });

      const data = response.data as unknown as Partial<JsonWeek>;
      if (data && typeof data === 'object' && Array.isArray(data.conferences)) {
        const urlPath = `/tagesordnung?week=${week}&year=${year}`;
        const parsed = parseConferenceWeekJson(urlPath, year, week, data as JsonWeek);

        crawledResults.push(parsed);
        log.info(
          `Processed conference week (JSON) for ${parsed.year} week ${parsed.week} with ${parsed.sessions.length} sessions`,
        );

        // enqueue navigation
        const navUrls: string[] = [];
        if (parsed.previousWeek) {
          navUrls.push(
            new URL(
              `/tagesordnung?week=${parsed.previousWeek.week}&year=${parsed.previousWeek.year}`,
              'https://www.bundestag.de',
            ).href,
          );
        }
        if (parsed.nextWeek) {
          navUrls.push(
            new URL(
              `/tagesordnung?week=${parsed.nextWeek.week}&year=${parsed.nextWeek.year}`,
              'https://www.bundestag.de',
            ).href,
          );
        }

        if (navUrls.length > 0) {
          const newUrls = navUrls.filter((u) => !processedUrls.has(u));
          if (newUrls.length > 0) {
            await enqueueLinks({
              urls: newUrls,
              label: 'DETAIL',
              userData: { sourceUrl: request.url },
            });
            log.info(`Enqueued ${newUrls.length} navigation URLs (JSON)`);
          }
        }

        usedJson = true;
      }
    } catch {
      log.warning(`JSON fetch failed for ${jsonUrl}, falling back to HTML parsing`);
    }
  }

  if (!usedJson) {
    // Fallback: old HTML-based parsing (kept for backward compatibility and tests)
    const detail = processConferenceWeekDetailUrl(request.url);
    const navigationData = extractNavigationData($);
    const sessions = extractSessionInfo($);

    if (detail && detail.length > 0) {
      const conferenceWeek = {
        ...detail[0],
        previousWeek:
          navigationData?.previousYear && navigationData?.previousWeek
            ? { year: navigationData.previousYear, week: navigationData.previousWeek }
            : undefined,
        nextWeek:
          navigationData?.nextYear && navigationData?.nextWeek
            ? { year: navigationData.nextYear, week: navigationData.nextWeek }
            : undefined,
        sessions,
      };

      crawledResults.push(conferenceWeek);
      log.info(
        `Processed conference week (HTML) for ${conferenceWeek.year} week ${conferenceWeek.week} with ${sessions.length} sessions`,
      );

      const urls = [] as string[];
      if (navigationData?.previousYear && navigationData?.previousWeek) {
        const prevUrl = `/apps/plenar/plenar/conferenceweekDetail.form?year=${navigationData.previousYear}&week=${navigationData.previousWeek}`;
        urls.push(new URL(prevUrl, 'https://www.bundestag.de').href);
      }
      if (navigationData?.nextYear && navigationData?.nextWeek) {
        const nextUrl = `/apps/plenar/plenar/conferenceweekDetail.form?year=${navigationData.nextYear}&week=${navigationData.nextWeek}`;
        urls.push(new URL(nextUrl, 'https://www.bundestag.de').href);
      }

      if (urls.length > 0) {
        const newUrls = urls.filter((url) => !processedUrls.has(url));
        if (newUrls.length > 0) {
          await enqueueLinks({
            urls: newUrls,
            label: 'DETAIL',
            userData: { sourceUrl: request.url },
          });
          log.info(`Enqueued ${newUrls.length} navigation URLs (HTML)`);
        }
      }
    } else {
      log.warning(`Failed to extract conference week details from ${request.url}`);
    }
  }

  // Only mark the URL as processed AFTER we've actually processed it
  processedUrls.add(request.url);
};

// Export the default handler for testing
export const defaultHandler = async ({ request, log, userData }: DefaultHandlerContext): Promise<void> => {
  // Special handling for test reset flag
  if (userData?.reset === true) {
    processedUrls.clear();
    crawledResults.length = 0;
    return;
  }

  log.info(`Processing ${request.url} (default handler)`);
  log.warning(`No specific handler found for URL: ${request.url}`);
};

// Add the exported handlers to the router
router.addHandler('START', startHandler);
router.addHandler('DETAIL', detailHandler);
router.addDefaultHandler(defaultHandler);

// Export the results for external access
export const getResults = (): readonly ConferenceWeekDetail[] => crawledResults;

// Export a reset function for testing purposes
export const resetForTests = (): void => {
  processedUrls.clear();
  crawledResults.length = 0;
};
