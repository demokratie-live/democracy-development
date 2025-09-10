import { createCheerioRouter, CheerioCrawlingContext } from 'crawlee';
import { extractNavigationData, extractSessionInfo } from './services/html-parser.js';
import { config } from './config.js';
import { processConferenceWeekDetailUrl } from './utils/url.js';
import { ConferenceWeekDetail } from './types.js';

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

  // Build initial detail URL from central configuration
  const absoluteUrl = new URL(
    `/apps/plenar/plenar/conferenceweekDetail.form?year=${config.conference.year}&week=${config.conference.week}&limit=${config.conference.limit}`,
    'https://www.bundestag.de',
  ).href;

  await enqueueLinks({
    urls: [absoluteUrl],
    label: 'DETAIL',
    userData: {
      sourceUrl: request.url,
    },
  });

  log.info(`Enqueued conference week detail URLs`);

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

  // Extract conference week details
  const detail = processConferenceWeekDetailUrl(request.url);

  // Extract navigation data
  const navigationData = extractNavigationData($);

  // Extract session information
  const sessions = extractSessionInfo($);

  // Combine data
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

    // Store the result
    crawledResults.push(conferenceWeek);
    log.info(
      `Processed conference week for ${conferenceWeek.year} week ${conferenceWeek.week} with ${sessions.length} sessions`,
    );

    // Enqueue navigation links if they exist
    const urls = [];
    if (navigationData?.previousYear && navigationData?.previousWeek) {
      const prevUrl = `/apps/plenar/plenar/conferenceweekDetail.form?year=${navigationData.previousYear}&week=${navigationData.previousWeek}`;
      urls.push(new URL(prevUrl, 'https://www.bundestag.de').href);
    }
    if (navigationData?.nextYear && navigationData?.nextWeek) {
      const nextUrl = `/apps/plenar/plenar/conferenceweekDetail.form?year=${navigationData.nextYear}&week=${navigationData.nextWeek}`;
      urls.push(new URL(nextUrl, 'https://www.bundestag.de').href);
    }

    if (urls.length > 0) {
      // Filter out already processed URLs
      const newUrls = urls.filter((url) => !processedUrls.has(url));
      if (newUrls.length > 0) {
        await enqueueLinks({
          urls: newUrls,
          label: 'DETAIL',
          userData: {
            sourceUrl: request.url,
          },
        });
        log.info(`Enqueued ${newUrls.length} navigation URLs`);
      }
    }
  } else {
    log.warning(`Failed to extract conference week details from ${request.url}`);
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
