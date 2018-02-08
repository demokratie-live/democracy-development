import _ from 'lodash';
import { CronJob } from 'cron';
import Scraper from 'dip21-scraper';
import Progress from 'cli-progress'; // TODO REMOVE
import Procedure from './models/Procedure';
// import mongoose from './config/db';
require('./config/db');

const scraper = new Scraper();
let pastScrapeData = null;
const procedureStatusWhitelist = ['Überwiesen', 'Beschlussempfehlung liegt vor'];
let cronIsRunning = false;
let cronStart = null;

const parseDate = (input) => {
  const parts = input.match(/(\d+)/g);
  // note parts[1]-1
  return new Date(Date.UTC(parts[2], parts[1] - 1, parts[0]));
};

const ensureArray = (element) => {
  if (element) {
    if (!_.isArray(element)) {
      return [element];
    }
    return element;
  }
  return null;
};

const saveProcedure = async (procedureId, procedureData) => {
  const process = _.isArray(procedureData.VORGANGSABLAUF.VORGANGSPOSITION)
    ? procedureData.VORGANGSABLAUF.VORGANGSPOSITION
    : [procedureData.VORGANGSABLAUF.VORGANGSPOSITION];
  const history = process.map((e) => {
    const flow = {
      procedureId: procedureData.vorgangId.trim(),
      assignment: e.ZUORDNUNG.trim(),
      initiator: e.URHEBER.trim(),
      findSpot: e.FUNDSTELLE.trim(),
      findSpotUrl: _.trim(e.FUNDSTELLE_LINK),
      date: parseDate(e.FUNDSTELLE.substr(0, 10)),
    };
    if (e.BESCHLUSS) {
      flow.decision = e.BESCHLUSS;
      flow.decisionTenor = e.BESCHLUSS.BESCHLUSSTENOR;
    }
    return flow;
  });

  /* let approvalRequired;
  if (procedureData.VORGANG.ZUSTIMMUNGSBEDUERFTIGKEIT) {
    if (!_.isArray(procedureData.VORGANG.ZUSTIMMUNGSBEDUERFTIGKEIT)) {
      approvalRequired = [procedureData.VORGANG.ZUSTIMMUNGSBEDUERFTIGKEIT];
    } else {
      approvalRequired = procedureData.VORGANG.ZUSTIMMUNGSBEDUERFTIGKEIT;
    }
  } */

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
    legalValidity: procedureData.VORGANG.INKRAFTTRETEN || undefined,
    tags: ensureArray(procedureData.VORGANG.SCHLAGWORT),
    history,
  };
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

const doScrape = (data) => {
  const parts = data.date.match(/(\d+)/g);
  const dipDate = new Date(Date.UTC(parts[2], parts[1] - 1, parts[0]));

  let scrapeData = pastScrapeData.find(({ procedureId }) => procedureId === data.id);
  if (!scrapeData) {
    scrapeData = { updatedAt: 0 };
  }
  const scrapeDate = new Date(scrapeData.updatedAt);

  const timeSpanDib = new Date() - dipDate;
  const timeSpanScrape = new Date() - scrapeDate;

  const oneDay = 1000 * 60 * 60 * 24;
  const oneWeek = oneDay * 7;
  const oneMonth = oneDay * 31;
  const oneYear = oneDay * 365;

  // TIME SCRAPE
  if (
    // always scrape when dib_date is after last scrape_date
    dipDate > scrapeDate ||
    // always scrape last 3 Months
    timeSpanDib < 3 * oneMonth ||
    // always scrape when last scrape_date is one month old
    timeSpanScrape > oneMonth ||
    // always scrape when last scrape_date is one day old and dib is up to 1 year old
    (timeSpanScrape > oneDay && timeSpanDib < oneYear) ||
    // always scrape when last scrape_date is one week old and dib is up to 4 year old
    (timeSpanScrape > oneWeek && timeSpanDib < 4 * oneYear)
  ) {
    return true;
  }

  // STATUS SCRAPE -> Whitelist
  if (procedureStatusWhitelist.find(white => white === scrapeData.currentStatus)) {
    return true;
  }

  return false;
};

// TODO REMOVE
const barLink = new Progress.Bar(
  {
    format:
      '[{bar}] {percentage}% | ETA: {eta_formatted} | duration: {duration_formatted} | {value}/{total}',
  },
  Progress.Presets.shades_classic,
);

const logStartLinkProgress = async (sum, current) => {
  console.log('Eintragslinks sammeln');

  barLink.start(sum, current);
};

const logUpdateLinkProgress = async (current) => {
  barLink.update(current);
};

const logStopLinkProgress = async () => {
  barLink.stop();
};

const barData = new Progress.Bar(
  {
    format:
      '[{bar}] {percentage}% | ETA: {eta_formatted} | duration: {duration_formatted} | {value}/{total} | {errorCounter}',
  },
  Progress.Presets.shades_classic,
);

const logStartDataProgress = async (sum, errorCounter) => {
  console.log('Einträge downloaden');
  barData.start(sum, 0, errorCounter);
};

const logUpdateDataProgress = async (current, errorCounter) => {
  barData.update(current, errorCounter);
};

const logStopDataProgress = async () => {
  barData.stop();
};

const logError = (error) => {
  console.log(error);
};
// ^ TODO REMOVE

const logFinished = () => {
  const end = Date.now();
  const elapsed = end - cronStart;
  const difference = new Date(elapsed);
  const diffMins = difference.getMinutes();
  console.log(`### Finish Cronjob! Time: ${diffMins} min`);
  cronIsRunning = false;
};

console.log('### Waiting for Cronjob');
const cronTask = async () => {
  if (!cronIsRunning) {
    cronIsRunning = true;
    cronStart = Date.now();
    console.log('### Start Cronjob');
    // get old Scrape Data for cache
    pastScrapeData = await Procedure.find({}, { procedureId: 1, updatedAt: 1, currentStatus: 1 });
    // Do the scrape
    await scraper.scrape({
      // settings
      browserStackSize: () => 7,
      selectOperationTypes: () => ['6'],
      // log
      logStartLinkProgress,
      logUpdateLinkProgress,
      logStopLinkProgress,
      logStartDataProgress,
      logUpdateDataProgress,
      logStopDataProgress,
      logError,
      logFinished,
      // data
      outScraperData: saveProcedure,
      // cache(link skip logic)
      doScrape,
    });
  }
};

new CronJob('*/2 * * * *', cronTask, null, true, 'Europe/Berlin');
