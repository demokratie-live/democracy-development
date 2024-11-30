import { CONFIG } from './config';
import { logger } from './logger';
import { runImportProcedures } from './import-procedures';

/**
 * Main function to run the import procedures.
 */
const main = async (): Promise<void> => {
  try {
    await runImportProcedures(CONFIG, logger);
  } catch (error) {
    logger.error('An unexpected error occurred:');
    logger.debug(`Error details: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
};

(async () => {
  await main();
  process.exit(0);
})();
