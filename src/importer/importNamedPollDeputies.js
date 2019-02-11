import { Scraper } from '@democracy-deutschland/scapacra';
import { NamedPollDeputyScraperConfiguration } from '@democracy-deutschland/scapacra-bt';

import NamedPoll from '../models/NamedPoll';

export default async () => {
  Log.info('START NAMED POLL DEPUTIES SCRAPER');
  await Scraper.scrape([new NamedPollDeputyScraperConfiguration()], dataPackages => {
    dataPackages.map(async dataPackage => {
      // Construct Database object
      const namedPoll = {
        webId: dataPackage.data.id,
        votes: {
          deputies: dataPackage.data.votes.deputies,
        },
      };

      // Update/Insert
      await NamedPoll.update(
        { webId: namedPoll.webId },
        {
          $set: {
            'votes.deputies': namedPoll.votes.deputies,
          },
        },
        { upsert: true },
      );

      return null;
    });
  });
  Log.info('FINISH NAMED POLL DEPUTIES SCRAPER');
};
