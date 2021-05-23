import mongoConnect from "./mongoose";

import {
  PushNotificationModel,
  PUSH_CATEGORY,
  setCronStart,
  setCronSuccess,
} from "@democracy-deutschland/democracy-common";

const start = async () => {
  /*
    This service cleanes up the democrac.pushnotifications collection:
    removes:
    - sent: true
    - updatedAt: lt: 7d
    - cagegory: CONFERENCE_WEEK | CONFERENCE_WEEK_VOTE | OUTCOME
  */

  const CRON_NAME = "cleanup-push-queue";
  const startDate = new Date();

  await setCronStart({ name: CRON_NAME, startDate });

  var date = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);

  const oldPushs = await PushNotificationModel.deleteMany({
    category: {
      $in: [
        PUSH_CATEGORY.CONFERENCE_WEEK,
        PUSH_CATEGORY.CONFERENCE_WEEK_VOTE,
        PUSH_CATEGORY.OUTCOME,
      ],
    },
    updatedAt: { $lt: date },
  });

  console.log(`deleted entries: ${oldPushs.deletedCount}`);

  const duplicates = await PushNotificationModel.aggregate([
    {
      $match: {
        category: "top100",
      },
    },
    {
      $unwind: "$procedureIds",
    },
    {
      $group: {
        _id: {
          token: "$token",
          procedureId: "procedureIds",
        },
        count: {
          $sum: 1,
        },
        doc: {
          $first: "$$ROOT",
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            {
              count: "$count",
            },
            "$doc",
          ],
        },
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ]);

  let totalDups = 0;
  for (let push of duplicates) {
    const dups = await PushNotificationModel.deleteMany({
      category: "top100",
      procedureIds: push.procedureIds,
      token: push.token,
      _id: { $ne: push._id },
    });
    totalDups += dups?.deletedCount || 0;
  }
  console.log(`remove total dups: ${totalDups}`);

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
