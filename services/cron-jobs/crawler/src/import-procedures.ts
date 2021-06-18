import { mongoConnect, mongoDisconnect } from "./mongoose";
import config from './config';
import { request, gql } from 'graphql-request'
import {
  ProcedureModel,
} from "@democracy-deutschland/bundestagio-common";
import {
  setCronStart,
  setCronSuccess,
  setCronError,
} from "@democracy-deutschland/bundestagio-common";

const { DIP_GRAPHQL_ENDPOINT, IMPORT_PROCEDURES_CHUNK_SIZE, IMPORT_PROCEDURES_CHUNK_ROUNDS, IMPORT_PROCEDURES_FILTER_BEFORE, IMPORT_PROCEDURES_FILTER_AFTER } = config;

let cronStart: Date | null = null;
const CRON_NAME = "Procedures";

const procedureQuery = gql`
query($cursor: String, $offset: Int, $limit: Int, $filter: ProcedureFilter) {
  procedures(cursor: $cursor, offset: $offset, limit: $limit, filter: $filter) {
    edges {
      node {
        abstract
        procedureId
        currentStatus
        type
        period
        title
        date
        subjectGroups
        tags
        history {
          assignment
          initiator
          findSpot
          findSpotUrl
          voteDate: date
          decision {
            page
            tenor
            document
            comment
            type
            foundation
            majority
          }
        }
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
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
`

export default async function importProcedures() {
  const variables = {
    filter: { after: IMPORT_PROCEDURES_FILTER_AFTER, before: IMPORT_PROCEDURES_FILTER_BEFORE },
    limit: IMPORT_PROCEDURES_CHUNK_SIZE, cursor: '*'
  }
  console.log(`Importing ${IMPORT_PROCEDURES_CHUNK_ROUNDS}*${IMPORT_PROCEDURES_CHUNK_SIZE} procedures.`)
  console.log(`Between ${variables.filter.after} and ${variables.filter.before}.`)
  for (const round of Array.from(Array(IMPORT_PROCEDURES_CHUNK_ROUNDS).keys())) {
    console.log(`Round ${round} - Cursor ${variables.cursor}`)
    const { procedures: { edges, pageInfo: { endCursor, hasNextPage } } } = await request(DIP_GRAPHQL_ENDPOINT, procedureQuery, variables );
    await ProcedureModel.bulkWrite(
      edges.map((edge: { node: {  procedureId: string } }) => ({
        updateOne: {
          filter: { procedureId: edge.node.procedureId },
          update: edge.node,
          upsert: true
        }
      }))
    )
    if(!hasNextPage) break
    variables.cursor = endCursor
  }
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
