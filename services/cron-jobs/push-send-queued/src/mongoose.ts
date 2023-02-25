import { mongoose } from '@democracy-deutschland/democracy-common';
import { DB_URL } from './config';

export default () =>
  new Promise(async (resolve) => {
    mongoose.set('useFindAndModify', false);
    // Mongo Debug
    mongoose.set('debug', false);

    mongoose.connect(DB_URL!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    mongoose.connection.once('connected', () => {
      console.info('MongoDB is running');
      resolve(true);
    });
    mongoose.connection.on('error', (e: Error) => {
      // Unknown if this ends up in main - therefore we log here
      console.error(e.stack);
      throw e;
    });
  }).catch(() => {
    process.exit(1);
  });
