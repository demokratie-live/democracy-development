import mongoConnect from "./mongoose";
import {
  APN_TOPIC,
  APPLE_APN_KEY,
  APPLE_APN_KEY_ID,
  APPLE_TEAMID,
  CRON_SEND_QUED_PUSHS_LIMIT,
  DB_URL,
  NOTIFICATION_ANDROID_SERVER_KEY,
} from "./utils/config";
import {
  ProcedureModel,
  DeviceModel,
  PUSH_CATEGORY,
  setCronStart,
  setCronSuccess,
  PushNotificationModel,
  PUSH_OS,
} from "@democracy-deutschland/democracy-common";

import { push as pushIOS } from "./iOS";
import { push as pushAndroid } from "./Android";
import { forEachSeries } from "p-iteration";

const start = async () => {
  const CRON_NAME = "sendQueuedPushs";
  const startDate = new Date();
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
  let sentPushsCount = 0;
  // send all pushs in there
  await forEachSeries(
    pushs,
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
      console.log({ os });
      switch (os) {
        case PUSH_OS.ANDROID:
          await pushAndroid({
            title,
            message,
            payload,
            token,
          })
            .catch(async ({ error, response }) => {
              console.log("android error", error, response);
              await PushNotificationModel.updateOne(
                { _id },
                { $set: { failure: JSON.stringify({ error, response }) } }
              );
              if (
                response &&
                response.results &&
                response.results[0].error === "NotRegistered"
              ) {
                await DeviceModel.updateOne(
                  {},
                  { $pull: { pushTokens: { token, os: PUSH_OS.ANDROID } } },
                  { multi: true }
                );
                console.warn(`[PUSH] Android failure - removig token`);
              } else {
                console.error(
                  `[PUSH] Android failure ${JSON.stringify({
                    token,
                    error,
                    response,
                  })}`
                );
              }
            })
            .then(() => sentPushsCount++);
          break;
        case PUSH_OS.IOS:
          const { sent, failed } = await pushIOS({
            title,
            message,
            payload,
            token,
          });
          console.info(
            JSON.stringify({ type: "apnProvider.send", sent, failed })
          );
          if (sent.length === 0 && failed.length !== 0) {
            // Write failure to Database
            await PushNotificationModel.updateOne(
              { _id },
              { $set: { failure: JSON.stringify({ failed }) } }
            );
            // Remove broken Push tokens
            if (
              failed[0].response &&
              (failed[0].response.reason === "DeviceTokenNotForTopic" ||
                failed[0].response.reason === "BadDeviceToken")
            ) {
              await DeviceModel.updateOne(
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
          } else {
            sentPushsCount++;
          }
          break;
        default:
          console.error(`[PUSH] unknown Token-OS`);
      }
      // Set sent = true
      await PushNotificationModel.updateOne(
        { _id },
        { $set: { sent: true } }
      ).then(() => {
        console.info("### Push sent");
      });
      // Return id
      return _id;
    }
  );

  console.info(`[PUSH] Sent ${sentPushsCount} Pushs`);

  await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
};

(async () => {
  console.info("START");
  console.info("process.env", DB_URL);
  if (
    !DB_URL ||
    !APN_TOPIC ||
    !APPLE_APN_KEY ||
    !APPLE_APN_KEY_ID ||
    !APPLE_TEAMID ||
    !NOTIFICATION_ANDROID_SERVER_KEY
  ) {
    throw new Error(
      "you have to set environment variable: DB_URL & APN_TOPIC & APPLE_APN_KEY & APPLE_APN_KEY_ID & APPLE_TEAMID & NOTIFICATION_ANDROID_SERVER_KEY"
    );
  }
  await mongoConnect();
  console.log("procedures", await ProcedureModel.countDocuments({}));
  await start().catch((e) => {
    throw e;
  });
  process.exit(0);
})();
