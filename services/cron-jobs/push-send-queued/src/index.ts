import mongoConnect from './mongoose';
import { CRON_SEND_QUED_PUSHS_LIMIT } from './config';
import {
  setCronStart,
  setCronSuccess,
  PushNotificationModel,
  DeviceModel,
} from '@democracy-deutschland/democracy-common';
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert({
    clientEmail: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
    privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY,
    projectId: process.env.SERVICE_ACCOUNT_PROJECT_ID,
  }),
});

const getUnsendPushs = async (limit: number) => {
  return PushNotificationModel.find({
    sent: false,
    time: { $lte: new Date() },
  }).limit(limit);
};

const sendPush = async (push: Awaited<ReturnType<typeof getUnsendPushs>>[0]) => {
  const { type, category, title, message, procedureIds, token } = push;

  await admin.messaging().send({
    token,
    notification: {
      title,
      body: message,
    },
    data: {
      type,
      action: type,
      category,
      title,
      message,
      procedureId: procedureIds[0],
    },
    apns: {
      payload: {
        aps: {
          sound: 'push.aiff',
        },
      },
    },
  });
};

const handleSendError = async (push: Awaited<ReturnType<typeof getUnsendPushs>>[0], error: unknown) => {
  console.error('errorASDF', error);
  await DeviceModel.updateMany(
    {
      'pushTokens.token': push.token,
    },
    {
      $pull: { pushTokens: { token: push.token } },
    },
  );
};

const start = async () => {
  const CRON_NAME = 'sendQueuedPushs';
  const startDate = new Date();
  await setCronStart({ name: CRON_NAME, startDate });

  // Query Database
  let pushs = await getUnsendPushs(CRON_SEND_QUED_PUSHS_LIMIT);

  let sentPushsCount = 0;
  let sentPushsErrorCount = 0;
  console.log(CRON_SEND_QUED_PUSHS_LIMIT, pushs);

  // send all pushs
  for (let push of pushs) {
    await sendPush(push).catch((error) => {
      handleSendError(push, error);
      sentPushsErrorCount++;
    });
    sentPushsCount++;
    /* Set sent = true */
    await PushNotificationModel.updateOne({ _id: push._id }, { $set: { sent: true } });
  }

  console.info(`[PUSH] Sent ${sentPushsCount} Pushs`);
  console.info(`[PUSH] Error ${sentPushsErrorCount} Pushs`);

  await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
};

(async () => {
  await mongoConnect();
  console.log("outstanding push's", await PushNotificationModel.countDocuments({ sent: false }));
  await start().catch((e) => {
    throw e;
  });
  process.exit(0);
})();
