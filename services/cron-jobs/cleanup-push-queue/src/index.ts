import {
  DeviceModel,
  PushNotificationModel,
  PUSH_CATEGORY,
  setCronStart,
  setCronSuccess,
} from '@democracy-deutschland/democracy-common';
import { DB_URL, ENTRY_PERSIST_MILLISECONDS } from './config';
import { mongoConnect } from '@democracy-deutschland/democracy-common';

/*
  This service cleanes up the democrac.pushnotifications collection:
  removes:
  - sent: true
  - updatedAt: lt: 7d
  - cagegory: CONFERENCE_WEEK | CONFERENCE_WEEK_VOTE | OUTCOME
*/

const cleanupPushQueue = async () => {
  // if ENTRY_PERSIST_MILLISECONDS is set, entries will persist
  const updatedAt = ENTRY_PERSIST_MILLISECONDS ? { $lt: new Date(Date.now() - ENTRY_PERSIST_MILLISECONDS) } : undefined;

  const oldPushs = await PushNotificationModel.deleteMany({
    sent: true,
    category: {
      $in: [PUSH_CATEGORY.CONFERENCE_WEEK, PUSH_CATEGORY.CONFERENCE_WEEK_VOTE, PUSH_CATEGORY.OUTCOME],
    },
    ...(updatedAt && { updatedAt }),
  });

  console.log(`deleted sent entries: ${oldPushs.deletedCount}`);
};

const cleanupDuplicateTop100 = async () => {
  console.log('#start cleanupDuplicateTop100');

  const procedureIds = await PushNotificationModel.distinct('procedureIds');

  let totalDups = 0;
  let counter = 0;
  for (const procedureId of procedureIds) {
    counter++;
    console.log(' # ## # #', procedureId, `${counter}/${procedureIds.length}`);
    const duplicates = await PushNotificationModel.aggregate<{
      type: string;
      category: string;
      title: string;
      message: string;
      procedureIds: string[];
      time: Date;
      token: string;
      os: string;
      _id: import('mongoose').Types.ObjectId;
      createdAt: Date;
      updatedAt: Date;
      __v: number;
      sent: boolean | undefined;
      failure: string | undefined;
    }>([
      {
        $match: {
          category: 'top100',
          procedureIds: procedureId,
        },
      },
      {
        $unwind: '$procedureIds',
      },
      {
        $group: {
          _id: {
            token: '$token',
            procedureId: '$procedureIds',
          },
          count: {
            $sum: 1,
          },
          doc: {
            $first: '$$ROOT',
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                count: '$count',
              },
              '$doc',
            ],
          },
        },
      },
      {
        $match: {
          count: {
            $gt: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    for (const push of duplicates) {
      const dups = await PushNotificationModel.deleteMany({
        category: 'top100',
        procedureIds: push.procedureIds,
        token: push.token,
        _id: { $ne: push._id },
      });
      process.stdout.write('.');
      totalDups += dups?.deletedCount || 0;
    }
    process.stdout.write('\n');
  }
  console.log(`removed duplicate top100 pushs: ${totalDups}`);
  console.log('#finish cleanupDuplicateTop100');
};

const removeDuplicateTokens = async () => {
  const duplicatedTokens = await DeviceModel.aggregate<{
    _id: string;
    count: number;
  }>([
    {
      $project: {
        'pushTokens.token': 1,
      },
    },
    {
      $unwind: '$pushTokens',
    },
    {
      $group: {
        _id: '$pushTokens.token',
        count: {
          $sum: 1,
        },
      },
    },
    {
      $match: {
        count: {
          $gt: 1,
        },
      },
    },
  ]);

  console.log(`found ${duplicatedTokens.length} devices with duplicate tokens`);

  for (const duplicateToken of duplicatedTokens) {
    const devices = await DeviceModel.find(
      {
        pushTokens: { $elemMatch: { token: duplicateToken._id } },
      },
      {},
      { sort: { createdAt: 1 } },
    );
    /** Remove duplicate tokens from device */
    for (const device of devices) {
      if (device) {
        device.pushTokens = device.pushTokens.filter(
          (elem, index) => device.pushTokens.findIndex((obj) => obj.token === elem.token) === index,
        );
        await device.save();
      }
      process.stdout.write('.');
    }

    /** Remove tokens from old devices */
    devices.pop();
    for (const device of devices) {
      device.pushTokens.filter(({ token }) => token !== duplicateToken._id);
      await device.save();
    }
  }

  process.stdout.write('\n');
};

(async () => {
  if (!DB_URL) {
    throw new Error('you have to set environment variable: DB_URL');
  }
  await mongoConnect();

  const CRON_NAME = 'cleanup-push-queue';
  const startDate = new Date();
  await setCronStart({ name: CRON_NAME, startDate });

  const sentPushs = await PushNotificationModel.countDocuments({
    sent: true,
  });
  console.info("count of sent push's", sentPushs);

  await cleanupPushQueue();
  await cleanupDuplicateTop100();
  await removeDuplicateTokens();

  await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
  process.exit(0);
})();
