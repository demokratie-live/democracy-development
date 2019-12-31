import { Scraper } from '@democracy-deutschland/scapacra';
import { NamedPollDeputyScraper } from '@democracy-deutschland/scapacra-bt';

import NamedPoll from '../models/NamedPoll';

import { getCron, setCronStart, setCronSuccess, setCronError } from './../services/cronJobs/tools';

export const CRON_NAME = 'NamedPollsDeputies';

export default async () => {
  const startDate = new Date();
  const cron = await getCron({ name: CRON_NAME });
  if (cron.running) {
    Log.error(`[Cronjob][${CRON_NAME}] running still - skipping`);
    return;
  }
  await setCronStart({ name: CRON_NAME, startDate });
  try {
    await Scraper.scrape(new NamedPollDeputyScraper(), async dataPackage => {
      // Construct Database object
      const namedPoll = { webId: dataPackage.data.id };
      // Add webId field, Remove id field
      const deputies = dataPackage.data.votes.deputies.reduce((accumulator, deputy) => {
        // Remove deputies without an id;
        if (!deputy.id) {
          return accumulator;
        }
        const dep = deputy;
        dep.webId = dep.id;
        delete dep.id;
        return [...accumulator, dep];
      }, []);

      const existingNamedPoll = await NamedPoll.findOne({ webId: namedPoll.webId });

      // votes.deputies
      if (
        !existingNamedPoll ||
        !existingNamedPoll.votes ||
        !(JSON.stringify(existingNamedPoll.votes.deputies) === JSON.stringify(deputies))
      ) {
        namedPoll['votes.deputies'] = deputies;
      }

      // Update/Insert
      await NamedPoll.findOneAndUpdate(
        { webId: namedPoll.webId },
        { $set: namedPoll },
        { upsert: true },
      );

      return null;
    });
  } catch (error) {
    await setCronError({ name: CRON_NAME, error: JSON.stringify(error) });
  }
  await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
};
