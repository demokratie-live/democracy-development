import mongoConnect from "./mongoose";
import MeiliSearch, { Index } from "meilisearch";

import {
  ProcedureModel,
  getCron,
  IProcedure,
} from "@democracy-deutschland/democracy-common";

const CRON_NAME = "Meilisearch";

const client = new MeiliSearch({
  host: process.env.MEILI_SEARCH_HOST!,
  apiKey: process.env.MEILI_SEARCH_SECRET!,
});

const start = async () => {
  let index: Index<IProcedure>;
  const cron = await getCron({ name: CRON_NAME });
  console.log(cron);
  const indexes = await client.listIndexes();
  console.log(indexes);
  if (!indexes.some((index) => index.uid === "procedures")) {
    index = await client.createIndex("procedures", {
      primaryKey: "procedureId",
    });
  } else {
    index = client.getIndex("procedures");
  }
  const sumProcedures = await ProcedureModel.countDocuments();
  console.log(sumProcedures);
  const pageSize = 50;
  console.log(`start indexing`);
  for (let i = 0; i < sumProcedures; i += pageSize) {
    const procedures = await ProcedureModel.find().limit(pageSize).skip(i);
    await index.addDocuments(procedures as any);
    console.log(`indexed ${i} - ${i + pageSize}`);
  }
  console.log(`finish indexing`);
};

(async () => {
  console.info("START");
  console.info("process.env", process.env.DB_URL);
  if (!process.env.DB_URL) {
    throw new Error("you have to set environment variable: DB_URL");
  }
  await mongoConnect();
  console.log("procedures", await ProcedureModel.countDocuments({}));
  await start().catch((e) => {
    console.log(e);
    process.exit(1);
  });
  process.exit(0);
})();
