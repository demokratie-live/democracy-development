import { mongoConnect } from "./mongoose";

import {
  ProcedureModel,
  setCronStart,
  CronJobModel,
  setCronSuccess,
  setCronError,
} from "@democracy-deutschland/bundestagio-common";
import { PROCEDURE as PROCEDURE_DEFINITIONS } from "@democracy-deutschland/bundestag.io-definitions";

let cronStart: Date | null = null;
const CRON_NAME = "Procedures";



(async () => {
  try {
    cronStart = new Date();
    await setCronStart({ name: CRON_NAME, startDate: cronStart });
    await mongoConnect();
    // await start()
    await setCronSuccess({ name: CRON_NAME, successStartDate: cronStart! });
    process.exit(0);
  } catch(err) {
    await setCronError({ name: CRON_NAME, error: JSON.stringify(err) });
    process.exit(1)
  }
})();
