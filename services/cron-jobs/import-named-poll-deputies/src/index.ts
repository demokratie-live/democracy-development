/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scraper } from '@democracy-deutschland/scapacra';
import { NamedPollDeputyScraper } from '@democracy-deutschland/scapacra-bt';

import {
  NamedPollModel,
  setCronStart,
  setCronSuccess,
  setCronError,
  mongoConnect,
} from '@democracy-deutschland/bundestagio-common';

const CRON_NAME = 'NamedPollsDeputies';

const start = async () => {
  const startDate = new Date();
  await setCronStart({ name: CRON_NAME, startDate });
  try {
    await Scraper.scrape(new NamedPollDeputyScraper(), async (dataPackage: any) => {
      console.log('id:', dataPackage.data.id);
      // Construct Database object
      const namedPoll: any = { webId: dataPackage.data.id };
      // Add webId field, Remove id field
      const deputies = dataPackage.data.votes.deputies.reduce((accumulator: any, deputy: any) => {
        // Remove deputies without an id;
        if (!deputy.id) {
          return accumulator;
        }
        const dep = deputy;
        dep.webId = dep.id;
        delete dep.id;
        return [...accumulator, dep];
      }, []);

      const existingNamedPoll = await NamedPollModel.findOne({
        webId: namedPoll.webId,
      });

      // votes.deputies
      if (
        !existingNamedPoll ||
        !existingNamedPoll.votes ||
        !(JSON.stringify(existingNamedPoll.votes.deputies) === JSON.stringify(deputies))
      ) {
        namedPoll['votes.deputies'] = deputies;
      }

      // Update/Insert
      await NamedPollModel.findOneAndUpdate({ webId: namedPoll.webId }, { $set: namedPoll }, { upsert: true });

      return;
    });
  } catch (error) {
    await setCronError({ name: CRON_NAME, error: JSON.stringify(error) });
    throw error;
  }
  await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
};

(async () => {
  console.info('START');
  console.info('process.env', process.env.DB_URL);
  if (!process.env.DB_URL) {
    throw new Error('you have to set environment variable: DB_URL');
  }
  await mongoConnect(process.env.DB_URL);
  console.log('procedures', await NamedPollModel.countDocuments({}));
  await start();
  process.exit(0);
})();
