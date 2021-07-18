import { mongoConnect, mongoDisconnect } from '../mongoose';
import config from '../config';
import importProcedures from './import-procedures';
import debug from 'debug';
const error = debug('bundestag-io:import-procedures:error');

(async () => {
  try {
    await mongoConnect();
    await importProcedures(config);
  } catch (err) {
    error(err);
    throw err;
  } finally {
    mongoDisconnect();
  }
})();
