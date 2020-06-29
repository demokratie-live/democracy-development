import mongoConnect from "./mongoose";
import { mapSeries } from "p-iteration";

import {
  ProcedureModel,
  DeviceModel,
  PUSH_CATEGORY,
  getCron,
  setCronStart,
  setCronSuccess,
  PushNotificationModel,
  PUSH_OS,
} from "@democracy-deutschland/democracy-common";

import { push as pushIOS } from "./iOS";
import { push as pushAndroid } from "./Android";

const CRON_SEND_QUED_PUSHS_LIMIT = process.env.CRON_SEND_QUED_PUSHS_LIMIT
  ? parseInt(process.env.CRON_SEND_QUED_PUSHS_LIMIT, 10)
  : 1000;

const start = async () => {
  const CRON_NAME = "sendQueuedPushs";
  const startDate = new Date();
  const cron = await getCron({ name: CRON_NAME });
  if (cron.running) {
    console.error(`[Cronjob][${CRON_NAME}] running still - skipping`);
    return;
  }
  await setCronStart({ name: CRON_NAME, startDate });

  // Query Database
  let pushs = [];

  // TODO handle date fix timezone by server

  // outcome push's first
  pushs = await PushNotificationModel.find({
    sent: false,
    time: { $lte: new Date() },
    category: PUSH_CATEGORY.OUTCOME,
  }).limit(CRON_SEND_QUED_PUSHS_LIMIT);

  if (pushs.length !== CRON_SEND_QUED_PUSHS_LIMIT) {
    pushs = [
      ...pushs,
      ...(await PushNotificationModel.find({
        sent: false,
        time: { $lte: new Date() },
        category: { $ne: PUSH_CATEGORY.OUTCOME },
      }).limit(CRON_SEND_QUED_PUSHS_LIMIT - pushs.length)),
    ];
  }

  // send all pushs in there
  const sentPushs = await pushs.map(
    async ({
      _id,
      type,
      category,
      title,
      message,
      procedureIds,
      token,
      os,
    }) => {
      // Construct Payload
      const payload = {
        type,
        action: type,
        category,
        title,
        message,
        procedureId: procedureIds[0],
        procedureIds,
      };
      // Send Pushs
      let job: Promise<void>;
      switch (os) {
        case PUSH_OS.ANDROID:
          await pushAndroid({
            title,
            message,
            payload,
            token,
            callback: async (err, response) => {
              if (err || response.success !== 1 || response.failure !== 0) {
                // Write failure to Database
                await PushNotificationModel.update(
                  { _id },
                  { $set: { failure: JSON.stringify({ err, response }) } }
                );
                // Remove broken Push tokens
                if (
                  response.results &&
                  response.results[0].error === "NotRegistered"
                ) {
                  await DeviceModel.update(
                    {},
                    { $pull: { pushTokens: { token, os: PUSH_OS.ANDROID } } },
                    { multi: true }
                  );
                  console.warn(`[PUSH] Android failure - removig token`);
                } else {
                  console.error(
                    `[PUSH] Android failure ${JSON.stringify({
                      token,
                      err,
                      response,
                    })}`
                  );
                }
              }
            },
          });
          break;
        case PUSH_OS.IOS:
          await pushIOS({
            title,
            message,
            payload,
            token,
            callback: async ({ sent, failed }) => {
              console.info(
                JSON.stringify({ type: "apnProvider.send", sent, failed })
              );
              if (sent.length === 0 && failed.length !== 0) {
                // Write failure to Database
                await PushNotificationModel.update(
                  { _id },
                  { $set: { failure: JSON.stringify({ failed }) } }
                );
                // Remove broken Push tokens
                if (
                  failed[0].response &&
                  (failed[0].response.reason === "DeviceTokenNotForTopic" ||
                    failed[0].response.reason === "BadDeviceToken")
                ) {
                  await DeviceModel.update(
                    {},
                    { $pull: { pushTokens: { token, os: PUSH_OS.IOS } } },
                    { multi: true }
                  );
                  console.warn(`[PUSH] IOS failure - removig token`);
                } else {
                  console.error(
                    `[PUSH] IOS failure ${JSON.stringify({
                      token,
                      sent,
                      failed,
                    })}`
                  );
                }
              }
            },
          });
          break;
        default:
          console.error(`[PUSH] unknown Token-OS`);
      }
      // Set sent = true
      await PushNotificationModel.update(
        { _id },
        { $set: { sent: true } }
      ).then(() => {
        console.info("### Push sent");
      });
      // Return id
      return _id;
    }
  );
  await Promise.all(sentPushs);

  if (sentPushs.length > 0) {
    console.info(`[PUSH] Sent ${sentPushs.length} Pushs`);
  }

  await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
};

(async () => {
  console.info("START");
  console.info(
    "process.env",
    process.env.BUNDESTAGIO_SERVER_URL,
    process.env.DB_URL
  );
  if (
    !process.env.BUNDESTAGIO_SERVER_URL ||
    !process.env.DB_URL ||
    !process.env.APN_TOPIC ||
    !process.env.APPLE_APN_KEY ||
    !process.env.APPLE_APN_KEY_ID ||
    !process.env.APPLE_TEAMID ||
    !process.env.NOTIFICATION_ANDROID_SERVER_KEY
  ) {
    throw new Error(
      "you have to set environment variable: BUNDESTAGIO_SERVER_URL & DB_URL & APN_TOPIC & APPLE_APN_KEY & APPLE_APN_KEY_ID & APPLE_TEAMID & NOTIFICATION_ANDROID_SERVER_KEY"
    );
  }
  await mongoConnect();
  console.log("procedures", await ProcedureModel.countDocuments({}));
  await start();
  process.exit(0);
})();
