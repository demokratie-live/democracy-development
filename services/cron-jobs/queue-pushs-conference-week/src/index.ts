import mongoConnect from './mongoose';
import moment from 'moment';

import {
  ProcedureModel,
  DeviceModel,
  Device,
  PUSH_TYPE,
  PUSH_CATEGORY,
  setCronStart,
  setCronSuccess,
  queuePushs,
} from '@democracy-deutschland/democracy-common';

const start = async () => {
  /*
  Kommende Woche ist Sitzungswoche!
  Es warten 13 spannende Themen auf Dich. Viel Spaß beim Abstimmen.
  (Sonntag vor Sitzungswoche, alle)
  */

  const CRON_NAME = 'queuePushsConferenceWeek';
  const startDate = new Date();
  let counter = 0;
  await setCronStart({ name: CRON_NAME, startDate });
  // Find coresponding Procedures
  const startOfWeek = moment().startOf('week').toDate(); // Should be So
  const endOfWeek = moment().endOf('week').toDate(); // Should be Sa

  console.log('Find Procedures between', startOfWeek, 'and', endOfWeek);
  const procedures = await ProcedureModel.find(
    {
      $and: [{ voteDate: { $gte: startOfWeek } }, { voteDate: { $lte: endOfWeek } }],
    },
    { procedureId: 1 },
  );
  const procedureIds = procedures.map((p) => p.procedureId);
  console.log('Found', procedureIds.length, 'Procedures');

  // Find Devices & Tokens

  let hasMore = true;
  let skip = 0;
  let limit = 1000;
  while (hasMore) {
    console.log('Find Devices', skip);
    const devices = await DeviceModel.find(
      {
        'notificationSettings.enabled': true,
        'notificationSettings.conferenceWeekPushs': true,
      },
      { pushTokens: 1 },
      { skip, limit },
    );

    if (devices.length === 0) {
      console.log('No Devices found');
      hasMore = false;
    } else {
      skip += limit;
      const tokens = devices.reduce<Device['pushTokens']>((array, { pushTokens }) => [...array, ...pushTokens], []);

      // Only send Message if at least one vote & one token is found
      const queuePromises = [];
      if (tokens.length > 0 && procedureIds.length > 0) {
        counter += tokens.length;
        const title = 'Kommende Woche ist Sitzungswoche!';
        const message =
          procedureIds.length === 1
            ? `Es wartet 1 spannendes Thema auf Dich. Viel Spaß beim Abstimmen.`
            : `Es warten ${procedureIds.length} spannende Themen auf Dich. Viel Spaß beim Abstimmen.`;
        queuePromises.push(
          queuePushs({
            type: PUSH_TYPE.PROCEDURE_BULK,
            category: PUSH_CATEGORY.CONFERENCE_WEEK,
            title,
            message,
            procedureIds,
            tokens,
          }),
        );
        await Promise.all(queuePromises);
      }
    }
  }

  console.log(`queued push's: ${counter}`);

  await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
};

(async () => {
  console.info('START');
  console.info('process.env', process.env.BUNDESTAGIO_SERVER_URL, process.env.DB_URL);
  if (!process.env.BUNDESTAGIO_SERVER_URL) {
    throw new Error('you have to set environment variable: BUNDESTAGIO_SERVER_URL & DB_URL');
  }
  await mongoConnect();
  console.log('procedures', await ProcedureModel.countDocuments({}));
  await start().catch(() => process.exit(1));
  process.exit(0);
})();
