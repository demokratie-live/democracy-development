import { CheerioCrawler, RequestQueue } from 'crawlee';
import { CrawlerConfig, ConferenceWeekDetail } from './types';
import { router } from './routes';

export const DEFAULT_CONFIG: CrawlerConfig = {
  baseUrl: 'https://www.bundestag.de/tagesordnung',
  maxConcurrency: 1,
  retryOnBlocked: true,
  maxRequestRetries: 10,
  maxRequestsPerMinute: 30, // Conservative: 30 requests per minute to avoid overwhelming the server
};

/**
 * Creates a configured CheerioCrawler instance with intelligent rate limiting
 * Handles HTTP 429 (Too Many Requests) automatically through retries
 */
export const createCrawler = async (config: Partial<CrawlerConfig> = {}) => {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  // Create a request queue that will automatically persist
  const requestQueue = await RequestQueue.open();

  // Add the starting URL to the queue
  await requestQueue.addRequest({
    url: fullConfig.baseUrl,
    userData: {
      label: 'START',
    },
  });

  // Track rate-limiting events for monitoring
  let rateLimitCount = 0;

  // Create the crawler with router as request handler
  const crawler = new CheerioCrawler({
    requestQueue,
    // Conservative concurrency to avoid overwhelming the server
    maxConcurrency: fullConfig.maxConcurrency,
    // Set a reasonable request timeout
    requestHandlerTimeoutSecs: 60,
    // Rate limiting: max requests per minute
    maxRequestsPerMinute: fullConfig.maxRequestsPerMinute,
    // Retry on blocked (HTTP 429, 503, etc.)
    maxRequestRetries: fullConfig.maxRequestRetries,
    // No artificial request limit - crawl all necessary pages
    // The crawler will stop when the queue is empty
    // Define a request handler that routes requests
    requestHandler: router,
    // Monitor failed requests for rate-limiting
    failedRequestHandler: async ({ request }, error) => {
      if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        rateLimitCount++;
        console.warn(`⚠️  Rate limit hit (HTTP 429) - Total: ${rateLimitCount} | URL: ${request.url}`);
      }
    },
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
