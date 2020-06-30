import mongoConnect from "./mongoose";

import { DeputyProfileScraper } from "@democracy-deutschland/scapacra-bt";
import { Scraper } from "@democracy-deutschland/scapacra";

import {
  ProcedureModel,
  getCron,
  setCronStart,
  setCronSuccess,
  setCronError,
  DeputyModel,
} from "@democracy-deutschland/bundestagio-common";

const CRON_NAME = "DeputyProfiles";

const start = async () => {
  const startDate = new Date();
  const cron = await getCron({ name: CRON_NAME });
  if (cron.running) {
    console.error(`[Cronjob][${CRON_NAME}] running still - skipping`);
    return;
  }
  await setCronStart({ name: CRON_NAME, startDate });
  try {
    await Scraper.scrape(
      new DeputyProfileScraper(),
      async (dataPackage: any) => {
        // Ignore those which have no webid (ausgeschieden)
        if (!dataPackage.data.id) {
          return;
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
        await DeputyModel.update(
          { webId: deputy.webId },
          { $set: deputy },
          { upsert: true }
        );
        return;
      }
    );
  } catch (error) {
    await setCronError({ name: CRON_NAME, error: JSON.stringify(error) });
    throw error;
  }
  await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
};

(async () => {
  console.info("START");
  console.info("process.env", process.env.DB_URL);
  if (!process.env.DB_URL) {
    throw new Error("you have to set environment variable: DB_URL");
  }
  await mongoConnect();
  console.log("procedures", await ProcedureModel.countDocuments({}));
  await start().catch(() => process.exit(1));
  process.exit(0);
})();
