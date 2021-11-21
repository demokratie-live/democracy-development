import { mongoose } from '@democracy-deutschland/bundestagio-common';

export default () =>
  new Promise(async (resolve, reject) => {
    // Mongo Debug
    mongoose.set('debug', false);

    mongoose.connect(process.env.DB_URL!);

    mongoose.connection.once('connected', () => {
      console.info('MongoDB is running');
      resolve(true);
    });
    mongoose.connection.on('error', (e: Error) => {
      // Unknown if this ends up in main - therefore we log here
      console.error(e.stack);
      throw e;
    });
  });
