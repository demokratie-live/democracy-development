import { getCron, setCronStart, setCronSuccess, ICronJob } from '@democracy-deutschland/bundestagio-common';
import { Logger } from './logger';
import { executeImportProcedures } from './importProceduresExecutor';
import { CONFIG } from './config';

const CRON_JOB_NAME = 'import-procedures';

/**
 * Handles the cron job execution.
 * @param config - The configuration object.
 * @param logger - The logger instance.
 */
export const handleCronJob = async (config: typeof CONFIG, logger: Logger): Promise<void> => {
  try {
    logger.info('Handling cron job...');
    // Taken before DIP is queried: changes made while this run is in progress are picked up by the next run.
    const startDate = new Date();
    const cronjob: ICronJob = await getCron({ name: CRON_JOB_NAME });
    await setCronStart({ name: CRON_JOB_NAME, startDate });
    await executeImportProcedures(cronjob, config, logger);
    await setCronSuccess({ name: CRON_JOB_NAME, successStartDate: startDate });
    logger.info('Cron job handled successfully.');
  } catch (error) {
    logger.error('Failed to handle cron job.');
    logger.debug('Error details: ' + (error instanceof Error ? error.message : error));
    process.exit(1);
  }
};
