import mongoConnect from "./mongoose";

import {
  ActivityModel,
  CronJobModel,
  DeputyModel,
  DeviceModel,
  PhoneModel,
  ProcedureModel,
  PushNotificationModel,
  SearchTermModel,
  UserModel,
  VerificationModel,
  VoteModel,
} from "@democracy-deutschland/democracy-common";

const start = async () => {
  await Promise.all([
    ActivityModel.syncIndexes(),
    CronJobModel.syncIndexes(),
    DeputyModel.syncIndexes(),
    DeviceModel.syncIndexes(),
    PhoneModel.syncIndexes(),
    ProcedureModel.syncIndexes(),
    PushNotificationModel.syncIndexes(),
    SearchTermModel.syncIndexes(),
    UserModel.syncIndexes(),
    VerificationModel.syncIndexes(),
    VoteModel.syncIndexes(),
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
