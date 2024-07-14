import { mongoose } from '@democracy-deutschland/democracy-common';

/*
  THIS FILE AND ALL IMPORTS ARE NOT ALLOWED TO INCLUDE ANY MONGOOSE MODELS
  See index.js for more info
*/
import CONFIG from '../../config';
import { logger } from '../logger';

export const connectDB = async (
  dbUrl = CONFIG.DB_URL,
  { debug } = { debug: CONFIG.LOGGING_MONGO },
) => {
  // Mongo Debug
  if (debug) {
    mongoose.set('debug', true);
    console.log('mongodbUrl', dbUrl);
  }

  // Connect
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    logger.error(err);
    await mongoose.createConnection(dbUrl, {});
  }

  // Open
  mongoose.connection
    .once('open', () => logger.info(`MongoDB is running on ${dbUrl}`))
    .on('error', (e) => {
      // Unknown if this ends up in main - therefore we log here
      logger.error(e.stack);
      throw e;
    });
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};
