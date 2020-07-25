import mongoConnect from "./mongoose";

import { Scraper } from "@democracy-deutschland/scapacra";
import { NamedPollScraper } from "@democracy-deutschland/scapacra-bt";
import url from "url";

import {
  PROCEDURE as PROCEDURE_DEFINITIONS,
  NAMEDPOLL as NAMEDPOLL_DEFINITIONS,
} from "@democracy-deutschland/bundestag.io-definitions";

import {
  ProcedureModel,
  NamedPollModel,
  getCron,
  setCronStart,
  setCronSuccess,
  setCronError,
} from "@democracy-deutschland/bundestagio-common";
import { IProcedure } from "@democracy-deutschland/bundestagio-common/dist/models/Procedure/schema";

const CRON_NAME = "NamedPolls";

const start = async () => {
  const startDate = new Date();
  const cron = await getCron({ name: CRON_NAME });
  if (cron.running) {
    console.error(`[Cronjob][${CRON_NAME}] running still - skipping`);
    return;
  }
  await setCronStart({ name: CRON_NAME, startDate });
  try {
    await Scraper.scrape(new NamedPollScraper(), async (dataPackage: any) => {
      let procedureId = null;
      // TODO unify
      // currently the dip21 scraper returns document urls like so:
      // "http://dipbt.bundestag.de:80/dip21/btd/19/010/1901038.pdf
      // The named poll scraper returns them like so:
      // http://dip21.bundestag.de/dip21/btd/19/010/1901038.pdf
      const findSpotUrls = dataPackage.data.documents.map((document: any) => ({
        "history.findSpotUrl": {
          $regex: `.*${url.parse(document).path}.*`,
        },
      }));

      if (findSpotUrls.length === 0) {
        console.warn(
          `[Cronjob][${CRON_NAME}] no documents on poll ${dataPackage.data.id}`
        );
        return;
      }

      let procedures;
      // Only match those which are not an Änderungsantrag
      if (
        dataPackage.data.title.search(
          NAMEDPOLL_DEFINITIONS.TITLE
            .FIND_AENDERUNGSANTRAG_OR_ENTSCHLIESSUNGSANTRAG_OR_EINSPRUCH
        ) === -1 &&
        dataPackage.data.description.search(
          NAMEDPOLL_DEFINITIONS.DESCRIPTION
            .FIND_AENDERUNGSANTRAG_OR_ENTSCHLIESSUNGSANTRAG_OR_EINSPRUCH
        ) === -1
      ) {
        // Find matching Procedures
        procedures = await ProcedureModel.find({
          $and: findSpotUrls,
          "history.decision": {
            $elemMatch: {
              type:
                PROCEDURE_DEFINITIONS.HISTORY.DECISION.TYPE
                  .NAMENTLICHE_ABSTIMMUNG,
              tenor: {
                $not:
                  PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR
                    .FIND_AENDERUNGSANTRAG,
              },
            },
          },
        });

        // We did find too many
        if (procedures.length > 1) {
          console.error(
            `[Cronjob][${CRON_NAME}] duplicate Procedure match on: ${dataPackage.meta.url}`
          );
        }

        // We did not find anything
        if (procedures.length === 0) {
          console.warn(
            `[Cronjob][${CRON_NAME}] no Procedure match on: ${dataPackage.meta.url}`
          );
        }

        // We have exactly one match and can assign the procedureId
        if (procedures.length === 1) {
          [{ procedureId }] = procedures;
        }
      }
      // Construct Database object
      const namedPoll: any = {
        procedureId,
        URL: dataPackage.meta.url,
        webId: dataPackage.data.id,
        date: dataPackage.data.date,
        title: dataPackage.data.title,
        description: dataPackage.data.description,
        detailedDescription: dataPackage.data.detailedDescription,
        documents: dataPackage.data.documents,
        deputyVotesURL: dataPackage.data.deputyVotesURL,
        membersVoted: dataPackage.data.membersVoted,
        plenarProtocolURL: dataPackage.data.plenarProtocolURL,
        media: dataPackage.data.media,
        speeches: dataPackage.data.speeches,
      };

      // We need this for nested document votes.all -> to prevent update/history generation
      // This is retarded - but what u can do? ¯\_(ツ)_/¯
      // Find NamedPoll
      const existingNamedPoll = await NamedPollModel.findOne({
        webId: namedPoll.webId,
      });
      if (
        existingNamedPoll &&
        existingNamedPoll.votes &&
        existingNamedPoll.votes.all
      ) {
        if (
          existingNamedPoll.votes.all.total !== dataPackage.data.votes.all.total
        ) {
          namedPoll["votes.all.total"] = dataPackage.data.votes.all.total;
        }
        if (
          existingNamedPoll.votes.all.yes !== dataPackage.data.votes.all.yes
        ) {
          namedPoll["votes.all.yes"] = dataPackage.data.votes.all.yes;
        }
        if (existingNamedPoll.votes.all.no !== dataPackage.data.votes.all.no) {
          namedPoll["votes.all.no"] = dataPackage.data.votes.all.no;
        }
        if (
          existingNamedPoll.votes.all.abstain !==
          dataPackage.data.votes.all.abstain
        ) {
          namedPoll["votes.all.abstain"] = dataPackage.data.votes.all.abstain;
        }
        if (existingNamedPoll.votes.all.na !== dataPackage.data.votes.all.na) {
          namedPoll["votes.all.na"] = dataPackage.data.votes.all.na;
        }
      } else {
        namedPoll["votes.all"] = dataPackage.data.votes.all;
      }

      // Update Procedure Custom Data
      // TODO This should not be the way we handle this
      const { votes } = dataPackage.data;
      if (procedureId) {
        const customData = {
          voteResults: {
            partyVotes: votes.parties.map((partyVote: any) => {
              const main: any = [
                {
                  decision: "YES",
                  value: partyVote.votes.yes,
                },
                {
                  decision: "NO",
                  value: partyVote.votes.no,
                },
                {
                  decision: "ABSTINATION",
                  value: partyVote.votes.abstain,
                },
                {
                  decision: "NOTVOTED",
                  value: partyVote.votes.na,
                },
              ].reduce(
                (prev, { decision, value }) => {
                  if (prev.value < value) {
                    return { decision, value };
                  }
                  return prev;
                },
                { value: 0 }
              );
              return {
                deviants: {
                  yes: partyVote.votes.yes || 0,
                  abstination: partyVote.votes.abstain || 0,
                  no: partyVote.votes.no || 0,
                  notVoted: partyVote.votes.na || 0,
                },
                party: partyVote.name,
                main: main.decision,
              };
            }),
            yes: votes.all.yes || 0,
            abstination: votes.all.abstain || 0,
            no: votes.all.no || 0,
            notVoted: votes.all.na || 0,
          } as any,
        };

        // Determin Vote Direction
        let [{ history: histories }] = procedures as IProcedure[];

        const namedHistoryEntry = histories
          .find(
            (history) =>
              history.decision &&
              history.decision.find(
                (decision) =>
                  decision.type &&
                  decision.type ===
                    PROCEDURE_DEFINITIONS.HISTORY.DECISION.TYPE
                      .NAMENTLICHE_ABSTIMMUNG
              )
          )
          ?.decision.find(
            ({ type }) =>
              type ===
              PROCEDURE_DEFINITIONS.HISTORY.DECISION.TYPE.NAMENTLICHE_ABSTIMMUNG
          );

        const votingRecommendationEntrys = histories.filter(
          ({ initiator }) =>
            initiator &&
            initiator.search(
              PROCEDURE_DEFINITIONS.HISTORY.INITIATOR
                .FIND_BESCHLUSSEMPFEHLUNG_BERICHT
            ) !== -1
        );

        customData.voteResults.votingDocument =
          namedHistoryEntry?.comment?.search(
            PROCEDURE_DEFINITIONS.HISTORY.DECISION.COMMENT
              .FIND_BESCHLUSSEMPFEHLUNG_ABLEHNUNG
          ) !== -1
            ? "recommendedDecision"
            : "mainDocument";

        votingRecommendationEntrys.forEach((votingRecommendationEntry) => {
          if (votingRecommendationEntry.abstract) {
            if (
              votingRecommendationEntry.abstract.search(
                PROCEDURE_DEFINITIONS.HISTORY.ABSTRACT
                  .EMPFEHLUNG_VORLAGE_ANNAHME
              ) !== -1
            ) {
              customData.voteResults.votingRecommendation = true;
            } else if (
              votingRecommendationEntry.abstract.search(
                PROCEDURE_DEFINITIONS.HISTORY.ABSTRACT
                  .EMPFEHLUNG_VORLAGE_ABLEHNUNG
              ) !== -1
            ) {
              customData.voteResults.votingRecommendation = false;
            }
          }
        });

        await ProcedureModel.findOneAndUpdate({ procedureId }, { customData });

        // Define inverseVoteDirection on NamedPoll
        const inverseVoteDirection =
          customData.voteResults.votingDocument === "recommendedDecision" &&
          customData.voteResults.votingRecommendation === false;
        if (
          !existingNamedPoll ||
          !existingNamedPoll.votes ||
          !(
            existingNamedPoll.votes.inverseVoteDirection ===
            inverseVoteDirection
          )
        ) {
          namedPoll["votes.inverseVoteDirection"] = inverseVoteDirection;
        }
      }

      // votes.parties
      if (
        !existingNamedPoll ||
        !existingNamedPoll.votes ||
        !(
          JSON.stringify(existingNamedPoll.votes.parties) ===
          JSON.stringify(dataPackage.data.votes.parties)
        )
      ) {
        namedPoll["votes.parties"] = dataPackage.data.votes.parties;
      }

      // Update/Insert
      await NamedPollModel.findOneAndUpdate(
        { webId: namedPoll.webId },
        { $set: namedPoll },
        { upsert: true }
      );
    });

    // Validate Data - find duplicate matches which is an error!
    const duplicateMatches = await NamedPollModel.aggregate([
      {
        $group: {
          _id: "$procedureId",
          count: { $sum: 1 },
          namedpolls: { $push: "$webId" },
        },
      },
      {
        $match: {
          count: { $ne: 1.0 },
          _id: { $ne: null },
        },
      },
    ]);
    if (duplicateMatches.length !== 0) {
      // TODO clarify this should be an error - matching should be better
      duplicateMatches.forEach((duplicate) => {
        console.error(
          `[Cronjob][${CRON_NAME}] Duplicate Matches(${
            duplicate.count
          }) on procedureId ${
            duplicate._id // eslint-disable-line no-underscore-dangle
          } for NamedPolls: ${duplicate.namedpolls.join(",")}`
        );
      });
    }
    await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
  } catch (error) {
    await setCronError({ name: CRON_NAME, error: JSON.stringify(error) });
    throw error;
  }
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
