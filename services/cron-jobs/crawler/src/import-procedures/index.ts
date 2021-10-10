import { mongoConnect, mongoDisconnect } from '../mongoose';
import {
  getCron,
  setCronError,
  setCronStart,
  setCronSuccess,
} from '@democracy-deutschland/bundestagio-common';
import config from '../config';
import importProcedures from './import-procedures';
import debug from 'debug';
const error = debug('bundestag-io:import-procedures:error');

(async () => {
  let withError = false;
  try {
    await mongoConnect();
    const cronjob = await getCron({ name: 'import-procedures' });
    await setCronStart({ name: 'import-procedures' });
    await importProcedures({
      ...config,
      IMPORT_PROCEDURES_FILTER_AFTER:
        cronjob?.lastSuccessDate?.toISOString().slice(0, 10) || config.IMPORT_PROCEDURES_FILTER_AFTER,
    });
    await setCronSuccess({ name: 'import-procedures', successStartDate: cronjob.lastStartDate || new Date() });
  } catch (err) {
    withError = true;
    error(err);
    await setCronError({ name: 'import-procedures', error: err });
    throw err;
  } finally {
    mongoDisconnect();
  }
  if (withError) {
    process.exit(1);
  }
})();
