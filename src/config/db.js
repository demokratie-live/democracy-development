import mongoose from 'mongoose';
import { inspect } from 'util';

import CONSTANTS from './constants';

mongoose.Promise = global.Promise;

export default async () => {
  // Mongo Debug
  if (CONSTANTS.LOGGING.MONGO) {
    mongoose.set('debug', (...rest) => {
      Log[CONSTANTS.LOGGING.MONGO](inspect(rest));
    });
  }

  // Connect
  try {
    await mongoose.connect(
      CONSTANTS.DB_URL,
      {},
    );
  } catch (err) {
    await mongoose.createConnection(CONSTANTS.DB_URL, {});
  }

  // Open
  mongoose.connection.once('open', () => Log.info('MongoDB is running')).on('error', e => {
    // Unknown if this ends up in main - therefore we log here
    Log.error(e.stack);
    throw e;
  });
};

export { mongoose };
