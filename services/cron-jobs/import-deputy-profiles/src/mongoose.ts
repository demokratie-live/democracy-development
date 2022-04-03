import { mongoose } from '@democracy-deutschland/bundestagio-common';

let connection: typeof mongoose;

export const mongoConnect = async () => {
  mongoose.set('debug', false);

  connection = await mongoose.connect(process.env.DB_URL!);

  mongoose.connection.once('connected', () => {
    console.info('MongoDB is running');
  });
  mongoose.connection.on('error', (e: Error) => {
    console.error(e.stack);
    throw e;
  });
};

export const mongoDisconnect = () => {
  if (connection) {
    return connection.disconnect();
  }
};
