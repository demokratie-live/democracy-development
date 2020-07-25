import mongoConnect from "./mongoose";
import createClient from "./graphql/client";
import getDeputyUpdates from "./graphql/queries/getDeputyUpdates";
import {
  DeputyModel,
  getCron,
  setCronStart,
  setCronSuccess,
  setCronError,
  convertPartyName,
  IDeputy,
} from "@democracy-deutschland/democracy-common";
import { forEachSeries } from "p-iteration";
import {
  DeputyUpdates,
  DeputyUpdatesVariables,
} from "./graphql/queries/__generated__/DeputyUpdates";

export const CRON_NAME = "DeputyProfiles";

const start = async () => {
  // New SuccessStartDate
  const startDate = new Date();
  const cron = await getCron({ name: CRON_NAME });
  let counter = 0;
  if (cron.running) {
    console.error(`[Cronjob][${CRON_NAME}] running still - skipping`);
    return;
  }
  await setCronStart({ name: CRON_NAME, startDate });
  // Last SuccessStartDate
  let since = new Date(1900);
  if (cron.lastSuccessStartDate) {
    since = new Date(cron.lastSuccessStartDate);
  }

  // Query Bundestag.io
  try {
    const client = createClient();
    const limit = 50;
    let offset = 0;
    let done = false;
    while (!done) {
      // fetch
      const {
        data: { deputyUpdates },
      } =
        // eslint-disable-next-line no-await-in-loop
        await client.query<DeputyUpdates, DeputyUpdatesVariables>({
          query: getDeputyUpdates,
          variables: { since, limit, offset },
        });
      if (deputyUpdates) {
        const { deputies } = deputyUpdates;
        if (deputies) {
          counter += deputies.length;
          // handle results
          await forEachSeries(deputies, async (data) => {
            if (data) {
              const deputy: Partial<IDeputy> = {
                webId: data.webId!,
                imgURL: data.imgURL!,
                name: data.name,
                party: data.party ? convertPartyName(data.party) : undefined,
                job: data.job,
                biography: data.biography
                  ? data.biography.join("\n\n")
                  : undefined,
                constituency: data.constituency
                  ? parseInt(data.constituency, 10).toString()
                  : undefined, // remove pre zeros
                directCandidate: data.directCandidate,
                contact: {
                  address: data.office ? data.office.join("\n") : undefined,
                  // email: { type: String },
                  links: data.links.map(({ URL, name, username }) => ({
                    URL,
                    name,
                    username: username ? username : undefined,
                  })),
                },
              };
              // Update/Insert
              await DeputyModel.findOneAndUpdate(
                { webId: deputy.webId ? deputy.webId : undefined },
                { $set: deputy },
                { upsert: true }
              );
            }
          });

          // continue?
          if (deputies.length < limit) {
            done = true;
          }
        }
      }
      offset += limit;
    }
    // Update Cron - Success
    await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
    console.log(`synced items: ${counter}`);
  } catch (error) {
    console.error(error);
    // If address is not reachable the query will throw
    await setCronError({ name: CRON_NAME, error: JSON.stringify(error) });
    throw error;
  }
};

(async () => {
  console.info("START");
  console.info(
    "process.env",
    process.env.BUNDESTAGIO_SERVER_URL,
    process.env.DB_URL
  );
  if (!process.env.BUNDESTAGIO_SERVER_URL) {
    throw new Error(
      "you have to set environment variable: BUNDESTAGIO_SERVER_URL & DB_URL"
    );
  }
  await mongoConnect();
  console.log("procedures", await DeputyModel.countDocuments({}));
  await start().catch(() => process.exit(1));
  process.exit(0);
})();
