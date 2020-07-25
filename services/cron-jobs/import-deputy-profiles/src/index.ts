import mongoConnect from "./mongoose";
import url from "url";

import {
  DeputyProfileScraper,
  DeputyDataPackage,
} from "@democracy-deutschland/scapacra-bt";
import { Scraper } from "@democracy-deutschland/scapacra";

import {
  setCronStart,
  setCronSuccess,
  setCronError,
  DeputyModel,
  IDeputy,
} from "@democracy-deutschland/bundestagio-common";
import { Link } from "@democracy-deutschland/scapacra-bt/dist/DeputyProfile/type";

const CRON_NAME = "DeputyProfiles";

const getUsername = ({ URL, name }: Link) => {
  let username;
  switch (name) {
    case "Instagram":
      const parsedUrlInstagram = url.parse(URL).pathname?.split("/");
      if (parsedUrlInstagram && parsedUrlInstagram[1]) {
        username = `${parsedUrlInstagram[1]}`;
      }
      break;
    case "Twitter":
    case "Facebook":
      const parsedUrlTwitter = url.parse(URL).pathname?.split("/");
      if (parsedUrlTwitter && parsedUrlTwitter[1]) {
        username = `${parsedUrlTwitter[1]}`;
      }
      username = `@${username}`;
      break;
    default:
      break;
  }
  return username;
};

const start = async () => {
  const startDate = new Date();
  await setCronStart({ name: CRON_NAME, startDate });
  try {
    await Scraper.scrape(new DeputyProfileScraper(), async (data: any) => {
      const dataPackage = data as DeputyDataPackage;
      console.log("webId", dataPackage.data.id);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Ignore those which have no webid (ausgeschieden)
      if (!dataPackage.data.id) {
        return;
      }
      // Construct Database object
      const deputy: IDeputy = {
        URL: dataPackage.meta.url,
        webId: dataPackage.data.id,
        imgURL: dataPackage.data.imgURL,
        party: dataPackage.data.party,
        name: dataPackage.data.name,
        job: dataPackage.data.job,
        office: dataPackage.data.office,
        links: dataPackage.data.links.map((link) => ({
          ...link,
          username: getUsername(link),
        })),
        biography: dataPackage.data.biography,
        constituency: dataPackage.data.constituency,
        constituencyName: dataPackage.data.constituencyName,
        directCandidate: dataPackage.data.directCandidate,
        functions: dataPackage.data.functions,
        speechesURL: dataPackage.data.speechesURL,
        votesURL: dataPackage.data.votesURL,
        publicationRequirement: dataPackage.data.publicationRequirement.sort(),
      };
      // console.log(deputy);
      // Update/Insert
      await DeputyModel.updateOne(
        { webId: deputy.webId },
        { $set: deputy },
        { upsert: true }
      );
      return;
    });
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
  console.log("deputies", await DeputyModel.countDocuments({}));
  await start().catch(() => process.exit(1));
  process.exit(0);
})();
