import axios from 'axios';
import { PlenaryMinuteModel, mongoConnect } from '@democracy-deutschland/bundestagio-common';

import { DipPlenarprotokoll, DipPlenarprotokollResponse, PlenaryMinutesItem } from './types';

const DIP_URL = 'https://search.dip.bundestag.de/api/v1/plenarprotokoll';

const periods = [19, 20, 21];

const fetchPage = async (apiKey: string, period: number, cursor?: string) => {
  try {
    const { data } = await axios.get<DipPlenarprotokollResponse>(DIP_URL, {
      headers: { Authorization: `ApiKey ${apiKey}` },
      params: { 'f.wahlperiode': period, 'f.zuordnung': 'BT', cursor },
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`DIP request for period ${period} failed: ${error.response?.status ?? error.code} ${error.message}`);
    }
    throw error;
  }
};

const fetchPeriod = async (apiKey: string, period: number) => {
  const documents: DipPlenarprotokoll[] = [];
  let cursor: string | undefined;
  let numFound = 0;
  for (;;) {
    const page = await fetchPage(apiKey, period, cursor);
    numFound = page.numFound;
    documents.push(...page.documents);
    // DIP returns the same cursor again once the last page is reached
    if (page.documents.length === 0 || page.cursor === cursor) break;
    cursor = page.cursor;
  }
  if (numFound === 0 || documents.length === 0) {
    throw new Error(`DIP returned no plenary minutes for period ${period}`);
  }
  return documents;
};

const toItem = (doc: DipPlenarprotokoll): PlenaryMinutesItem | null => {
  // future sessions are listed before their protocol is published
  const xml = doc.fundstelle.xml_url;
  if (!xml) return null;

  const match = /^(\d+)\/(\d+)$/.exec(doc.dokumentnummer);
  if (!match) {
    throw new Error(`unexpected dokumentnummer "${doc.dokumentnummer}" (id ${doc.id})`);
  }
  return {
    period: parseInt(match[1]),
    meeting: parseInt(match[2]),
    date: new Date(`${doc.datum}T00:00:00Z`),
    xml,
  };
};

const start = async (apiKey: string, period: number) => {
  console.log('start import for period', period);
  const documents = await fetchPeriod(apiKey, period);
  const data = documents.map(toItem).filter((item): item is PlenaryMinutesItem => item !== null);
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
  console.log(`found for period ${period}: ${documents.length}, imported: ${data.length}`);
};

(async () => {
  console.info('START');
  console.info('process.env', process.env.DB_URL);
  if (!process.env.DB_URL) {
    throw new Error('you have to set environment variable: DB_URL');
  }
  const apiKey = process.env.DIP_API_KEY;
  if (!apiKey) {
    throw new Error('you have to set environment variable: DIP_API_KEY');
  }
  await mongoConnect(process.env.DB_URL);
  console.log('PlenaryMinutes', await PlenaryMinuteModel.countDocuments({}));
  for (const period of periods) {
    await start(apiKey, period);
  }
  process.exit(0);
})();
