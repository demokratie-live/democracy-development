import config from './config';
import { mongoose } from '@democracy-deutschland/bundestagio-common';

let connection: typeof mongoose;

export const mongoConnect: () => Promise<void> = async () => {
  mongoose.set('useFindAndModify', false);
  mongoose.set('debug', false);

  connection = await mongoose.connect(config.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.connection.once('connected', () => {
    // eslint-disable-next-line no-console
    console.info('MongoDB is running');
  });
  mongoose.connection.on('error', (err: Error) => {
    // eslint-disable-next-line no-console
    console.error(err.stack);
    throw err;
  });
};

export const mongoDisconnect: () => Promise<void> = () => {
  if (connection) {
    return connection.disconnect();
  }
  return Promise.resolve();
};
