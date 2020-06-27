import {
  DeviceModel,
  UserModel,
  ProcedureModel,
  Device,
  VoteModel,
  PushNotificationModel,
  PUSH_TYPE,
  PUSH_CATEGORY,
} from "../models";

export const queuePushs = async ({
  type,
  category,
  title,
  message,
  procedureIds,
  tokens,
  time = new Date(),
}: {
  type: string;
  category: string;
  title: string;
  message: string;
  procedureIds: string[];
  tokens: Device["pushTokens"];
  time?: Date;
}) => {
  // Generate one push for each token
  const docs = tokens.map(({ token, os }) => {
    return {
      type,
      category,
      title,
      message,
      procedureIds,
      token,
      os,
      time,
    };
  });

  await PushNotificationModel.insertMany(docs);

  return true;
};

export const queuePushsOutcome = async (procedureId: string) => {
  /*
  Offizielles Ergebnis zu Deiner Abstimmung
  Lorem Ipsum Titel
  (Glocke, nicht limitiert, abgestimmt, alle)
  */

  /*
  Offizielles Ergebnis zur Abstimmung
  Lorem Ipsum Titel
  (Glocke, nicht limitiert, nicht abgestimmt, alle)
  */

  // find procedure
  const procedure = await ProcedureModel.findOne({ procedureId });

  // Check if we found the procedure
  if (!procedure) {
    console.error(`[PUSH] Unknown Procedure ${procedureId}`);
    return;
  }
  // Find Devices
  const devices = await DeviceModel.find({
    "notificationSettings.enabled": true,
    "notificationSettings.outcomePushs": true,
    "notificationSettings.procedures": procedure._id,
    pushTokens: { $gt: [] },
  });

  // loop through the devices and send Pushs
  for (let i = 0; i < devices.length; i += 1) {
    const device = devices[i];
    // Dont continue if we have no push tokens
    let voted = null;
    // Check if device is associcated with a vote on the procedure
    // eslint-disable-next-line no-await-in-loop
    const user = await UserModel.findOne({
      device: device._id,
      verified: true,
    });
    if (user) {
      // eslint-disable-next-line no-await-in-loop
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

    const title = voted
      ? "Offizielles Ergebnis zu Deiner Abstimmung"
      : "Offizielles Ergebnis zur Abstimmung";
    const message = procedure.title;
    await queuePushs({
      type: PUSH_TYPE.PROCEDURE,
      category: PUSH_CATEGORY.OUTCOME,
      title,
      message,
      procedureIds: [procedureId],
      tokens: device.pushTokens,
    });
  }
};
