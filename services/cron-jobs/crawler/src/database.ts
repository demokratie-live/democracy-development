import { mongoConnect } from '@democracy-deutschland/bundestagio-common';
import { Logger } from './logger';

export const connectToDatabase = async (dbUrl: string, logger: Logger): Promise<void> => {
  try {
    logger.info('Connecting to the database...');
    await mongoConnect(dbUrl);
    logger.info('Database connection successful.');
  } catch (error) {
    logger.error('Failed to connect to the database:');
    logger.debug(`Error details: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
};
