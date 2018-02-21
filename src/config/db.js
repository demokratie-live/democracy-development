import mongoose from 'mongoose';

import CONSTANTS from './constants';

mongoose.Promise = global.Promise;

// mongoose.set('debug', true);

try {
  mongoose.connect(process.env.DB_URL, {});
} catch (err) {
  mongoose.createConnection(process.env.DB_URL, {});
}

mongoose.connection.once('open', () => {}).on('error', (e) => {
  throw e;
});

export default mongoose;
