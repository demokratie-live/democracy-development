import mongoConnect from "./mongoose";
import { unionBy } from "lodash";
import { forEachSeries } from "p-iteration";

// GraphQL
import createClient from "./graphql/client";
import getNamedPollUpdates from "./graphql/queries/getNamedPollUpdates";
import {
  DeputyModel,
  getCron,
  setCronStart,
  setCronSuccess,
  setCronError,
  VoteSelection,
} from "@democracy-deutschland/democracy-common";
import {
  NamedPollUpdates,
  NamedPollUpdatesVariables,
} from "./graphql/queries/__generated__/NamedPollUpdates";

export const CRON_NAME = "NamedPolls";

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
  let since = new Date(1970);
  if (cron.lastSuccessStartDate) {
    since = new Date(cron.lastSuccessStartDate);
  }

  // Query Bundestag.io
  try {
    const client = createClient();
    const limit = 50;
    let offset = 0;
    const associated = true;
    let done = false;
    while (!done) {
      // Data storage
      const updates: {
        [webId: string]: { procedureId: string; decision: VoteSelection }[];
      } = {};

      // fetch
      const {
        data: { namedPollUpdates },
      } =
        // eslint-disable-next-line no-await-in-loop
        await client.query<NamedPollUpdates, NamedPollUpdatesVariables>({
          query: getNamedPollUpdates,
          variables: { since, limit, offset, associated },
        });

      if (namedPollUpdates) {
        const { namedPolls } = namedPollUpdates;
        if (namedPolls) {
          counter += namedPolls.length;
          // handle results
          await forEachSeries(namedPolls, (data) => {
            // procedureId is not necessarily present
            if (data?.procedureId && data.votes && data.votes.deputies) {
              // parse every deputies vote
              data.votes.deputies.forEach(async (voteData) => {
                if (voteData && data.votes) {
                  let decision;
                  switch (voteData.vote) {
                    case "ja":
                      decision = data.votes.inverseVoteDirection
                        ? VoteSelection.No
                        : VoteSelection.Yes;
                      break;
                    case "nein":
                      decision = data.votes.inverseVoteDirection
                        ? VoteSelection.Yes
                        : VoteSelection.No;
                      break;
                    case "na":
                      decision = VoteSelection.Notvoted;
                      break;
                    case "enthalten":
                      decision = VoteSelection.Abstination;
                      break;
                    default:
                      decision = null;
                  }
                  // Validate decision Data
                  if (!decision) {
                    console.error(
                      `NamedPoll import vote missmatch on deputy vote string: ${voteData.vote}`
                    );
                    return null;
                  }
                  // Prepare update
                  if (voteData.webId && data.procedureId) {
                    updates[voteData.webId] = updates[voteData.webId]
                      ? [
                          ...updates[voteData.webId],
                          { procedureId: data.procedureId, decision },
                        ]
                      : [{ procedureId: data.procedureId, decision }];
                  }
                }
                return null;
              });
            }
            return null;
          });
        }

        // Insert Data
        forEachSeries(Object.keys(updates), async (deputyWebId) => {
          // TODO try to update deputy without fetching. z.B. with aggregation setUnion
          const deputy = await DeputyModel.findOne({ webId: deputyWebId });
          if (deputy) {
            // remove duplicates
            const votes = unionBy(
              updates[deputyWebId],
              deputy.votes,
              "procedureId"
            );
            // Insert
            await DeputyModel.updateOne(
              { webId: deputyWebId },
              { $set: { votes } }
            );
          }
        });

        // continue?
        if (namedPolls && namedPolls.length < limit) {
          done = true;
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
  console.log("deputies", await DeputyModel.countDocuments({}));
  await start().catch(() => process.exit(1));
  process.exit(0);
})();
