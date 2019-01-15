import _ from 'lodash';

import { Scraper } from 'scapacra';
import { DeputyProfileScraperConfiguration } from 'scapacra-bt';

import DeputyModel from '../models/Deputy';

export default async () => {
  console.log('START DEPUTY PROFILES SCRAPER');
  await Scraper.scrape([new DeputyProfileScraperConfiguration()], dataPackages => {
    dataPackages.map(async dataPackage => {
      // Ignore those which have no webid (ausgeschieden)
      if (!dataPackage.data.id) {
        return null;
      }
      // Construct Database object
      const deputy = {
        URL: dataPackage.metadata.url,
        webId: dataPackage.data.id,
        img: dataPackage.data.img,
        party: dataPackage.data.party,
        name: dataPackage.data.name,
        job: dataPackage.data.job,
        office: dataPackage.data.buero,
        links: dataPackage.data.links,
        biography: dataPackage.data.bio,
        constituency: dataPackage.data.wk,
        constituencyName: dataPackage.data.wk_name,
        functions: dataPackage.data.aemter.map(({ cat, amt }) => ({
          category: cat,
          functions: amt,
        })),
        speechesURL: dataPackage.data.speeches,
        votesURL: dataPackage.data.votes,
        publicationRequirement: dataPackage.data.publication_requirement,
      };
      // Update/Insert
      await DeputyModel.update(
        { webId: deputy.webId },
        { $set: _.pickBy(deputy) },
        { upsert: true },
      );
      return null;
    });
  });
  console.log('FINISH DEPUTY PROFILES SCRAPER');
};
