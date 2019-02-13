import { Scraper } from '@democracy-deutschland/scapacra';
import { NamedPollDeputyScraperConfiguration } from '@democracy-deutschland/scapacra-bt';

import NamedPoll from '../models/NamedPoll';

export default async () => {
  Log.info('START NAMED POLL DEPUTIES SCRAPER');
  await Scraper.scrape([new NamedPollDeputyScraperConfiguration()], dataPackages => {
    dataPackages.map(async dataPackage => {
      // Construct Database object
      const namedPollWebId = dataPackage.data.id;
      // Add webId field, Remove id field
      const deputies = dataPackage.data.votes.deputies.map(deputy => {
        const dep = deputy;
        dep.webId = dep.id;
        delete dep.id;
        return dep;
      });

      // Update/Insert
      await NamedPoll.update(
        { webId: namedPollWebId },
        {
          $addToSet: {
            'votes.deputies': deputies,
          },
        },
        { upsert: true },
      );

      return null;
    });
  });
  Log.info('FINISH NAMED POLL DEPUTIES SCRAPER');
};
