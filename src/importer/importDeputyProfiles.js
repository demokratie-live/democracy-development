import _ from 'lodash';

import { Scraper } from '@democracy-deutschland/scapacra';
import { DeputyProfileScraperConfiguration } from '@democracy-deutschland/scapacra-bt';

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
        imgURL: dataPackage.data.imgURL,
        party: dataPackage.data.party,
        name: dataPackage.data.name,
        job: dataPackage.data.job,
        office: dataPackage.data.office,
        links: dataPackage.data.links,
        biography: dataPackage.data.biography,
        constituency: dataPackage.data.constituency,
        constituencyName: dataPackage.data.constituencyName,
        directCandidate: dataPackage.data.directCandidate,
        functions: dataPackage.data.functions.map(({ category, functions }) => ({
          category,
          functions: functions.sort(),
        })),
        speechesURL: dataPackage.data.speechesURL,
        votesURL: dataPackage.data.votesURL,
        publicationRequirement: dataPackage.data.publicationRequirement.sort(),
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
