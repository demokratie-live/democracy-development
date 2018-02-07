import mongoose from './config/db';
import Procedure from './models/Procedure';
import _ from 'lodash';
import Scraper from 'dip21-scraper';

const scraper = new Scraper();

function parseDate(input) {
  const parts = input.match(/(\d+)/g);
  // note parts[1]-1
  return new Date(Date.UTC(parts[2], parts[1] - 1, parts[0]));
}
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
  const procedureObj = {
    procedureId: procedureData.vorgangId || undefined,
    type: procedureData.VORGANG.VORGANGSTYP || undefined,
    period: procedureData.VORGANG.WAHLPERIODE || undefined,
    title: procedureData.VORGANG.TITEL || undefined,
    currentStatus: procedureData.VORGANG.AKTUELLER_STAND || undefined,
    signature: procedureData.VORGANG.SIGNATUR || undefined,
    gestOrderNumber: procedureData.VORGANG.GESTA_ORDNUNGSNUMMER || undefined,
    approvalRequired: procedureData.VORGANG.ZUSTIMMUNGSBEDUERFTIGKEIT || undefined,
    euDocNr: procedureData.VORGANG.EU_DOK_NR || undefined,
    abstract: procedureData.VORGANG.ABSTRAKT || undefined,
    promulgation: procedureData.VORGANG.VERKUENDUNG || undefined,
    legalValidity: procedureData.VORGANG.INKRAFTTRETEN || undefined,
    tags: procedureData.VORGANG.SCHLAGWORT || undefined,
    history,
  };
  await Procedure.findOneAndUpdate(
    {
      procedureId: procedureObj.procedureId,
    },
    _.pickBy(procedureObj),
    {
      upsert: true,
    },
  );
};

Promise.all([
  new Promise((resolve) => {
    scraper.scrape({
      selectedPeriod: () => '8',
      selectedOperationTypes: () => [''],
      stackSize: () => 7,
      startLinkProgress: () => {},
      doScrape: () => true,
      updateLinkProgress: () => {},
      stopLinkProgress: () => {},
      startDataProgress: () => {},
      logData: saveProcedure,
      updateDataProgress: () => {},
      logLinks: () => {},
      stopDataProgress: () => {},
      finished: () => {
        resolve();
      },
    });
  }),
]).then(() => mongoose.disconnect());

//
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
