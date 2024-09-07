import { log } from './logger';
import { initDb } from './db';
import { createLegislaturperiode, getLegislaturperioden, legislaturperiodeExists } from './functions';
import { legislaturperiodenDump } from './data';

(async () => {
  const db = await initDb();

  if (!db) {
    log.info('Failed to initialize SurrealDB');
    throw new Error('Failed to initialize SurrealDB');
  }

  // Assign the variable on the connection
  for (const legislaturperiode of legislaturperiodenDump) {
    if (!(await legislaturperiodeExists(db, legislaturperiode))) {
      await createLegislaturperiode(db, legislaturperiode);
    }
  }

  const newLegislaturperioden = await getLegislaturperioden(db);

  log.debug('Legislaturperioden:', newLegislaturperioden);
})();
