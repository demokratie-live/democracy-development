import mongoConnect from "./mongoose";

import {
  ProcedureModel,
  DeviceModel,
  PushNotificationModel,
  Device,
  PUSH_TYPE,
  PUSH_CATEGORY,
  setCronStart,
  setCronSuccess,
  queuePushs,
} from "@democracy-deutschland/democracy-common";

const start = async () => {
  /*
  Kommende Woche ist Sitzungswoche!
  Es warten 13 spannende Themen auf Dich. Viel Spaß beim Abstimmen.
  (Sonntag vor Sitzungswoche, alle)
  */

  const CRON_NAME = "cleanup-push-queue";
  const startDate = new Date();

  await setCronStart({ name: CRON_NAME, startDate });

  var date = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);

  const res = await PushNotificationModel.deleteMany({
    category: {
      $in: [
        PUSH_CATEGORY.CONFERENCE_WEEK,
        PUSH_CATEGORY.CONFERENCE_WEEK_VOTE,
        PUSH_CATEGORY.OUTCOME,
      ],
    },
    updatedAt: { $lt: date },
  });

  console.log(`deleted entries: ${res.deletedCount}`);

  await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
};

(async () => {
  console.info("START");
  console.info(
    "process.env",
    process.env.BUNDESTAGIO_SERVER_URL,
    process.env.DB_URL
  );
  if (!process.env.BUNDESTAGIO_SERVER_URL) {
    throw new Error(
      "you have to set environment variable: BUNDESTAGIO_SERVER_URL & DB_URL"
    );
  }
  await mongoConnect();
  const sentPushs = await PushNotificationModel.countDocuments({
    sent: true,
  });
  console.info("count of sent push's", sentPushs);
  await start().catch(() => process.exit(1));
  process.exit(0);
})();
