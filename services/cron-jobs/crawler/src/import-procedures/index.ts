import { getCron, mongoConnect, setCronStart, setCronSuccess } from '@democracy-deutschland/bundestagio-common';
import { CONFIG } from '../config';
import importProcedures from './import-procedures';

(async () => {
  await mongoConnect(CONFIG.DB_URL);
  const cronjob = await getCron({ name: 'import-procedures' });
  console.log('cronjob', cronjob.lastSuccessStartDate);
  await setCronStart({ name: 'import-procedures' });
  await importProcedures({
    ...CONFIG,
    IMPORT_PROCEDURES_FILTER_AFTER:
      cronjob?.lastSuccessStartDate?.toISOString() || CONFIG.IMPORT_PROCEDURES_FILTER_AFTER,
  });
  await setCronSuccess({ name: 'import-procedures', successStartDate: cronjob.lastStartDate || new Date() });
  process.exit(0);
})();
