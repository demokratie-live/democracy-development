import {
  ProcedureModel,
  NamedPollModel,
  setCronStart,
  setCronSuccess,
  setCronError,
  mongoConnect,
} from '@democracy-deutschland/bundestagio-common';
import { CRON_NAME } from './constants';
import { crawl } from './crawler';

const start = async () => {
  const startDate = new Date();
  await setCronStart({ name: CRON_NAME, startDate });
  try {
    await crawl();

    // Validate Data - find duplicate matches which is an error!
    const duplicateMatches = await NamedPollModel.aggregate([
      {
        $group: {
          _id: '$procedureId',
          count: { $sum: 1 },
          namedpolls: { $push: '$webId' },
        },
      },
      {
        $match: {
          count: { $ne: 1.0 },
          _id: { $ne: null },
        },
      },
    ]);
    if (duplicateMatches.length !== 0) {
      // TODO clarify this should be an error - matching should be better
      duplicateMatches.forEach((duplicate) => {
        console.error(
          `\n[Cronjob][${CRON_NAME}] Duplicate Matches(${duplicate.count}) on procedureId ${
            duplicate._id // eslint-disable-line no-underscore-dangle
          } for NamedPolls: ${duplicate.namedpolls.join(',')}`,
        );
      });
    }
    await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
  } catch (error) {
    await setCronError({ name: CRON_NAME, error: JSON.stringify(error) });
    throw error;
  }
};

(async () => {
  console.info('START');
  console.info('process.env', process.env.DB_URL);
  if (!process.env.DB_URL) {
    throw new Error('you have to set environment variable: DB_URL');
  }
  await mongoConnect();
  console.log('procedures', await ProcedureModel.countDocuments({}));
  await start();
  process.exit(0);
})();
