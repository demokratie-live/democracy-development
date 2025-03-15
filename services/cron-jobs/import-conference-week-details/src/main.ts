// Entry point for the crawler following Crawlee's recommended structure
import { log } from 'crawlee';
import { crawlConferenceWeeks } from './crawler.js';

// Set up basic logging
log.setLevel(log.LEVELS.INFO);

export async function main() {
  // Execute the crawler using the shared crawlConferenceWeeks function
  log.info('Starting the crawler...');
  const results = await crawlConferenceWeeks();

  log.info(`Crawler finished, found ${results.length} conference weeks`);

  return results;
}
