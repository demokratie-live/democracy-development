import { Scraper } from '@democracy-deutschland/scapacra';
import { NamedPollDeputyScraperConfiguration } from '@democracy-deutschland/scapacra-bt';

import NamedPoll from '../models/NamedPoll';

export default async () => {
  Log.info('START NAMED POLL DEPUTIES SCRAPER');
  try {
    await Scraper.scrape([new NamedPollDeputyScraperConfiguration()], dataPackages => {
      dataPackages.map(async dataPackage => {
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
    });
  } catch (error) {
    Log.error(`Named Poll Deputies Scraper failed ${error.message}`);
  }
  Log.info('FINISH NAMED POLL DEPUTIES SCRAPER');
};
