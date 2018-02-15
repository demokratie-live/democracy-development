/* eslint-disable no-mixed-operators */

import _ from 'lodash';
import { CronJob } from 'cron';
import Scraper from 'dip21-scraper';
import ProgressBar from 'ascii-progress';
import prettyMs from 'pretty-ms';
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

const saveProcedure = async ({ procedureData }) => {
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
    legalValidity: ensureArray(procedureData.VORGANG.INKRAFTTRETEN),
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

const doScrape = ({ data }) => {
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

let bar1;
let bar2;
let bar3;

const logStartLinkProgress = async () => {
  console.log('Eintragslinks sammeln');
  bar1 = new ProgressBar({
    schema: 'filters [:bar] :percent :completed/:sum | :estf | :duration',
  });
  bar2 = new ProgressBar({
    schema: 'pages [:bar] :percent :completed/:sum | :estf | :duration',
  });
};

const logUpdateLinkProgress = async ({ search }) => {
  // barSearchPages.update(search.pages.completed, {}, search.pages.sum);
  // barSearchInstances.update(search.instances.completed, {}, search.instances.sum);

  bar1.tick(_.toInteger(search.instances.completed / search.instances.sum * 100 - bar1.current), {
    completed: search.instances.completed,
    sum: search.instances.sum,
    estf: prettyMs(
      _.toInteger((new Date() - bar1.start) / bar1.current * (bar1.total - bar1.current)),
      { compact: true },
    ),
    duration: prettyMs(_.toInteger(new Date() - bar1.start), { secDecimalDigits: 0 }),
  });
  bar2.tick(_.toInteger(search.pages.completed / search.pages.sum * 100 - bar2.current), {
    completed: search.pages.completed,
    sum: search.pages.sum,
    estf: prettyMs(
      _.toInteger((new Date() - bar2.start) / bar2.current * (bar2.total - bar2.current)),
      { compact: true },
    ),
    duration: prettyMs(_.toInteger(new Date() - bar2.start), { secDecimalDigits: 0 }),
  });
};

const logStartDataProgress = async ({ sum }) => {
  console.log('Einträge downloaden');
  // barData.start(sum, 0, { retries, maxRetries });
  bar3 = new ProgressBar({
    schema: 'links [:bar] :percent :current/:total | :estf | :duration',
    total: sum,
  });
};

const logUpdateDataProgress = async ({ value }) => {
  // barData.update(value, { retries, maxRetries });
  let tick = 0;
  if (value > bar3.current) {
    tick = 1;
  } else if (value < bar3.current) {
    tick = -1;
  }
  bar3.tick(tick, {
    estf: prettyMs(
      _.toInteger((new Date() - bar3.start) / bar3.current * (bar3.total - bar3.current)),
      { compact: true },
    ),
    duration: prettyMs(_.toInteger(new Date() - bar3.start), { secDecimalDigits: 0 }),
  });
};

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
      browserStackSize: 7,
      selectPeriods: ['Alle'],
      selectOperationTypes: ['100'],
      // log
      logStartLinkProgress,
      logUpdateLinkProgress,
      logStartDataProgress,
      logUpdateDataProgress,
      logFinished,
      // data
      outScraperData: saveProcedure,
      // cache(link skip logic)
      doScrape,
    });
  }
};

new CronJob('*/10 * * * *', cronTask, null, true, 'Europe/Berlin');
