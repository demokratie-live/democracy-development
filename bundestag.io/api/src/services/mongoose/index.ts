import { mongoose } from '@democracy-deutschland/bundestagio-common';

/*
  THIS FILE AND ALL IMPORTS ARE NOT ALLOWED TO INCLUDE ANY MONGOOSE MODELS
  See index.js for more info
*/
import CONFIG from '../../config';

export default async () => {
  // Connect
  try {
    await mongoose.connect(CONFIG.DB_URL);
  } catch (err) {
    await mongoose.createConnection(CONFIG.DB_URL);
  }

  // Open
  mongoose.connection
    .once('open', () => console.info('MongoDB is running'))
    .on('error', (e) => {
      // Unknown if this ends up in main - therefore we log here
      console.error(e.stack);
      throw e;
    });
};
