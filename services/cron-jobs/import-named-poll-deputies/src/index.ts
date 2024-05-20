// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { Scraper } from '@democracy-deutschland/scapacra';
// import { NamedPollDeputyScraper } from '@democracy-deutschland/scapacra-bt';
import { transform } from 'camaro';
import { DeputyModel } from '@democracy-deutschland/bundestagio-common';

import {
  NamedPollModel,
  setCronStart,
  setCronSuccess,
  setCronError,
  mongoConnect,
} from '@democracy-deutschland/bundestagio-common';
import axios from 'axios';
import { read, utils } from 'xlsx';

const CRON_NAME = 'NamedPollsDeputies';
const URL_BASE = 'https://www.bundestag.de';

const template = {
  abstimmungen: [
    '//table[@class="table bt-table-data"]/tbody/tr',
    {
      title: 'normalize-space(td[3]//strong/text())',
      date: 'normalize-space(td[1]/p/text())',
      links: ['td[3]//a', '@href'],
    },
  ],
};

const start = async () => {
  const startDate = new Date();
  await setCronStart({ name: CRON_NAME, startDate });
  const deputies = await DeputyModel.find({}, { webId: 1, name: 1, URL: 1, imgURL: 1, party: 1 });
  console.log(deputies);
  try {
    const url = `${URL_BASE}/ajax/filterlist/de/parlament/plenum/abstimmung/liste/462112-462112`;
    const offset = 0;

    do {
      const pageHtml = await fetch(`${url}?offset=${offset}`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }).then((res) => res.text());

      if (pageHtml.includes('Ihr Browser wird verifiziert')) {
        throw new Error('Ihr Browser wird verifiziert');
      }

      const result = await transform(pageHtml, template);

      const cleanedResult = result.abstimmungen.map((item: { title: string; date: string; links: string[] }) => ({
        title: item.title,
        date: item.date,
        links: item.links,
      }));

      for (const abstimmung of cleanedResult) {
        for (const link of abstimmung.links) {
          if (link.endsWith('xlsx')) {
            // XLSX-Datei laden
            const response = await axios.get(`${URL_BASE}${link}`, { responseType: 'arraybuffer' });

            // XLSX-Datei lesen
            const workbook = read(response.data);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // XLSX-Daten in JSON umwandeln
            const jsonData = utils.sheet_to_json(sheet);

            // XLSX-Daten zur Abstimmung hinzufügen
            // {
            //   Wahlperiode: 20,
            //   Sitzungnr: 141,
            //   Abstimmnr: 2,
            //   'Fraktion/Gruppe': 'SPD',
            //   Name: 'Martens',
            //   Vorname: 'Zanda',
            //   ja: 1,
            //   nein: 0,
            //   Enthaltung: 0,
            //   'ungültig': 0,
            //   nichtabgegeben: 0,
            //   Bezeichnung: 'Dr. Zanda Martens'
            // },
            // console.log(jsonData);
            console.log(jsonData);
            const abgeordnete = jsonData.map(
              (item: any): { vote: 'ja' | 'nein' | 'na' | 'enthalten'; name: string } => ({
                name: item.Bezeichnung,
                vote: item.ja === 1 ? 'ja' : item.nein === 1 ? 'nein' : item.Enthaltung === 1 ? 'enthalten' : 'na',
              }),
            );

            abstimmung.votes = abgeordnete;
          }
        }
        // console.log(abstimmung);
      }
    } while (false);

    // console.log('id:', dataPackage.data.id);
    // // Construct Database object
    // const namedPoll: any = { webId: dataPackage.data.id };
    // // Add webId field, Remove id field
    // const deputies = dataPackage.data.votes.deputies.reduce((accumulator: any, deputy: any) => {
    //   // Remove deputies without an id;
    //   if (!deputy.id) {
    //     return accumulator;
    //   }
    //   const dep = deputy;
    //   dep.webId = dep.id;
    //   delete dep.id;
    //   return [...accumulator, dep];
    // }, []);

    // const existingNamedPoll = await NamedPollModel.findOne({
    //   webId: namedPoll.webId,
    // });

    // // votes.deputies
    // if (
    //   !existingNamedPoll ||
    //   !existingNamedPoll.votes ||
    //   !(JSON.stringify(existingNamedPoll.votes.deputies) === JSON.stringify(deputies))
    // ) {
    //   namedPoll['votes.deputies'] = deputies;
    // }

    // // Update/Insert
    // await NamedPollModel.findOneAndUpdate({ webId: namedPoll.webId }, { $set: namedPoll }, { upsert: true });
  } catch (error) {
    await setCronError({ name: CRON_NAME, error: JSON.stringify(error) });
    throw error;
  }
  await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
};

(async () => {
  console.info('START');
  console.info('process.env', process.env.DB_URL);
  if (!process.env.DB_URL) {
    throw new Error('you have to set environment variable: DB_URL');
  }
  await mongoConnect(process.env.DB_URL);
  console.log('procedures', await NamedPollModel.countDocuments({}));
  await start();
  process.exit(0);
})();
