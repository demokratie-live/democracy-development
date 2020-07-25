import mongoConnect from "./mongoose";
import _ from "lodash";
import moment from "moment";
import { forEachSeries } from "p-iteration";

// Definitions
import { PROCEDURE as PROCEDURE_DEFINITIONS } from "@democracy-deutschland/bundestag.io-definitions";

// GraphQL
import createClient from "./graphql/client";
import getProcedureUpdates from "./graphql/queries/getProcedureUpdates";
import {
  ProcedureModel,
  VoteSelection,
  getCron,
  setCronStart,
  setCronSuccess,
  setCronError,
  queuePushsOutcome,
  convertPartyName,
  IProcedure,
  PartyVotes,
  ProcedureDocument,
} from "@democracy-deutschland/democracy-common";

// Queries
import {
  ProcedureUpdates,
  ProcedureUpdatesVariables,
  ProcedureUpdates_procedureUpdates_procedures,
} from "./graphql/queries/__generated__/ProcedureUpdates";
import { VoteDecision } from "./__generated__/globalTypes";

export const CRON_NAME = "Procedures";

const notEmpty = <TValue>(
  value: TValue | null | undefined
): value is TValue => {
  return value !== null && value !== undefined;
};

export const nullToUndefined = <TValue>(value: TValue | null | undefined) => {
  return value === null ? undefined : value;
};

const importProcedures = async (
  bIoProcedure: ProcedureUpdates_procedureUpdates_procedures,
  { push = false }
) => {
  const importProcedure: Partial<IProcedure> = {
    ...bIoProcedure,
    procedureId: nullToUndefined(bIoProcedure.procedureId),
    period: nullToUndefined(bIoProcedure.period),
    type: nullToUndefined(bIoProcedure.type),
    currentStatus: nullToUndefined(bIoProcedure.currentStatus),
    abstract: nullToUndefined(bIoProcedure.abstract),
    currentStatusHistory: bIoProcedure.currentStatusHistory
      ? bIoProcedure.currentStatusHistory.filter(notEmpty)
      : undefined,
    tags: bIoProcedure.tags ? bIoProcedure.tags.filter(notEmpty) : undefined,
    subjectGroups: bIoProcedure.subjectGroups
      ? bIoProcedure.subjectGroups.filter(notEmpty)
      : undefined,
    importantDocuments: bIoProcedure.importantDocuments?.reduce<
      ProcedureDocument[]
    >((prev, doc) => {
      if (doc) {
        return [...prev, doc] as ProcedureDocument[];
      }
      return prev;
    }, []),
  };
  if (bIoProcedure && bIoProcedure.history) {
    const [lastHistory] = bIoProcedure.history.slice(-1);
    if (lastHistory) {
      importProcedure.lastUpdateDate = lastHistory.date;
    }
    if (bIoProcedure.history[0]) {
      importProcedure.submissionDate = bIoProcedure.history[0].date;
    }
  }

  // check vote results
  let voteResults: IProcedure["voteResults"] | undefined;
  if (
    bIoProcedure.customData &&
    bIoProcedure.customData.voteResults &&
    (bIoProcedure.customData.voteResults.yes ||
      bIoProcedure.customData.voteResults.abstination ||
      bIoProcedure.customData.voteResults.no)
  ) {
    voteResults = {
      yes: bIoProcedure.customData.voteResults.yes,
      abstination: bIoProcedure.customData.voteResults.abstination,
      no: bIoProcedure.customData.voteResults.no,
      notVoted: nullToUndefined(bIoProcedure.customData.voteResults.notVoted),
      decisionText: nullToUndefined(
        bIoProcedure.customData.voteResults.decisionText
      ),
      namedVote: nullToUndefined(bIoProcedure.namedVote),
      partyVotes: [],
    };

    if (bIoProcedure.customData.voteResults.partyVotes) {
      voteResults.partyVotes = bIoProcedure.customData.voteResults.partyVotes.reduce<
        PartyVotes[]
      >((pre, partyVote) => {
        if (partyVote) {
          let mainDecision: VoteSelection;
          const { main, party, ...rest } = partyVote;
          switch (main) {
            case VoteDecision.YES:
              mainDecision = VoteSelection.Yes;
              break;
            case VoteDecision.ABSTINATION:
              mainDecision = VoteSelection.Abstination;
              break;
            case VoteDecision.NO:
              mainDecision = VoteSelection.No;
              break;
            default:
              mainDecision = VoteSelection.Notvoted;
          }
          let deviants: PartyVotes["deviants"] | undefined;
          if (
            rest.deviants &&
            rest.deviants.yes !== null &&
            rest.deviants.abstination !== null &&
            rest.deviants.no !== null
          ) {
            deviants = {
              yes: rest.deviants.yes,
              abstination: rest.deviants.abstination,
              no: rest.deviants.no,
              notVoted: rest.deviants.notVoted,
            };
          }

          if (!deviants) {
            return pre;
          }

          const result: PartyVotes = {
            ...rest,
            _id: false,
            party: convertPartyName(party),
            main: mainDecision,
            deviants,
          };
          return [...pre, result];
        }
        return pre;
      }, []);

      // toggle votingData (Yes & No) if needed
      if (
        bIoProcedure.customData.voteResults.votingDocument ===
          "recommendedDecision" &&
        bIoProcedure.customData.voteResults.votingRecommendation === false
      ) {
        voteResults = {
          ...voteResults,
          yes: voteResults.no,
          no: voteResults.yes,
          partyVotes: voteResults.partyVotes.map(
            ({ main, deviants, ...rest }) => {
              let mainDecision = main;
              if (main !== "ABSTINATION") {
                mainDecision =
                  main === VoteSelection.Yes
                    ? VoteSelection.No
                    : VoteSelection.Yes;
              }
              return {
                ...rest,
                main: mainDecision,
                deviants: {
                  ...deviants,
                  yes: deviants.no,
                  no: deviants.yes,
                },
              };
            }
          ),
        };
      }
    }
  }
  importProcedure.voteResults = voteResults;

  // Extract Session info
  if (bIoProcedure.sessions) {
    // This assumes that the last entry will always be the vote
    const lastSession = bIoProcedure.sessions.pop();
    if (lastSession && lastSession.session?.top?.topic?.isVote) {
      importProcedure.voteWeek = lastSession.thisWeek; // eslint-disable-line no-param-reassign
      importProcedure.voteYear = lastSession.thisYear; // eslint-disable-line no-param-reassign
      importProcedure.sessionTOPHeading = nullToUndefined(
        lastSession.session.top.heading
      ); // eslint-disable-line no-param-reassign
    }
  }
  // Set CalendarWeek & Year even if no sessions where found
  // Always override Week & Year by voteDate since we sort by this and the session match is not too accurate
  if (
    bIoProcedure.voteDate /* && (!bIoProcedure.voteWeek || !bIoProcedure.voteYear) */
  ) {
    importProcedure.voteWeek = parseInt(
      moment(bIoProcedure.voteDate).format("W")
    ); // eslint-disable-line no-param-reassign
    importProcedure.voteYear = moment(bIoProcedure.voteDate).year(); // eslint-disable-line no-param-reassign
  }

  const oldProcedure = await ProcedureModel.findOne({
    procedureId: nullToUndefined(bIoProcedure.procedureId),
  });

  return ProcedureModel.findOneAndUpdate(
    { procedureId: importProcedure.procedureId },
    _(importProcedure)
      .omitBy((x) => _.isUndefined(x))
      .value(),
    {
      upsert: true,
      new: true,
    }
  ).then(async () => {
    if (push) {
      // We have a vote result in new Procedure
      if (
        importProcedure.voteResults &&
        (importProcedure.voteResults.yes !== null ||
          importProcedure.voteResults.no !== null ||
          importProcedure.voteResults.abstination !== null ||
          importProcedure.voteResults.notVoted !== null)
      ) {
        // We have no old Procedure or no VoteResult on old Procedure
        if (
          importProcedure.procedureId &&
          (!oldProcedure || !oldProcedure.voteResults)
        ) {
          await queuePushsOutcome(importProcedure.procedureId);
          // We have different values for VoteResult
        } else if (
          importProcedure.procedureId &&
          importProcedure.voteResults &&
          oldProcedure &&
          (importProcedure.voteResults.yes !== oldProcedure.voteResults.yes ||
            importProcedure.voteResults.no !== oldProcedure.voteResults.no ||
            importProcedure.voteResults.abstination !==
              oldProcedure.voteResults.abstination ||
            (importProcedure.voteResults.notVoted &&
              importProcedure.voteResults.notVoted !==
                oldProcedure.voteResults.notVoted))
        ) {
          await queuePushsOutcome(importProcedure.procedureId);
        }
      }
    }
  });
};

