import { Logger } from './logger';
import { CONFIG } from './config';
import { ICronJob } from '@democracy-deutschland/bundestagio-common';
import importProcedures from './import-procedures/import-procedures';
import axios from 'axios';

const handleImportError = (error: unknown, logger: Logger) => {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    let errorMessage = `Failed to execute import procedures: ${error.message}`;
    if (statusCode) {
      errorMessage += ` (HTTP status: ${statusCode})`;
      if (statusCode === 401) {
        errorMessage += ' - Unauthorized. Please check your API key.';
      }
    }
    logger.error('Failed to execute import procedures: ');
    logger.debug('Error details: ' + errorMessage);
  } else {
    logger.error('Failed to execute import procedures: ');
    logger.debug('Error details: ' + (error instanceof Error ? error.stack : error));
  }
  process.exit(1);
};

/**
 * Executes the import procedures.
 * @param cronjob - The cron job details.
 * @param config - The configuration object.
 * @param logger - The logger instance.
 */
export const executeImportProcedures = async (
  cronjob: ICronJob,
  config: typeof CONFIG,
  logger: Logger,
): Promise<void> => {
  try {
    logger.info('Executing import procedures...');
    await importProcedures({
      ...config,
      IMPORT_PROCEDURES_FILTER_AFTER:
        cronjob?.lastSuccessStartDate?.toISOString() || config.IMPORT_PROCEDURES_FILTER_AFTER,
    });
    logger.info('Import procedures executed successfully.');
  } catch (error) {
    handleImportError(error, logger);
  }
};
