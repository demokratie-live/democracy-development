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

// DIP changes can become visible in the search index after their `aktualisiert` timestamp.
const LAST_RUN_OVERLAP_MS = 60 * 60 * 1000;

/**
 * Determines the start of the DIP filter (`f.aktualisiert.start`) and the reason for it.
 */
export const getFilterAfter = (cronjob: ICronJob, config: typeof CONFIG): { filterAfter: string; reason: string } => {
  const lastSuccessStartDate = cronjob?.lastSuccessStartDate;
  if (config.IMPORT_PROCEDURES_IGNORE_LAST_RUN) {
    return {
      filterAfter: config.IMPORT_PROCEDURES_FILTER_AFTER,
      reason: `IMPORT_PROCEDURES_FILTER_AFTER, last successful run (${lastSuccessStartDate?.toISOString() ?? 'none'}) ignored because IMPORT_PROCEDURES_IGNORE_LAST_RUN=true`,
    };
  }
  if (!lastSuccessStartDate) {
    return {
      filterAfter: config.IMPORT_PROCEDURES_FILTER_AFTER,
      reason: 'IMPORT_PROCEDURES_FILTER_AFTER, no successful run recorded',
    };
  }
  return {
    filterAfter: new Date(lastSuccessStartDate.getTime() - LAST_RUN_OVERLAP_MS).toISOString(),
    reason: `start of last successful run (${lastSuccessStartDate.toISOString()}) minus ${LAST_RUN_OVERLAP_MS / 60000} min overlap`,
  };
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
    const { filterAfter, reason } = getFilterAfter(cronjob, config);
    logger.info(`Importing procedures updated after ${filterAfter} (${reason})`);
    await importProcedures({
      ...config,
      IMPORT_PROCEDURES_FILTER_AFTER: filterAfter,
    });
    logger.info('Import procedures executed successfully.');
  } catch (error) {
    handleImportError(error, logger);
  }
};
