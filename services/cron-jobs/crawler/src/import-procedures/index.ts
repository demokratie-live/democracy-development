import { CONFIG } from '../config';
import { Logger } from '../logger';
import { connectToDatabase } from '../database';
import { handleCronJob } from '../cronJob';

/**
 * Runs the import procedures by connecting to the database, handling the cron job, and exiting the process.
 * @param config - The configuration object.
 * @param logger - The logger instance.
 */
const logImportStart = (logger: Logger) => {
  logger.info('Starting import procedures...');
};

const logImportEnd = (logger: Logger) => {
  logger.info('Import procedures completed.');
};

const connectAndRunImport = async (config: typeof CONFIG, logger: Logger) => {
  await connectToDatabase(config.DB_URL, logger);
  await handleCronJob(config, logger);
};

const runImport = async (config: typeof CONFIG, logger: Logger) => {
  logImportStart(logger);
  await connectAndRunImport(config, logger);
  logImportEnd(logger);
};

export const runImportProcedures = async (config: typeof CONFIG, logger: Logger): Promise<void> => {
  await runImport(config, logger);
};
