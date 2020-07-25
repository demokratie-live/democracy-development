import mongoConnect from "./mongoose";
import _ from "lodash";
import prettyMs from "pretty-ms";

import {
  ProcedureModel,
  getCron,
  setCronStart,
  CronJobModel,
  setCronSuccess,
  setCronError,
} from "@democracy-deutschland/bundestagio-common";
import { PROCEDURE as PROCEDURE_DEFINITIONS } from "@democracy-deutschland/bundestag.io-definitions";
import Scraper from "@democracy-deutschland/dip21-scraper";

const scraper = new Scraper({ baseUrl: "dip21.bundestag.de" });
let cronStart: Date | null = null;
const CRON_NAME = "Procedures";
const PERIODS = JSON.parse(process.env.PERIODS!).map((p: number) =>
  p.toString()
);

const parseDate = (input: string) => {
  const parts = input.match(/(\d+)/g);
  // @ts-ignore
  return new Date(Date.UTC(parts[2], parts[1] - 1, parts[0]));
};

const ensureArray = <T = any>(element: T | T[]) => {
  if (!Array.isArray(element)) {
    return [element];
  }
  return element;
};

const saveProcedure = async ({ procedureData }: { procedureData: any }) => {
  // Transform History
  let process = [];
  if (procedureData.VORGANGSABLAUF) {
    process = Array.isArray(procedureData.VORGANGSABLAUF.VORGANGSPOSITION)
      ? procedureData.VORGANGSABLAUF.VORGANGSPOSITION
      : [procedureData.VORGANGSABLAUF.VORGANGSPOSITION];
  }
  // TODO check why some e are undefined
  process = process.filter((e: any) => e);
  const history = process.map((e: any) => {
    const flow: any = {
      assignment: e.ZUORDNUNG.trim(),
      initiator: e.URHEBER.trim(),
      findSpot: e.FUNDSTELLE.trim(),
      findSpotUrl: _.trim(e.FUNDSTELLE_LINK),
      date: parseDate(e.FUNDSTELLE.substr(0, 10)),
    };
    if (e.VP_ABSTRAKT) {
      flow.abstract = e.VP_ABSTRAKT.trim();
    }
    if (e.BESCHLUSS) {
      if (!_.isArray(e.BESCHLUSS)) {
        e.BESCHLUSS = [e.BESCHLUSS];
      }
      if (e.BESCHLUSS.length > 0) {
        flow.decision = e.BESCHLUSS.map((beschluss: any) => ({
          page: beschluss.BESCHLUSSSEITE || undefined,
          tenor: beschluss.BESCHLUSSTENOR || undefined,
          document: beschluss.BEZUGSDOKUMENT || undefined,
          type: beschluss.ABSTIMMUNGSART || undefined,
          comment: beschluss.ABSTIMMUNG_BEMERKUNG || undefined,
          majority: beschluss.MEHRHEIT || undefined,
          foundation: beschluss.GRUNDLAGE || undefined,
        }));
      }
    }
    return flow;
  });

  // Find old Procedure
  const oldProcedure = await ProcedureModel.findOne({
    procedureId: procedureData.vorgangId,
  });

  // take old voteDate if present (can come from ConferenceWeekDetails Scraper)
  let voteDate = oldProcedure ? oldProcedure.voteDate : null;
  // Conditions on which Procedure is voted upon
  const btWithDecisions = history.filter(
    ({ initiator, decision }: { initiator: any; decision: any }) =>
      // Beschluss liegt vor
      // TODO: decision should not be an array
      (decision &&
        decision.find(
          ({ tenor }: any) =>
            tenor ===
              PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR.VORLAGE_ABLEHNUNG ||
            tenor ===
              PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR.VORLAGE_ANNAHME ||
            tenor ===
              PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR.VORLAGE_ERLEDIGT
          // ||            tenor ===
          // PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR
          //   .AUSSCHUSSFASSUNG_ANNAHME
        )) ||
      // Zurückgezogen
      initiator ===
        PROCEDURE_DEFINITIONS.HISTORY.INITIATOR.RUECKNAHME_AMTLICH ||
      initiator === PROCEDURE_DEFINITIONS.HISTORY.INITIATOR.RUECKNAHME ||
      initiator === PROCEDURE_DEFINITIONS.HISTORY.INITIATOR.RUECKNAHME_VORLAGE
  );
  // Did we find a marker for voted Procedure?
  if (btWithDecisions.length > 0) {
    // Do not override the more accurate date form ConferenceWeekDetails Scraper
    const historyDate = new Date(btWithDecisions.pop().date);
    if (!voteDate || voteDate < historyDate) {
      voteDate = historyDate;
    }
  }

  // Construct Procedure Object
  const procedureObj = {
    procedureId: procedureData.vorgangId || undefined,
    type: procedureData.VORGANG.VORGANGSTYP || undefined,
    period: parseInt(procedureData.VORGANG.WAHLPERIODE, 10) || undefined,
    title: procedureData.VORGANG.TITEL || undefined,
    currentStatus: procedureData.VORGANG.AKTUELLER_STAND || undefined,
    signature: procedureData.VORGANG.SIGNATUR || undefined,
    gestOrderNumber: procedureData.VORGANG.GESTA_ORDNUNGSNUMMER || undefined,
    approvalRequired: ensureArray(
      procedureData.VORGANG.ZUSTIMMUNGSBEDUERFTIGKEIT
    ),
    euDocNr: procedureData.VORGANG.EU_DOK_NR || undefined,
    abstract: procedureData.VORGANG.ABSTRAKT || undefined,
    promulgation: ensureArray(procedureData.VORGANG.VERKUENDUNG),
    legalValidity: ensureArray(procedureData.VORGANG.INKRAFTTRETEN),
    tags: ensureArray(procedureData.VORGANG.SCHLAGWORT),
    subjectGroups: ensureArray(procedureData.VORGANG.SACHGEBIET),
    importantDocuments: ensureArray(
      procedureData.VORGANG.WICHTIGE_DRUCKSACHE || []
    ).map((doc) => ({
      editor: doc.DRS_HERAUSGEBER,
      number: doc.DRS_NUMMER,
      type: doc.DRS_TYP,
      url: doc.DRS_LINK,
    })),
    history,
    voteDate,
  };

  // Write to DB
  await ProcedureModel.update(
    {
      procedureId: procedureObj.procedureId,
    },
    { $set: _.pickBy(procedureObj) },
    {
      upsert: true,
    }
  );
};

