import { PlenaryMinuteModel, mongoConnect } from '@democracy-deutschland/bundestagio-common';

import { getConfig } from './config';
import { fetchPlenarprotokolle } from './dip';
import { DipPlenarprotokoll, PlenaryMinutesItem } from './types';

const periods = [19, 20, 21];

const toItems = (doc: DipPlenarprotokoll, period: number): PlenaryMinutesItem[] => {
  // future sessions are listed before their protocol is published
  const xml = doc.fundstelle.xml_url;
  if (!xml) return [];

  const groups = /^(?<period>\d+)\/(?<meeting>\d+)$/.exec(doc.dokumentnummer)?.groups;
  if (!groups) {
    throw new Error(`unexpected dokumentnummer "${doc.dokumentnummer}" (id ${doc.id})`);
  }
  if (parseInt(groups.period) !== period) {
    console.warn(`dokumentnummer ${doc.dokumentnummer} does not belong to period ${period}`);
  }
  return [
    {
      period: parseInt(groups.period),
      meeting: parseInt(groups.meeting),
      date: new Date(`${doc.datum}T00:00:00Z`),
      xml,
    },
  ];
};

const importPeriod = async (apiKey: string, period: number) => {
  console.log('start import for period', period);
  const documents = await fetchPlenarprotokolle(apiKey, period);
  const data = documents.flatMap((doc) => toItems(doc, period));
  if (data.length > 0) {
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
  }
  console.log(`found for period ${period}: ${documents.length}, imported: ${data.length}`);
};

const main = async () => {
  console.info('START');
  const config = getConfig();
  await mongoConnect(config.DB_URL);
  console.log('PlenaryMinutes', await PlenaryMinuteModel.countDocuments({}));
  for (const period of periods) {
    await importPeriod(config.DIP_API_KEY, period);
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
