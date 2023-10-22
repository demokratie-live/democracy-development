import { getCron, mongoConnect, setCronStart, setCronSuccess } from '@democracy-deutschland/bundestagio-common';
import config from '../config';
import importProcedures from './import-procedures';

(async () => {
  await mongoConnect();
  const cronjob = await getCron({ name: 'import-procedures' });
  await setCronStart({ name: 'import-procedures' });
  await importProcedures({
    ...config,
    IMPORT_PROCEDURES_FILTER_AFTER:
      // cronjob?.lastSuccessDate?.toISOString().slice(0, 10) ||
      config.IMPORT_PROCEDURES_FILTER_AFTER,
  });
  await setCronSuccess({ name: 'import-procedures', successStartDate: cronjob.lastStartDate || new Date() });
  process.exit(0);
})();
