import axios from "axios";
import cheerio from "cheerio";
import moment from "moment";
import { PlenaryMinuteModel } from "@democracy-deutschland/bundestagio-common";

import mongoConnect from "./mongoose";
import { MetaData, PlenaryMinutesItem } from "./types";

const AxiosInstance = axios.create();

const getMeta = (meta: Cheerio): MetaData => {
  let hits: number;
  let nextOffset: number;
  let staticItemCount: number;
  const dataHits = meta.attr("data-hits");
  const dataNextOffset = meta.attr("data-nextoffset");
  const dataStaticItemCount = meta.attr("data-staticitemcount");
  if (dataHits && dataNextOffset && dataStaticItemCount) {
    hits = parseInt(dataHits);
    nextOffset = parseInt(dataNextOffset);
    staticItemCount = parseInt(dataStaticItemCount);
  } else {
    throw new Error("meta data not valid");
  }

  return {
    hits,
    nextOffset,
    staticItemCount,
  };
};

const getPlenaryMinutes = (plenaryMinutes: Cheerio): PlenaryMinutesItem[] => {
  const plenaryMinutesItems: PlenaryMinutesItem[] = [];
  plenaryMinutes.each((i, elem) => {
    // Parse Title
    const title = cheerio(elem).find("strong").text().trim();
    const regex = /Plenarprotokoll der (?<meeting>\d{1,3}).*?dem (?<date>.*?)$/gi;
    const match = regex.exec(title)!.groups as {
      meeting: string;
      date: string;
    };
    var m = moment(match.date, "DD MMMM YYYY", "de");

    // Parse link
    const xmlLink = cheerio(elem).find(".bt-link-dokument").attr("href");

    const plenaryMinutesItem: PlenaryMinutesItem = {
      date: m.toDate(),
      meeting: parseInt(match.meeting),
      xml: `https://www.bundestag.de${xmlLink}`,
    };
    plenaryMinutesItems.push(plenaryMinutesItem);
  });

  return plenaryMinutesItems;
};

const parsePage = async (url: string) => {
  return await AxiosInstance.get(url).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);
    const meta: Cheerio = $(".meta-slider");
    const plenaryMinutesTable: Cheerio = $(".bt-table-data > tbody > tr");
    const metaData = getMeta(meta);
    const plenaryMinutes = getPlenaryMinutes(plenaryMinutesTable);
    return {
      meta: metaData,
      plenaryMinutes,
    };
  });
};

const getUrl = (offset: number) =>
  `https://www.bundestag.de/ajax/filterlist/de/services/opendata/543410-543410/h_49f0d94cb26682ff1e9428b6de471a5b?offset=${offset}`;

const start = async () => {
  let url: string | false = getUrl(0);
  const data: PlenaryMinutesItem[] = [];
  do {
    const { meta, plenaryMinutes } = await parsePage(url);
    data.push(...plenaryMinutes);
    if (meta.nextOffset < meta.hits) {
      url = getUrl(meta.nextOffset);
    } else {
      url = false;
    }
  } while (url);
  await PlenaryMinuteModel.collection.bulkWrite(
    data.map((item) => ({
      updateOne: {
        filter: { meeting: item.meeting },
        update: {
          $set: item,
        },
        upsert: true,
      },
    }))
  );
  console.log("found: ", data.length);
};

(async () => {
  console.info("START");
  console.info("process.env", process.env.DB_URL);
  if (!process.env.DB_URL) {
    throw new Error("you have to set environment variable: DB_URL");
  }
  await mongoConnect();
  console.log("PlenaryMinutes", await PlenaryMinuteModel.countDocuments({}));
  await start().catch(() => {
    process.exit(1);
  });
  process.exit(0);
})();
