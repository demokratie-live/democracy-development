import { mongoConnect, mongoDisconnect } from "./mongoose";
import importProcedures from './procedures'

import {
  setCronStart,
  setCronSuccess,
  setCronError,
} from "@democracy-deutschland/bundestagio-common";

let cronStart: Date | null = null;
const CRON_NAME = "Procedures";



(async () => {
  try {
    cronStart = new Date();
    // await setCronStart({ name: CRON_NAME, startDate: cronStart });
    await mongoConnect();
    await importProcedures()
    // await setCronSuccess({ name: CRON_NAME, successStartDate: cronStart! });
    process.exit(0);
  } catch(err) {
    // await setCronError({ name: CRON_NAME, error: JSON.stringify(err) });
    process.exit(1)
  } finally {
    mongoDisconnect()
  }
})();
