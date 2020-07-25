import mongoConnect from "./mongoose";

import { ConferenceWeekDetailScraper } from "@democracy-deutschland/scapacra-bt";
import { Scraper } from "@democracy-deutschland/scapacra";
import url from "url";

import {
  PROCEDURE as PROCEDURE_DEFINITIONS,
  CONFERENCEWEEKDETAIL as CONFERENCEWEEKDETAIL_DEFINITIONS,
} from "@democracy-deutschland/bundestag.io-definitions";

import {
  ProcedureModel,
  getCron,
  setCronStart,
  setCronSuccess,
  setCronError,
  ConferenceWeekDetailModel,
  ConferenceWeeCronJobkData,
} from "@democracy-deutschland/bundestagio-common";

const CRON_NAME = "ConferenceWeekDetails";

const isVote = (topic: any, heading: any, documents: any, status: any) => {
  /*
  Erste Beratung = NEIN
  ——
  // Beratung des Antrags = JA , es sei denn TOP ‚Überweisungen im vereinfachten Verfahren‘ = NEIN
  Beratung des Antrags = NEIN
  ——
  Beratung der Beschlussempfehlung = JA
  Zweite und dritte Beratung = JA
  */
  if (
    topic.search(
      CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_BERATUNG_ANTRAG
    ) !== -1
  ) {
    if (
      heading &&
      heading.search(
        CONFERENCEWEEKDETAIL_DEFINITIONS.HEADING.FIND_ABSCHLIESSENDE_BERATUNG
      ) !== -1
    ) {
      return true;
    }
    if (
      status &&
      status.find((s: any) => {
        // if(s.documents.sort().join(',') === documents.sort().join(',') &&
        if (
          s.documents.some((l: any) => documents.includes(l)) &&
          s.line.search(
            CONFERENCEWEEKDETAIL_DEFINITIONS.STATUS.FIND_ANTRAG_COMPLETED
          ) !== -1
        ) {
          return true;
        }
        return false;
      })
    ) {
      return true;
    }
    return false;
  }
  if (
    topic.search(CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_ERSTE_BERATUNG) !==
    -1
  ) {
    return false;
  }
  if (
    topic.search(
      CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_BERATUNG_BESCHLUSSEMPFEHLUNG
    ) !== -1 ||
    topic.search(
      CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_ZWEITE_DRITTE_BERATUNG
    ) !== -1 ||
    topic.search(
      CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC
        .FIND_ZWEITE_BERATUNG_SCHLUSSABSTIMMUNG
    ) !== -1 ||
    topic.search(
      CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_DRITTE_BERATUNG
    ) !== -1
  ) {
    return true;
  }
  return null;
};

const getProcedureIds = async (documents: any) => {
  const docs = documents.map(
    (document: string) => `${url.parse(document).path}$`
  );
  if (docs.length === 0) {
    return [];
  }
  const procedures = await ProcedureModel.find(
    {
      // Find Procedures matching any of the given Documents, excluding Beschlussempfehlung
      importantDocuments: {
        $elemMatch: {
          $and: [
            // Match at least one Document
            { url: { $regex: docs.join("|") } },
            // which is not Beschlussempfehlung und Bericht || Beschlussempfehlung
            {
              type: {
                $nin: [
                  PROCEDURE_DEFINITIONS.IMPORTANT_DOCUMENTS.TYPE
                    .BESCHLUSSEMPFEHLUNG_BERICHT,
                  PROCEDURE_DEFINITIONS.IMPORTANT_DOCUMENTS.TYPE
                    .BESCHLUSSEMPFEHLUNG,
                  PROCEDURE_DEFINITIONS.IMPORTANT_DOCUMENTS.TYPE.BERICHT,
                ],
              },
            },
          ],
        },
      },
    },
    { procedureId: 1 }
  );

  return procedures.map((p) => p.procedureId);
};

