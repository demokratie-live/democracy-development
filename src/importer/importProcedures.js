/* eslint-disable no-mixed-operators */

import _ from 'lodash';
import Scraper from '@democracy-deutschland/dip21-scraper';
import prettyMs from 'pretty-ms';
import moment from 'moment';

import CONFIG from './../config';
import PROCEDURE_STATES from './../config/procedureStates';
import PROCEDURE_DEFINITIONS from './../definitions/procedure';

import Procedure from './../models/Procedure';
import CronJobModel from './../models/CronJob';

const scraper = new Scraper();
let cronIsRunning = false;
let cronStart = null;

const parseDate = input => {
  const parts = input.match(/(\d+)/g);
  // note parts[1]-1
  return new Date(Date.UTC(parts[2], parts[1] - 1, parts[0]));
};

const ensureArray = element => {
  if (element) {
    if (!_.isArray(element)) {
      return [element];
    }
    return element;
  }
  return null;
};

const saveProcedure = async ({ procedureData }) => {
  // Transform History
  const process = _.isArray(procedureData.VORGANGSABLAUF.VORGANGSPOSITION)
    ? procedureData.VORGANGSABLAUF.VORGANGSPOSITION
    : [procedureData.VORGANGSABLAUF.VORGANGSPOSITION];
  const history = process.map(e => {
    const flow = {
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
        flow.decision = e.BESCHLUSS.map(beschluss => ({
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
  const oldProcedure = await Procedure.findOne({ procedureId: procedureData.vorgangId });

  // take old voteDate if present (can come from ConferenceWeekDetails Scraper)
  let voteDate = oldProcedure ? oldProcedure.voteDate : null;
  // Conditions on which Procedure is voted upon
  const btWithDecisions = history.filter(
    ({ initiator, decision }) =>
      // Beschluss liegt vor
      // TODO: decision should not be an array
      (decision &&
        decision.find(
          ({ tenor }) =>
            tenor === PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR.VORLAGE_ABLEHNUNG ||
            tenor === PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR.VORLAGE_ANNAHME ||
            tenor === PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR.VORLAGE_ERLEDIGT ||
            tenor === PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR.AUSSCHUSSFASSUNG_ANNAHME,
        )) ||
      // Zurückgezogen
      initiator === PROCEDURE_DEFINITIONS.HISTORY.INITIATOR.RUECKNAHME_AMTLICH ||
      initiator === PROCEDURE_DEFINITIONS.HISTORY.INITIATOR.RUECKNAHME ||
      initiator === PROCEDURE_DEFINITIONS.HISTORY.INITIATOR.RUECKNAHME_VORLAGE,
  );
  // Did we find a marker for voted Procedure?
  if (btWithDecisions.length > 0) {
    // Do not override the more accurate date form ConferenceWeekDetails Scraper
    const historyDate = new Date(btWithDecisions.pop().date);
    if (voteDate < historyDate) {
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
    approvalRequired: ensureArray(procedureData.VORGANG.ZUSTIMMUNGSBEDUERFTIGKEIT),
    euDocNr: procedureData.VORGANG.EU_DOK_NR || undefined,
    abstract: procedureData.VORGANG.ABSTRAKT || undefined,
    promulgation: ensureArray(procedureData.VORGANG.VERKUENDUNG),
    legalValidity: ensureArray(procedureData.VORGANG.INKRAFTTRETEN),
    tags: ensureArray(procedureData.VORGANG.SCHLAGWORT),
    subjectGroups: ensureArray(procedureData.VORGANG.SACHGEBIET),
    importantDocuments: ensureArray(procedureData.VORGANG.WICHTIGE_DRUCKSACHE || []).map(doc => ({
      editor: doc.DRS_HERAUSGEBER,
      number: doc.DRS_NUMMER,
      type: doc.DRS_TYP,
      url: doc.DRS_LINK,
    })),
    history,
    voteDate,
  };

  // Write to DB
  await Procedure.update(
    {
      procedureId: procedureObj.procedureId,
    },
    { $set: _.pickBy(procedureObj) },
    {
      upsert: true,
    },
  );
};

let linksSum = 0;
let startDate;

const logStartDataProgress = async ({ sum }) => {
  startDate = new Date();
  linksSum = sum;
  Log.info(`STARTED PROCEDURE SCRAPER DATA - ${startDate} - ${linksSum} Links found`);
};

const logFinished = () => {
  const end = Date.now();
  const elapsed = end - cronStart;
  Log.info(`FINISHED PROCEDURE SCRAPER DATA - ${prettyMs(_.toInteger(elapsed))}`);
  cronIsRunning = false;
};

const logError = ({ error }) => {
  Log.error(error);
};

const cronTask = async () => {
  if (!cronIsRunning) {
    cronIsRunning = true;
    cronStart = Date.now();
    await CronJobModel.findOneAndUpdate(
      {
        name: 'import-procedures',
      },
      {
        $set: {
          name: 'import-procedures',
          lastStartDate: cronStart,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );
    Log.info(`STARTED PROCEDURE SCRAPER - ${moment(cronStart).format()}`);
    // Do the scrape
    await scraper
      .scrape({
        // settings
        browserStackSize: 5,
        selectPeriods: CONFIG.PERIODS,
        selectOperationTypes: ['100', '500'],
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
        type: 'html',
        liveScrapeStates: PROCEDURE_STATES.IN_VOTE,
      })
      .then(async () => {
        await CronJobModel.update(
          {
            name: 'import-procedures',
          },
          {
            $set: {
              lastFinishDate: Date.now(),
            },
          },
          {
            upsert: true,
          },
        );

        Log.info(`FINISHED PROCEDURE SCRAPER`);
      })
      .catch(async error => {
        Log.error(error);
        logFinished();
        await CronJobModel.update(
          {
            name: 'import-procedures',
          },
          {
            $set: {
              lastErrorDate: Date.now(),
            },
          },
          {
            upsert: true,
          },
        );
      });
  }
};

export default cronTask;
