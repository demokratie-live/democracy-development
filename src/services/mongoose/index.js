import { inspect } from 'util';
import mongoose from 'mongoose';

/*
  THIS FILE AND ALL IMPORTS ARE NOT ALLOWED TO INCLUDE ANY MONGOOSE MODELS
  See index.js for more info
*/
import CONFIG from './../../config';

export default async () => {
  // Mongo Debug
  if (CONFIG.LOGGING_MONGO) {
    mongoose.set('debug', (...rest) => {
      Log[CONFIG.LOGGING_MONGO](inspect(rest));
    });
  }

  // Connect
  try {
    await mongoose.connect(
      CONFIG.DB_URL,
      {},
    );
  } catch (err) {
    await mongoose.createConnection(CONFIG.DB_URL, {});
  }

  // Open
  mongoose.connection.once('open', () => Log.info('MongoDB is running')).on('error', e => {
    // Unknown if this ends up in main - therefore we log here
    Log.error(e.stack);
    throw e;
  });
};
