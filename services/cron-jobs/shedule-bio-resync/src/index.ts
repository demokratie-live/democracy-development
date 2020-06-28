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
  console.info(
    "process.env",
    process.env.BUNDESTAGIO_SERVER_URL,
    process.env.DB_URL
  );
  if (!process.env.BUNDESTAGIO_SERVER_URL || !process.env.DB_URL) {
    throw new Error(
      "you have to set environment variable: BUNDESTAGIO_SERVER_URL & DB_URL"
    );
  }
  await mongoConnect();
  console.log("procedures", await ProcedureModel.countDocuments({}));
  await start();
  process.exit(0);
})();
