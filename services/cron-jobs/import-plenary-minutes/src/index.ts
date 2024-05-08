import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';
import { PlenaryMinuteModel, mongoConnect } from '@democracy-deutschland/bundestagio-common';

import { MetaData, PlenaryMinutesItem } from './types';

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
    const regex = /protokoll der (?<meeting>\d{1,3}).*?dem (?<date>.*?)$/gi;
    const match = regex.exec(title)!.groups as {
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
  });

  return plenaryMinutesItems;
};

const parsePage = async (url: string, period: number) => {
  return await AxiosInstance.get(url).then((response) => {
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
  });
};

const getUrl = ({ offset, id }: { offset: number; id: string }) =>
  `https://www.bundestag.de/ajax/filterlist/de/services/opendata/${id}?offset=${offset}`;

const periods = [
  { period: 19, id: '543410-543410' },
  { period: 20, id: '866354-866354' },
];

const start = async (period: number) => {
  const periodId = periods.find((p) => p.period === period)!.id;

  let url: string | false = getUrl({ offset: 0, id: periodId });
  const data: PlenaryMinutesItem[] = [];
  do {
    const { meta, plenaryMinutes } = await parsePage(url, period);
    data.push(...plenaryMinutes);
    if (meta.nextOffset < meta.hits) {
      url = getUrl({ offset: meta.nextOffset, id: periodId });
    } else {
      url = false;
    }
  } while (url);
  await PlenaryMinuteModel.collection.bulkWrite(
    data.map((item) => ({
      updateOne: {
        filter: { meeting: item.meeting, period: item.period },
        update: {
          $set: item,
        },
        upsert: true,
      },
    })),
  );
  console.log(`found for period ${period}: `, data.length);
};

(async () => {
  console.info('START');
  console.info('process.env', process.env.DB_URL);
  if (!process.env.DB_URL) {
    throw new Error('you have to set environment variable: DB_URL');
  }
  await mongoConnect(process.env.DB_URL);
  console.log('PlenaryMinutes', await PlenaryMinuteModel.countDocuments({}));
  await start(19);
  await start(20);
  process.exit(0);
})();
