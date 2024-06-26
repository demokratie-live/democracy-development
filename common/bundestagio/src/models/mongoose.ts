import Mongoose from 'mongoose';
const mongoose = Mongoose;
export { mongoose };

export const mongoConnect = async (dbUrl: string) =>
  new Promise(async (resolve) => {
    // Mongo Debug
    mongoose.set('debug', false);
    mongoose.connect(dbUrl);

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
