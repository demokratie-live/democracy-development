import axios, { AxiosResponse } from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';
import { PlenaryMinuteModel, mongoConnect } from '@democracy-deutschland/bundestagio-common';

import { MetaData, PlenaryMinutesItem } from './types';
import { Configuration, PlenarprotokolleApi, PlenarprotokollListResponse } from '@democracy-deutschland/bt-dip-sdk';
import { CONFIG } from './config';

const config = new Configuration({
  apiKey: `ApiKey ${CONFIG.DIP_API_KEY}`, // Replace #YOUR_API_KEY# with your api key
});
const api = new PlenarprotokolleApi(config, undefined, axios);

const AxiosInstance = axios.create();

const getMeta = (meta: cheerio.Cheerio): MetaData => {
  let hits: number;
  let nextOffset: number;
  let staticItemCount: number;
  const dataHits = meta.attr('data-hits');
  const dataNextOffset = meta.attr('data-nextoffset');
  const dataStaticItemCount = meta.attr('data-staticitemcount');
  if (dataHits && dataNextOffset && dataStaticItemCount) {
    hits = parseInt(dataHits);
    nextOffset = parseInt(dataNextOffset);
    staticItemCount = parseInt(dataStaticItemCount);
  } else {
    throw new Error('meta data not valid');
  }

  return {
    hits,
    nextOffset,
    staticItemCount,
  };
};

const getPlenaryMinutes = (plenaryMinutes: cheerio.Cheerio, period: number): PlenaryMinutesItem[] => {
  const plenaryMinutesItems: PlenaryMinutesItem[] = [];
  plenaryMinutes.each((i, elem) => {
    // Parse Title
    const title = cheerio(elem).find('strong').text().trim();
    const regex = /Plenarprotokoll der (?<meeting>\d{1,3}).*?dem (?<date>.*?)$/gi;
    try {
      const match = regex.exec(title)?.groups as {
        meeting: string;
        date: string;
      };
      const m = moment(match.date, 'DD MMMM YYYY', 'de');

      // Parse link
      const xmlLink = cheerio(elem).find('.bt-link-dokument').attr('href');

      const plenaryMinutesItem: PlenaryMinutesItem = {
        date: m.toDate(),
        period,
        meeting: parseInt(match.meeting),
        xml: `https://www.bundestag.de${xmlLink}`,
      };
      plenaryMinutesItems.push(plenaryMinutesItem);
    } catch (error) {
      console.log('error', error, title);
    }
  });

  return plenaryMinutesItems;
};

const parsePage = async (url: string, period: number) => {
  console.log('parsePage', url);
  return await AxiosInstance.get(url)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const meta: cheerio.Cheerio = $('.meta-slider');
      const plenaryMinutesTable: cheerio.Cheerio = $('.bt-table-data > tbody > tr');
      const metaData = getMeta(meta);
      const plenaryMinutes = getPlenaryMinutes(plenaryMinutesTable, period);
      return {
        meta: metaData,
        plenaryMinutes,
      };
    })
    .catch((error) => {
      console.error('error', error);
      throw error;
    });
};

const getUrl = ({ offset, id }: { offset: number; id: string }) =>
  `https://www.bundestag.de/ajax/filterlist/de/services/opendata/${id}?offset=${offset}`;

const periods = [
  { period: 19, id: '543410-543410' },
  { period: 20, id: '866354-866354' },
];

const start = async () => {
  const cursor: string | undefined = undefined;
  const plenarprotokollItems: PlenaryMinutesItem[] = [];
  let hasNextPage = true;
  do {
    const { data } = await api.getPlenarprotokollList({ cursor });
    for (const plenarprotokoll of data.documents) {
      const regex = /Protokoll der (?<meeting>\d+)\. Sitzung/gi;
      const match = regex.exec(plenarprotokoll.titel);
      const meetingNumber = match?.groups?.meeting;
      plenarprotokollItems.push({
        date: new Date(plenarprotokoll.datum),
        period: plenarprotokoll.wahlperiode,
        meeting: meetingNumber,
        xml: plenarprotokoll.fundstelle.xml_url,
      });
    }
    hasNextPage = cursor !== data.cursor;
  } while (hasNextPage);
  await PlenaryMinuteModel.collection.bulkWrite(
    plenarprotokollItems.map((item) => ({
      updateOne: {
        filter: { meeting: item.meeting, period: item.period },
        update: {
          $set: item,
        },
        upsert: true,
      },
    })),
  );
};

(async () => {
  console.info('START');
  console.info('process.env', CONFIG.DB_URL);
  if (!CONFIG.DB_URL) {
    throw new Error('you have to set environment variable: DB_URL');
  }
  await mongoConnect(CONFIG.DB_URL);
  console.log('PlenaryMinutes', await PlenaryMinuteModel.countDocuments({}));
  await start();
  process.exit(0);
})();
