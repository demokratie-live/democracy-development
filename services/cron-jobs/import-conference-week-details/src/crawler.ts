import { CheerioCrawler, log, RequestQueue } from 'crawlee';
import { CrawlerConfig, ConferenceWeekDetail } from './types';
import { router } from './routes';

export const DEFAULT_CONFIG: CrawlerConfig = {
  baseUrl: 'https://www.bundestag.de/tagesordnung',
  maxConcurrency: 1,
  retryOnBlocked: true,
  maxRequestRetries: 10,
  maxRequestsPerMinute: 60,
  maxRequestsPerCrawl: process.env.CRAWL_MAX_REQUESTS_PER_CRAWL
    ? parseInt(process.env.CRAWL_MAX_REQUESTS_PER_CRAWL)
    : 10,
};

/**
 * Creates a configured CheerioCrawler instance
 * This function allows reusing the same crawler configuration in both
 * development mode and test scripts
 */
export const createCrawler = async (config: Partial<CrawlerConfig> = {}) => {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  // Create a request queue that will automatically persist
  const requestQueue = await RequestQueue.open();

  log.info('Crawler configuration', { config: fullConfig });

  // Add the starting URL to the queue
  await requestQueue.addRequest({
    url: fullConfig.baseUrl,
    userData: {
      label: 'START',
    },
  });

  // Create the crawler with router as request handler
  const crawler = new CheerioCrawler({
    requestQueue,
    // Use limited concurrency to avoid rate limiting
    maxConcurrency: 2,
    // Set a reasonable request timeout
    requestHandlerTimeoutSecs: 60,
    // Use a reasonable limit for requests per crawl
    maxRequestsPerCrawl: fullConfig.maxRequestsPerCrawl,
    // Define a request handler that routes requests
    requestHandler: router,
  });

  return crawler;
};

/**
 * Main crawler function to crawl conference weeks
 * This is the function that should be called from main.ts or test scripts
 */
export const crawlConferenceWeeks = async (
  config: Partial<CrawlerConfig> = {},
): Promise<readonly ConferenceWeekDetail[]> => {
  const crawler = await createCrawler(config);
  await crawler.run();

  // Import from routes.js to get the results
  const { getResults } = await import('./routes.js');
  return getResults();
};
