// Entry point for the crawler following Crawlee's recommended structure
import { log } from 'crawlee';
import { crawlConferenceWeeks } from './crawler.js';
import type { IConferenceWeekDetail } from '@democracy-deutschland/bundestagio-common';

// Set up basic logging
log.setLevel(log.LEVELS.INFO);

let cachedResults: Partial<IConferenceWeekDetail>[] = [];

export async function main() {
  // Execute the crawler using the shared crawlConferenceWeeks function
  log.info('Starting the crawler...');
  const results = await crawlConferenceWeeks();

  log.info(`Crawler finished, found ${results.length} conference weeks`);

  // Cache results for retrieval
  cachedResults = results;

  return results;
}

/**
 * Get the results from the last crawler run
 */
export function getResults(): Partial<IConferenceWeekDetail>[] {
  return cachedResults;
}