let linksSum = 0;
let startDate;

const logStartDataProgress = async ({ sum }: { sum: number }) => {
  startDate = new Date();
  linksSum = sum;
  console.info(
    `[Cronjob][${CRON_NAME}] Data-Process started - ${startDate} - ${linksSum} Links found`
  );
};

const logFinished = () => {
  const end = Date.now();
  const elapsed = end - cronStart!.getTime();
  console.info(
    `[Cronjob][${CRON_NAME}] Data-Process finished - ${prettyMs(
      _.toInteger(elapsed)
    )}`
  );
};

const logError = ({ error }: { error: any }) => {
  console.error(`[Cronjob][${CRON_NAME}] error: ${JSON.stringify(error)}`);
};

const start = async () => {
  cronStart = new Date();
  const cron = await getCron({ name: CRON_NAME });
  if (cron.running) {
    console.error(`[Cronjob][${CRON_NAME}] running still - skipping`);
    return;
  }
  await setCronStart({ name: CRON_NAME, startDate: cronStart });
  // Do the scrape
  await scraper
    .scrape({
      // settings
      browserStackSize: 2,
      selectPeriods: PERIODS,
      selectOperationTypes: ["100", "500"],
      logUpdateSearchProgress: () => {},
      logStartDataProgress,
      logStopDataProgress: () => {},
      logUpdateDataProgress: () => {},
      // log
      logFinished,
      logError,
      // data
      outScraperData: saveProcedure,
      // cache(link skip logic)
      // doScrape
      scrapeType: "html",
      // liveScrapeStates: PROCEDURE_STATES.IN_VOTE,
    })
    .then(async () => {
      await CronJobModel.update(
        {
          name: "import-procedures",
        },
        {
          $set: {
            lastFinishDate: Date.now(),
          },
        },
        {
          upsert: true,
        }
      );

      await setCronSuccess({ name: CRON_NAME, successStartDate: cronStart! });
    })
    .catch(async (error: any) => {
      await setCronError({ name: CRON_NAME, error: JSON.stringify(error) });
      logFinished();
      throw error;
    });
};

(async () => {
  console.info("START");
  console.info(
    "process.env",
    process.env.DB_URL,
    PERIODS,
    process.env.SCRAPER_USER_AGEND
  );
  if (!process.env.DB_URL || !process.env.SCRAPER_USER_AGEND || !PERIODS) {
    throw new Error(
      "you have to set environment variable: DB_URL & PERIODS & SCRAPER_USER_AGEND"
    );
  }
  await mongoConnect();
  console.log("procedures", await ProcedureModel.countDocuments({}));
  await start().catch(() => process.exit(1));
  process.exit(0);
})();
