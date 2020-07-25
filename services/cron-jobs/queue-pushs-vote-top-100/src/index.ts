import mongoConnect from "./mongoose";
import moment from "moment";

import {
  ProcedureModel,
  DeviceModel,
  PUSH_TYPE,
  PUSH_CATEGORY,
  getCron,
  setCronStart,
  setCronSuccess,
  queuePushs,
  UserModel,
  VoteModel,
  PushNotificationModel,
} from "@democracy-deutschland/democracy-common";

import { filterSeries, reduce } from "p-iteration";

const start = async () => {
  console.info("queuePushsVoteTop100");
  /*
  TOP 100 - #1: Jetzt Abstimmen!
  Lorem Ipsum Titel
  (Top 100, Außerhalb der Sitzungwoche, 1x pro Tag, individuell)
  */

  const CRON_NAME = "queuePushsVoteTop100";
  const startDate = new Date();
  const cron = await getCron({ name: CRON_NAME });
  if (cron.running) {
    console.error(`[Cronjob][${CRON_NAME}] running still - skipping`);
    return;
  }
  await setCronStart({ name: CRON_NAME, startDate });
  let counter = 0;

  // Check if we have a ConferenceWeek
  const startOfWeek = moment().startOf("isoWeek").toDate(); // Should be Mo
  const endOfWeek = moment().endOf("isoWeek").toDate(); // Should be So
  const conferenceProceduresCount = await ProcedureModel.count({
    $and: [
      { voteDate: { $gte: startOfWeek } },
      { voteDate: { $lte: endOfWeek } },
    ],
  });

  // Dont Push TOP100 if we have an active conferenceWeek
  if (conferenceProceduresCount > 0) {
    await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
    return;
  }

  // find TOP100 procedures
  const top100Procedures = await ProcedureModel.find({ period: 19 })
    .sort({ activities: -1, lastUpdateDate: -1, title: 1 })
    .limit(100);

  // Find Devices
  let devices = await DeviceModel.find({
    "notificationSettings.enabled": true,
    "notificationSettings.voteTOP100Pushs": true,
    pushTokens: { $gt: [] },
  });

  // loop through the TOP100
  let topId = 1;
  for (let i = 0; i < top100Procedures.length; i += 1) {
    const procedure = top100Procedures[i];
    // Skip some calls
    if (devices.length === 0) {
      continue; // eslint-disable-line no-continue
    }
    // loop through the devices and remove those we send a Push
    // eslint-disable-next-line no-await-in-loop
    devices = await filterSeries(
      devices,
      // eslint-disable-next-line no-loop-func
      async (device) => {
        let voted = null;
        // Check if device is associcated with a vote on the procedure
        const user = await UserModel.findOne({
          device: device._id,
          verified: true,
        });
        if (user) {
          voted = await VoteModel.findOne({
            procedure: procedure._id,
            type: "Phone",
            voters: {
              $elemMatch: {
                voter: user.phone,
              },
            },
          });
        }

        // Dont send Pushs - User has voted already
        if (voted) {
          return true;
        }
        // Check if we sent the user a notifiation in the past time on that procedure
        const tokens = await reduce(
          device.pushTokens,
          async (acc, token) => {
            const pastPushs = await PushNotificationModel.count({
              category: PUSH_CATEGORY.TOP100,
              procedureIds: procedure.procedureId,
              token: token.token,
              os: token.os,
              time: {
                $gte: moment().subtract(1, "month").toDate(),
              },
            });
            if (pastPushs === 0) {
              return [...acc, token];
            }
            return acc;
          },
          [] as Array<{
            token: string;
            os: string;
          }>
        );
        // Dont send Pushs - User has not Tokens registered or has recieved a Push for this Procedure lately
        if (tokens.length === 0) {
          return true;
        }
        counter += tokens.length;
        // Calculate random Time:
        const time = new Date();
        time.setHours(9 + Math.round(Math.random() * 9));
        // Send Pushs
        await queuePushs({
          type: PUSH_TYPE.PROCEDURE,
          category: PUSH_CATEGORY.TOP100,
          title: `TOP 100 - #${topId}: Jetzt Abstimmen!`,
          message: procedure.title,
          procedureIds: [procedure.procedureId],
          tokens,
          time,
        });
        // We have queued a Push, remove device from list.
        return false;
      },
      []
    );
    // Count the Top Number up
    topId += 1;
  }

  console.log(`queued push's: ${counter}`);
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
  console.log("procedures", await ProcedureModel.countDocuments({}));
  await start().catch(() => process.exit(1));
  process.exit(0);
})();
