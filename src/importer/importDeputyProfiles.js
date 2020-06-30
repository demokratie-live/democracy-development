import { Scraper } from '@democracy-deutschland/scapacra';
import { DeputyProfileScraper } from '@democracy-deutschland/scapacra-bt';

import {
  DeputyModel,
  getCron,
  setCronStart,
  setCronSuccess,
  setCronError,
} from '@democracy-deutschland/bundestagio-common';

export const CRON_NAME = 'DeputyProfiles';

export default async () => {
  const startDate = new Date();
  const cron = await getCron({ name: CRON_NAME });
  if (cron.running) {
    Log.error(`[Cronjob][${CRON_NAME}] running still - skipping`);
    return;
  }
  await setCronStart({ name: CRON_NAME, startDate });
  try {
    await Scraper.scrape(new DeputyProfileScraper(), async dataPackage => {
      // Ignore those which have no webid (ausgeschieden)
      if (!dataPackage.data.id) {
        return null;
      }
      // Construct Database object
      const deputy = {
        URL: dataPackage.meta.url,
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
        functions: dataPackage.data.functions,
        speechesURL: dataPackage.data.speechesURL,
        votesURL: dataPackage.data.votesURL,
        publicationRequirement: dataPackage.data.publicationRequirement.sort(),
      };
      // Update/Insert
      await DeputyModel.update({ webId: deputy.webId }, { $set: deputy }, { upsert: true });
      return null;
    });
  } catch (error) {
    await setCronError({ name: CRON_NAME, error: JSON.stringify(error) });
  }
  await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
};