const start = async () => {
  // New SuccessStartDate
  const startDate = new Date();
  const cron = await getCron({ name: CRON_NAME });
  if (cron.running) {
    console.error(`[Cronjob][${CRON_NAME}] running still - skipping`);
    return;
  }
  await setCronStart({ name: CRON_NAME, startDate });
  // Last SuccessStartDate
  let since: Date = new Date("1900");
  if (cron.lastSuccessStartDate) {
    since = new Date(cron.lastSuccessStartDate);
  }
  let counter = 0;

  // Query Bundestag.io
  try {
    const client = createClient();
    const limit = 50;
    let offset = 0;
    let done = false;
    while (!done) {
      // fetch
      const {
        errors,
        data: { procedureUpdates },
      } = await client.query<ProcedureUpdates, ProcedureUpdatesVariables>({
        query: getProcedureUpdates,
        variables: {
          since,
          limit,
          offset,
          periods: [19],
          types: [
            PROCEDURE_DEFINITIONS.TYPE.GESETZGEBUNG,
            PROCEDURE_DEFINITIONS.TYPE.ANTRAG,
          ],
        },
      });
      console.log("use variables:", {
        since,
        limit,
        offset,
        periods: [19],
        types: [
          PROCEDURE_DEFINITIONS.TYPE.GESETZGEBUNG,
          PROCEDURE_DEFINITIONS.TYPE.ANTRAG,
        ],
      });

      if (procedureUpdates) {
        const { procedures } = procedureUpdates;

        if (procedures) {
          counter += procedures.length;
          // handle results
          await forEachSeries(procedures, async (data) => {
            if (
              data &&
              data.period === 19 &&
              (data.type === PROCEDURE_DEFINITIONS.TYPE.GESETZGEBUNG ||
                data.type === PROCEDURE_DEFINITIONS.TYPE.ANTRAG)
            ) {
              await importProcedures(data, { push: true });
            }
          });

          // continue?
          if (procedures.length < limit) {
            done = true;
          }
          offset += limit;
        }
      } else {
        await setCronError({ name: CRON_NAME, error: JSON.stringify(errors) });
        throw errors;
      }
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
  console.log("procedures", await ProcedureModel.countDocuments({}));
  await start().catch(() => process.exit(1));
  process.exit(0);
})();