const start = async () => {
  const startDate = new Date();
  const cron = await getCron({ name: CRON_NAME });
  let lastData: ConferenceWeeCronJobkData | undefined;
  if (cron.running) {
    console.error(`[Cronjob][${CRON_NAME}] running still - skipping`);
    throw new Error(`[Cronjob][${CRON_NAME}] running still - skipping`);
  }
  await setCronStart({ name: CRON_NAME, startDate });

  try {
    const startData =
      cron.data && cron.lastSuccessStartDate?.getDay() === new Date().getDay()
        ? {
            year: cron.data.lastYear,
            week: cron.data.lastWeek,
          }
        : undefined;
    let voteDates: any[] = [];
    let lastProcedureIds: any[] = [];
    await Scraper.scrape(
      new ConferenceWeekDetailScraper(startData),
      async (dataPackage: any) => {
        // Construct Database object
        console.log(
          "dataPackage.data.this.year",
          dataPackage.data.this.year,
          dataPackage.data.this.week
        );
        lastData = {
          lastYear: dataPackage.data.previous.year,
          lastWeek: dataPackage.data.previous.week,
        };
        const ConferenceWeekDetail = {
          URL: dataPackage.meta.url,
          id: dataPackage.data.id,
          previousYear: dataPackage.data.previous.year,
          previousWeek: dataPackage.data.previous.week,
          thisYear: dataPackage.data.this.year,
          thisWeek: dataPackage.data.this.week,
          nextYear: dataPackage.data.next.year,
          nextWeek: dataPackage.data.next.week,
          sessions: await dataPackage.data.sessions.reduce(
            async (pSession: any, session: any) => {
              const resultSession = await pSession;
              resultSession.push({
                ...session,
                tops: await session.tops.reduce(async (pTop: any, top: any) => {
                  // Await for last result
                  const resultTop = await pTop;
                  // Write VoteEnd Date
                  lastProcedureIds.forEach((procedureId) => {
                    if (
                      voteDates[procedureId].voteDate &&
                      voteDates[procedureId].voteDate <= top.time
                    ) {
                      voteDates[procedureId].voteEnd = top.time;
                    }
                  });
                  lastProcedureIds = [];
                  // Append current result
                  resultTop.push({
                    ...top,
                    topic: await Promise.all(
                      top.topic.map(async (topic: any) => {
                        // eslint-disable-next-line no-param-reassign
                        topic.isVote = isVote(
                          topic.lines.join(" "),
                          top.heading,
                          topic.documents,
                          top.status
                        );
                        topic.procedureIds = await getProcedureIds(
                          topic.documents
                        ); // eslint-disable-line no-param-reassign
                        // Save VoteDates to update them at the end when the correct values are present
                        topic.procedureIds.forEach((procedureId: any) => {
                          // Override voteDate only if there is none set or we would override it by a new date
                          if (
                            !voteDates[procedureId] ||
                            !voteDates[procedureId].voteDate ||
                            topic.isVote === true
                          ) {
                            voteDates[procedureId] = {
                              procedureId,
                              voteDate: topic.isVote ? top.time : null,
                              voteEnd: null,
                              documents: topic.documents,
                            };
                          }
                        });
                        // Remember last procedureIds to save voteEnd Date
                        lastProcedureIds = lastProcedureIds.concat(
                          topic.procedureIds
                        );
                        return topic;
                      })
                    ),
                  });
                  return resultTop;
                }, []),
              });
              return resultSession;
            },
            []
          ),
        };
        // Update/Insert
        await ConferenceWeekDetailModel.update(
          { id: ConferenceWeekDetail.id },
          { $set: ConferenceWeekDetail },
          { upsert: true }
        );
      }
    );
    voteDates = voteDates.filter((voteDate) => !!voteDate);
    // Update Procedure VoteDates
    await Promise.all(
      voteDates.map(async (procedureUpdate) => {
        await ProcedureModel.update(
          {
            procedureId: procedureUpdate.procedureId,
            // Update only when needed
            $or: [
              {
                $and: [
                  { voteDate: { $ne: procedureUpdate.voteDate } },
                  // Make sure we do not override date from procedureScraper
                  { voteDate: { $lt: procedureUpdate.voteDate } },
                ],
              },
              { voteEnd: { $ne: procedureUpdate.voteEnd } },
            ],
          },
          {
            $set: {
              voteDate: procedureUpdate.voteDate,
              voteEnd: procedureUpdate.voteEnd,
            },
          }
        );
      })
    );
    console.log(JSON.stringify(voteDates, null, 2));
  } catch (error) {
    await setCronError({ name: CRON_NAME, error: JSON.stringify(error) });
    throw error;
  }
  await setCronSuccess({
    name: CRON_NAME,
    successStartDate: startDate,
    data: lastData,
  });
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
