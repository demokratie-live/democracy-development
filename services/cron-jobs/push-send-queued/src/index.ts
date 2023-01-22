import mongoConnect from './mongoose';
import { CRON_SEND_QUED_PUSHS_LIMIT } from './config';
import { setCronStart, setCronSuccess, PushNotificationModel } from '@democracy-deutschland/democracy-common';
import admin from 'firebase-admin';
import serviceAccount from './credentials.json';

admin.initializeApp({
  credential: admin.credential.cert({
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
    projectId: serviceAccount.project_id,
  }),
});

const getUnsendPushs = async (limit: number) => {
  return PushNotificationModel.find({
    sent: false,
    time: { $lte: new Date() },
  }).limit(limit);
};

const sendPush = async (push: Awaited<ReturnType<typeof getUnsendPushs>>[0]) => {
  const { _id, type, category, title, message, procedureIds, token } = push;

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
  /* Set sent = true */
  await PushNotificationModel.updateOne({ _id }, { $set: { sent: true } });
};

const start = async () => {
  const CRON_NAME = 'sendQueuedPushs';
  const startDate = new Date();
  await setCronStart({ name: CRON_NAME, startDate });

  // Query Database
  let pushs = await getUnsendPushs(CRON_SEND_QUED_PUSHS_LIMIT);

  let sentPushsCount = 0;

  // send all pushs
  for (let push of pushs) {
    await sendPush(push);
    sentPushsCount++;
  }

  console.info(`[PUSH] Sent ${sentPushsCount} Pushs`);

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
