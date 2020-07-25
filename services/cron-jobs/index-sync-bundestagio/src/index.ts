import mongoConnect from "./mongoose";

import {
  ConferenceWeekDetailModel,
  CronJobModel,
  DeputyModel,
  NamedPollModel,
  ProcedureModel,
  UserModel,
} from "@democracy-deutschland/bundestagio-common";

const start = async () => {
  await Promise.all([
    ConferenceWeekDetailModel.syncIndexes(),
    CronJobModel.syncIndexes(),
    DeputyModel.syncIndexes(),
    NamedPollModel.syncIndexes(),
    ProcedureModel.syncIndexes(),
    UserModel.syncIndexes(),
  ]);
};

(async () => {
  console.info("START");
  console.info("process.env", process.env.DB_URL);
  if (!process.env.DB_URL) {
    throw new Error("you have to set environment variable: DB_URL");
  }
  await mongoConnect();
  console.log("cronjobs", await CronJobModel.countDocuments({}));
  await start().catch((e) => {
    console.log(e);
    process.exit(1);
  });
  process.exit(0);
})();
