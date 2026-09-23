import { CRON_SEND_QUED_PUSHS_LIMIT } from './config';
import {
  setCronStart,
  setCronSuccess,
  PushNotificationModel,
  DeviceModel,
  mongoConnect,
} from '@democracy-deutschland/democracy-common';
import admin from 'firebase-admin';
import apn from 'apn';

admin.initializeApp({
  credential: admin.credential.cert({
    clientEmail: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
    privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/gm, '\n'),
    projectId: process.env.SERVICE_ACCOUNT_PROJECT_ID,
  }),
});

const apnsProvider =
  process.env.APPLE_APN_KEY && process.env.APPLE_APN_KEY_ID && process.env.APPLE_TEAMID
    ? new apn.Provider({
        token: {
          key: process.env.APPLE_APN_KEY.replace(/\\n/gm, '\n'),
          keyId: process.env.APPLE_APN_KEY_ID,
          teamId: process.env.APPLE_TEAMID,
        },
        production: process.env.NODE_ENV === 'production',
      })
    : null;

const isApnsToken = (token: string) => /^[0-9a-f]{64}$/i.test(token);

const getUnsendPushs = async (limit: number) => {
  return PushNotificationModel.find({
    sent: false,
    time: { $lte: new Date() },
  }).limit(limit);
};

const sendPushViaApns = async (push: Awaited<ReturnType<typeof getUnsendPushs>>[0]) => {
  if (!apnsProvider) throw new Error('APNs provider not configured (missing APPLE_APN_KEY, APPLE_APN_KEY_ID or APPLE_TEAMID)');
  const { type, category, title, message, procedureIds, token } = push;

  const notification = new apn.Notification();
  notification.expiry = Math.floor(Date.now() / 1000) + 3600;
  notification.sound = 'push.aiff';
  notification.alert = { title, body: message };
  notification.topic = process.env.APN_TOPIC ?? '';
  notification.payload = { data: { type, action: type, category, title, message, procedureId: procedureIds[0] } };

  const result = await apnsProvider.send(notification, token);
  if (result.failed.length > 0) {
    const failure = result.failed[0];
    throw new Error(failure.response?.reason ?? failure.error?.message ?? 'APNs send failed');
  }
};

const sendPushViaFcm = async (push: Awaited<ReturnType<typeof getUnsendPushs>>[0]) => {
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

const sendPush = async (push: Awaited<ReturnType<typeof getUnsendPushs>>[0]) => {
  if (isApnsToken(push.token)) {
    await sendPushViaApns(push);
  } else {
    await sendPushViaFcm(push);
  }
};

const handleSendError = async (push: Awaited<ReturnType<typeof getUnsendPushs>>[0], error: unknown) => {
  console.error('send error', error);
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
  const pushs = await getUnsendPushs(CRON_SEND_QUED_PUSHS_LIMIT);

  let sentPushsCount = 0;
  let sentPushsErrorCount = 0;
  console.log(CRON_SEND_QUED_PUSHS_LIMIT, pushs);

  // send all pushs
  for (const push of pushs) {
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
  await start();
  apnsProvider?.shutdown();
  process.exit(0);
})();
