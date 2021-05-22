import mongoConnect from "./mongoose";
import moment from "moment";
import { DEV_MODE } from "./config";

import {
  ProcedureModel,
  DeviceModel,
  PUSH_TYPE,
  PUSH_CATEGORY,
  setCronStart,
  setCronSuccess,
  queuePushs,
  UserModel,
  VoteModel,
  PushNotificationModel,
  Device,
} from "@democracy-deutschland/democracy-common";

const start = async () => {
  /*
  TOP 100 - #1: Jetzt Abstimmen!
  Lorem Ipsum Titel
  (Top 100, Außerhalb der Sitzungwoche, 1x pro Tag, individuell)
  */

  const CRON_NAME = "queuePushsVoteTop100";
  const startDate = new Date();
  await setCronStart({ name: CRON_NAME, startDate });
  const tokensQueued: string[] = [];
  let counter = 0,
    multipleTokens = 0,
    alreadyInQueue = 0,
    alreadyVoted = 0;

  // Check if we have a ConferenceWeek
  const startOfWeek = moment().startOf("isoWeek").toDate(); // Should be Mo
  const endOfWeek = moment().endOf("isoWeek").toDate(); // Should be So
  const conferenceProceduresCount = await ProcedureModel.countDocuments({
    $and: [
      { voteDate: { $gte: startOfWeek } },
      { voteDate: { $lte: endOfWeek } },
    ],
  });

  /** Dont Push TOP100 if we have an active conferenceWeek */
  if (!DEV_MODE && conferenceProceduresCount > 0) {
    console.info(
      "[INFO] stopped: Do not create push's in reason of conferenceWeek day!"
    );
    await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
    return;
  }

  // find TOP100 procedures
  const top100Procedures = await ProcedureModel.find(
    { period: 19 },
    { _id: 1, procedureId: 1, title: 1 }
  )
    .sort({ activities: -1, lastUpdateDate: -1, title: 1 })
    .limit(100);

  console.log(
    "# TOP 100 PROCEDURES:",
    top100Procedures.map(({ procedureId }) => procedureId)
  );

  // Find Devices
  let devices = await DeviceModel.find(
    {
      "notificationSettings.enabled": true,
      "notificationSettings.voteTOP100Pushs": true,
      pushTokens: { $gt: [] },
    },
    {
      _id: 1,
      pushTokens: 1,
    }
  );
  console.log("# DEVICES WITH RIGHT SETTINGS:", devices.length);
  if (devices.length === 0) {
    return;
  }

  // loop through the TOP100
  let topId = 0;
  for (let procedure of top100Procedures) {
    topId++;
    console.log(`# PROCEDURE: ${procedure.procedureId} - ${procedure.title}`);

    // loop through the devices and remove those we send a Push
    let deviceIndex = 0;

    let allDeviceTokens = Array.from(
      new Set(
        devices.reduce<string[]>(
          (prev, device) => [
            ...prev,
            ...device.pushTokens.map(({ token }) => token),
          ],
          []
        )
      )
    );

    console.log("# TOKENS: length of all tokens", allDeviceTokens.length);

    let alreadyPushedDevices = await PushNotificationModel.find(
      {
        token: {
          $in: allDeviceTokens,
        },
        category: "top100",
        procedureIds: { $in: [procedure.procedureId] },
      },
      { token: 1 }
    ).then((pushs) => Array.from(new Set(pushs.map(({ token }) => token))));

    console.log(
      "devices which are already pushed",
      alreadyPushedDevices.length
    );
    allDeviceTokens = [];

    const filteredDevices = devices.filter(
      ({ pushTokens }) =>
        !pushTokens.some((pushToken) =>
          alreadyPushedDevices.includes(pushToken.token)
        )
    );
    console.log("# DEVICES: without already sent", filteredDevices.length);
    /** delete alreadyPushedDevices for memory */
    alreadyPushedDevices = [];

    for (let device of filteredDevices) {
      deviceIndex++;
      if (deviceIndex % 1000 === 0) {
        console.log(`${procedure.procedureId} - ${procedure.title}`, {
          counter,
          multipleTokens,
          alreadyVoted,
          alreadyInQueue,
          procedure: `${topId}/${top100Procedures.length}`,
          device: `${deviceIndex}/${filteredDevices.length}/${devices.length}`,
          memory: process.memoryUsage().heapUsed / (1024 * 1024),
        });
      }
      let voted = null;

      // Check if device is associcated with a vote on the procedure
      const user = await UserModel.findOne(
        {
          device: device._id,
          verified: true,
        },
        {
          phone: 1,
        }
      );
      if (user) {
        voted = await VoteModel.exists({
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
        alreadyVoted++;
        continue;
      }
      // Check if we sent the user a notifiation in the past time on that procedure
      let tokens: Device["pushTokens"] = [];
      for (let token of device.pushTokens) {
        const pastPushs = await PushNotificationModel.countDocuments({
          category: PUSH_CATEGORY.TOP100,
          procedureIds: procedure.procedureId,
          token: token.token,
          os: token.os,
          time: {
            $gte: moment().subtract(1, "month").toDate(),
          },
        });
        if (pastPushs === 0) {
          tokens.push(token);
        }
      }

      // Dont send Pushs - User has not Tokens registered or has recieved a Push for this Procedure lately
      if (tokens.length === 0) {
        alreadyInQueue++;
        continue;
      }
      counter += tokens.length;
      // Calculate random Time:
      const time = new Date();
      time.setHours(9 + Math.round(Math.random() * 9));

      if (tokens.length > 1) {
        multipleTokens++;
      }

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

      devices = devices.filter(
        ({ pushTokens }) => !tokens.some((token) => pushTokens.includes(token))
      );
    }
    console.log(`${procedure.procedureId} - ${procedure.title}`, {
      counter,
      multipleTokens,
      alreadyVoted,
      alreadyInQueue,
      procedure: `${topId}/${top100Procedures.length}`,
      device: `${deviceIndex}/${filteredDevices.length}/${devices.length}`,
      memory: process.memoryUsage().heapUsed / (1024 * 1024),
    });
  }

  console.log({ alreadyVoted, alreadyInQueue, multipleTokens });
  console.log(`queued push's: ${counter}`);
  await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
};

(async () => {
  if (!process.env.DB_URL) {
    throw new Error("you have to set environment variable: DB_URL");
  }
  await mongoConnect();
  let devices = await DeviceModel.countDocuments({
    "notificationSettings.enabled": true,
    "notificationSettings.voteTOP100Pushs": true,
    pushTokens: { $gt: [] },
  });
  console.info("devices with top 100 push", devices);
  await start().catch(() => process.exit(1));
  process.exit(0);
})();
