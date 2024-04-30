import { mongoose } from '@democracy-deutschland/democracy-common';

/*
  THIS FILE AND ALL IMPORTS ARE NOT ALLOWED TO INCLUDE ANY MONGOOSE MODELS
  See index.js for more info
*/
import CONFIG from '../../config';
import { logger } from '../logger';

export default async () => {
  // Mongo Debug
  if (CONFIG.LOGGING_MONGO) {
    mongoose.set('debug', () => {
      // logger[CONFIG.LOGGING_MONGO](inspect(true));
    });
  }

  // Connect
  console.log("mongodbUrl", CONFIG.DB_URL);
  try {
    await mongoose.connect(CONFIG.DB_URL, { useNewUrlParser: true, reconnectTries: 86400 });
  } catch (err) {
    logger.error(err);
    await mongoose.createConnection(CONFIG.DB_URL, {});
  }

  // Open
  mongoose.connection
    .once('open', () => logger.info('MongoDB is running'))
    .on('error', (e) => {
      // Unknown if this ends up in main - therefore we log here
      logger.error(e.stack);
      throw e;
    });
};
