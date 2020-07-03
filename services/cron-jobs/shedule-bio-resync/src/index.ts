import mongoConnect from "./mongoose";

import {
  ProcedureModel,
  resetCronSuccessStartDate,
} from "@democracy-deutschland/democracy-common";

const start = async () => {
  await resetCronSuccessStartDate();
};

(async () => {
  console.info("START");
  console.info("process.env", process.env.DB_URL);
  if (!process.env.DB_URL) {
    throw new Error("you have to set environment variable: DB_URL");
  }
  await mongoConnect();
  console.log("procedures", await ProcedureModel.countDocuments({}));
  await start().catch(() => process.exit(1));
  process.exit(0);
})();
