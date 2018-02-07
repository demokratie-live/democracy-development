/* eslint-disable no-console */
import mongoose from 'mongoose';

import CONSTANTS from './constants';

mongoose.Promise = global.Promise;

// mongoose.set('debug', true);
(async () => {
  try {
    mongoose.connect(CONSTANTS.DB_URL, {});
  } catch (err) {
    mongoose.createConnection(CONSTANTS.DB_URL, {});
  }

  mongoose.connection.once('open', () => console.log('MongoDB is running')).on('error', (e) => {
    throw e;
  });
})();

export default mongoose;
