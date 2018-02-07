import mongoose from './config/db';
import Procedure from './models/Procedure';
import _ from 'lodash';
import Scraper from 'dip21-scraper';
import { CronJob } from 'cron';
// TODO REMOVE
import Progress from 'cli-progress';

const scraper = new Scraper();

function parseDate(input) {
  const parts = input.match(/(\d+)/g);
  // note parts[1]-1
  return new Date(Date.UTC(parts[2], parts[1] - 1, parts[0]));
}

const ensureArray = (element) => {
  if (element) {
    if (!_.isArray(element)) {
      return [element];
    }
    return element;
  }
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

  let approvalRequired;
  if (procedureData.VORGANG.ZUSTIMMUNGSBEDUERFTIGKEIT) {
    if (!_.isArray(procedureData.VORGANG.ZUSTIMMUNGSBEDUERFTIGKEIT)) {
      approvalRequired = [procedureData.VORGANG.ZUSTIMMUNGSBEDUERFTIGKEIT];
    } else {
      approvalRequired = procedureData.VORGANG.ZUSTIMMUNGSBEDUERFTIGKEIT;
    }
  }

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

const procedureStatusWhitelist = ['Überwiesen', 'Beschlussempfehlung liegt vor'];

function doScrape(data) {
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

  /*
    TIME SCRAPE

    scrape when dib_date > scrape_date                              // always scrape when dib_date is after last scrape_date
    scrape when time_span_dib < 3 Month                             // always scrape last 3 Months
    scrape when time_span_scrape > 1 Month                          // always scrape when last scrape_date is one month old
    scrape when time_span_scrape > 1 Day && time_span_dib < 1 Year  // always scrape when last scrape_date is one day old and dib is up to 1 year old
    scrape when time_span_scrape > 1 Week && time_span_dib < 4 Year // always scrape when last scrape_date is one week old and dib is up to 4 year old
  */
  if (
    dipDate > scrapeDate ||
    timeSpanDib < 3 * oneMonth ||
    timeSpanScrape > oneMonth ||
    (timeSpanScrape > oneDay && timeSpanDib < oneYear) ||
    (timeSpanScrape > oneWeek && timeSpanDib < 4 * oneYear)
  ) {
    return true;
  }

  /*
    STATUS SCRAPE
    Gesetzes Status -> whitelist
   */
  if (procedureStatusWhitelist.find(white => white === scrapeData.currentStatus)) {
    return true;
  }

  // return new Date() - dipDate <= oneYear; // Scrape 1 year
}

var pastScrapeData = null;

// TODO REMOVE
const barLink = new Progress.Bar(
  {
    format:
      '[{bar}] {percentage}% | ETA: {eta_formatted} | duration: {duration_formatted} | {value}/{total}',
  },
  Progress.Presets.shades_classic,
);

async function startLinkProgress(sum, current) {
  console.log('Eintragslinks sammeln');

  barLink.start(sum, current);
}

async function updateLinkProgress(current) {
  barLink.update(current);
}

async function stopLinkProgress() {
  barLink.stop();
}

const barData = new Progress.Bar(
  {
    format:
      '[{bar}] {percentage}% | ETA: {eta_formatted} | duration: {duration_formatted} | {value}/{total} | {errorCounter}',
  },
  Progress.Presets.shades_classic,
);

async function startDataProgress(sum, errorCounter) {
  console.log('Einträge downloaden');
  barData.start(sum, 0, errorCounter);
}

async function updateDataProgress(current, errorCounter) {
  barData.update(current, errorCounter);
}

async function stopDataProgress() {
  barData.stop();
}
// ^ TODO REMOVE

const job = new CronJob(
  '*/30 * * * *',
  async () => {
    console.log('### Start Cronjob');
    pastScrapeData = await Procedure.find({}, { procedureId: 1, updatedAt: 1, currentStatus: 1 });
    await scraper.scrape({
      selectedPeriod: () => '',
      selectedOperationTypes: () => ['6'],
      stackSize: 7,
      doScrape,
      // startLinkProgress: () => {},
      startLinkProgress,
      // updateLinkProgress: () => {},
      updateLinkProgress,
      // stopLinkProgress: () => {},
      stopLinkProgress,
      // startDataProgress: () => {},
      startDataProgress,
      // stopDataProgress: () => {},
      stopDataProgress,
      // updateDataProgress: () => {},
      updateDataProgress,
      logData: saveProcedure,
      logLinks: () => {},
      finished: () => {
        // resolve();
        console.log('### Finish Cronjob');
      },
    });
    // mongoose.disconnect();
  },
  null,
  true,
  'Europe/Berlin',
);

/*

program.option('-p, --path  [type]', 'Path of dir with json files').parse(process.argv);

const files = fs.readdirSync(program.path);

function parseDate(input) {
  const parts = input.match(/(\d+)/g);
  // note parts[1]-1
  return new Date(Date.UTC(parts[2], parts[1] - 1, parts[0]));
}

const procedures = files.map(async (file) => {
  const filePath = `${program.path}/${file}`;
  if (path.extname(filePath) === '.json') {
    const procedure = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const process = _.isArray(procedure.VORGANGSABLAUF.VORGANGSPOSITION)
      ? procedure.VORGANGSABLAUF.VORGANGSPOSITION
      : [procedure.VORGANGSABLAUF.VORGANGSPOSITION];

    const history = process.map((e) => {
      const flow = {
        procedureId: procedure.vorgangId.trim(),
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

    const procedureObj = {
      procedureId: procedure.vorgangId || undefined,
      type: procedure.VORGANG.VORGANGSTYP || undefined,
      period: procedure.VORGANG.WAHLPERIODE || undefined,
      title: procedure.VORGANG.TITEL || undefined,
      currentStatus: procedure.VORGANG.AKTUELLER_STAND || undefined,
      signature: procedure.VORGANG.SIGNATUR || undefined,
      gestOrderNumber: procedure.VORGANG.GESTA_ORDNUNGSNUMMER || undefined,
      approvalRequired: procedure.VORGANG.ZUSTIMMUNGSBEDUERFTIGKEIT || undefined,
      euDocNr: procedure.VORGANG.EU_DOK_NR || undefined,
      abstract: procedure.VORGANG.ABSTRAKT || undefined,
      promulgation: procedure.VORGANG.VERKUENDUNG || undefined,
      legalValidity: procedure.VORGANG.INKRAFTTRETEN || undefined,
      tags: procedure.VORGANG.SCHLAGWORT || undefined,
      history,
    };
    return Procedure.findOneAndUpdate(
      {
        procedureId: procedureObj.procedureId,
      },
      _.pickBy(procedureObj),
      {
        upsert: true,
      },
    ).catch((err) => {
      console.log('##ERROR', err);
      console.log('##ERROR', procedureObj.procedureId);
      console.log('##ERROR', procedureObj.title);
    });
  }
  return undefined;
});

Promise.all(procedures)
  .then(() => {
    console.log('finish');

    console.log(procedures.length);

    mongoose.disconnect();
  })
  .catch(err => console.log(err));
*/
