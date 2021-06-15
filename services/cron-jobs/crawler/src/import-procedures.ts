import { mongoConnect, mongoDisconnect } from "./mongoose";
import { DIP_GRAPHQL_ENDPOINT, IMPORT_PROCEDURES_LIMIT, IMPORT_PROCEDURES_FILTER_BEFORE, IMPORT_PROCEDURES_FILTER_AFTER } from './config';
import { request, gql } from 'graphql-request'
import {
  ProcedureModel,
} from "@democracy-deutschland/bundestagio-common";
import {
  setCronStart,
  setCronSuccess,
  setCronError,
} from "@democracy-deutschland/bundestagio-common";

let cronStart: Date | null = null;
const CRON_NAME = "Procedures";

const procedureQuery = gql`
query($limit: Int, $filter: ProcedureFilter) {
  procedures(limit: $limit, filter: $filter) {
    abstract
    procedureId
    currentStatus
    type
    period
    title
    date
    subjectGroups
    tags
    importantDocuments {
      editor
      number
      type
      url
    }
    plenums {
      editor
      number
      link
      pages
    }
  }
}
`

export default async function importProcedures() {
  const variables = {
    filter: { after: IMPORT_PROCEDURES_FILTER_AFTER, before: IMPORT_PROCEDURES_FILTER_BEFORE },
    limit: IMPORT_PROCEDURES_LIMIT
  }
  const { procedures } = await request(DIP_GRAPHQL_ENDPOINT, procedureQuery, variables );
  await Promise.all(
    procedures.map((p: { procedureId: string }) => {
      return ProcedureModel.findOneAndUpdate({ procedureId: p.procedureId }, p, { upsert: true })
    })
  )
}


(async () => {
  try {
    cronStart = new Date();
    // await setCronStart({ name: CRON_NAME, startDate: cronStart });
    await mongoConnect();
    await importProcedures()
    // await setCronSuccess({ name: CRON_NAME, successStartDate: cronStart! });
    process.exit(0);
  } catch(err) {
    console.error(err)
    // await setCronError({ name: CRON_NAME, error: JSON.stringify(err) });
    process.exit(1)
  } finally {
    mongoDisconnect()
  }
})();
