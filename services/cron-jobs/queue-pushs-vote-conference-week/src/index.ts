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
  /*
  Diese Woche im Bundestag: Jetzt Abstimmen!
  Lorem Ipsum Titel
  (Innerhalb der Sitzungswoche, nicht abgestimmt, nicht vergangen, 1x pro Tag, individuell)
  */

  const CRON_NAME = "queuePushsVoteConferenceWeek";
  const startDate = new Date();
  const cron = await getCron({ name: CRON_NAME });
  let counter = 0;
  if (cron.running) {
    console.error(`[Cronjob][${CRON_NAME}] running still - skipping`);
    return;
  }
  await setCronStart({ name: CRON_NAME, startDate });

  // Check if we have a ConferenceWeek
  const startOfWeek = moment().startOf("isoWeek").toDate(); // Should be Mo
  const endOfWeek = moment().endOf("isoWeek").toDate(); // Should be So
  const conferenceProceduresCount = await ProcedureModel.count({
    $and: [
      { voteDate: { $gte: startOfWeek } },
      { voteDate: { $lte: endOfWeek } },
    ],
  });

  // Dont Push ConfereceWeek Updates if we have dont have an active conferenceWeek
  if (conferenceProceduresCount === 0) {
    await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
    return;
  }

  // find ConferenceWeek procedures not voted
  const conferenceWeekProcedures = await ProcedureModel.find({
    period: 19,
    $or: [
      {
        $and: [
          { voteDate: { $gte: new Date() } },
          { $or: [{ voteEnd: { $exists: false } }, { voteEnd: undefined }] },
        ],
      },
      { voteEnd: { $gte: new Date() } },
    ],
  }).sort({ activities: -1, lastUpdateDate: -1, title: 1 });

  // Find Devices
  let devices = await DeviceModel.find({
    "notificationSettings.enabled": true,
    "notificationSettings.voteConferenceWeekPushs": true,
    pushTokens: { $gt: [] },
  });

  // loop through the ConferenceWeek Procedures
  for (let i = 0; i < conferenceWeekProcedures.length; i += 1) {
    const procedure = conferenceWeekProcedures[i];
    // Skip some calls
    if (devices.length === 0) {
      continue; // eslint-disable-line no-continue
    }
    // loop through the devices and remove those we send a Push
    // eslint-disable-next-line no-await-in-loop
    devices = await filterSeries(devices, async (device) => {
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
            category: PUSH_CATEGORY.CONFERENCE_WEEK_VOTE,
            procedureIds: procedure.procedureId,
            token: token.token,
            os: token.os,
            time: {
              $gte: moment().subtract(1, "weeks").toDate(),
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
      // Save Pushs
      await queuePushs({
        type: PUSH_TYPE.PROCEDURE,
        category: PUSH_CATEGORY.CONFERENCE_WEEK_VOTE,
        title: "Diese Woche im Bundestag: Jetzt Abstimmen!",
        message: procedure.title,
        procedureIds: [procedure.procedureId],
        tokens,
        time,
      });
      // We have queued a Push, remove device from list.
      return false;
    });
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
