import { gql, request } from 'graphql-request';
import { mongoConnect, mongoDisconnect } from './mongoose';
import { ProcedureModel } from '@democracy-deutschland/bundestagio-common';
import config from './config';
import debug from 'debug';
const [log, error] = [debug('bundestag-io:import-procedures:log'), debug('bundestag-io:import-procedures:error')];
log.log = console.log.bind(console);

const {
  DIP_GRAPHQL_ENDPOINT,
  IMPORT_PROCEDURES_START_CURSOR,
  IMPORT_PROCEDURES_CHUNK_SIZE,
  IMPORT_PROCEDURES_CHUNK_ROUNDS,
  IMPORT_PROCEDURES_FILTER_BEFORE,
  IMPORT_PROCEDURES_FILTER_AFTER,
  IMPORT_PROCEDURES_FILTER_TYPES,
} = config;

const procedureQuery = gql`
  query ($cursor: String, $offset: Int, $limit: Int, $filter: ProcedureFilter) {
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
            abstract
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
`;

export default async function importProcedures(): Promise<void> {
  const variables = {
    cursor: IMPORT_PROCEDURES_START_CURSOR,
    filter: {
      after: IMPORT_PROCEDURES_FILTER_AFTER,
      before: IMPORT_PROCEDURES_FILTER_BEFORE,
      types: IMPORT_PROCEDURES_FILTER_TYPES,
    },
    limit: IMPORT_PROCEDURES_CHUNK_SIZE,
  };
  log(`
      --------------------------------------
      Importing ${IMPORT_PROCEDURES_CHUNK_ROUNDS}*${IMPORT_PROCEDURES_CHUNK_SIZE} procedures.
      Between ${variables.filter.after} and ${variables.filter.before}.
      Filter: ${
        variables.filter.types && variables.filter.types.length > 0
          ? `[types: ${variables.filter.types.join(', ')}]`
          : 'none'
      }
      --------------------------------------
  `);
  for (const round of Array.from(Array(IMPORT_PROCEDURES_CHUNK_ROUNDS).keys())) {
    log(`Round ${round} - Cursor ${variables.cursor}`);
    const {
      procedures: {
        edges,
        pageInfo: { endCursor, hasNextPage },
      },
    } = await request(DIP_GRAPHQL_ENDPOINT, procedureQuery, variables);

    await ProcedureModel.bulkWrite(
      edges.map((edge: { node: { procedureId: string } }) => ({
        updateOne: {
          filter: { procedureId: edge.node.procedureId },
          update: edge.node,
          upsert: true,
        },
      })),
    );
    if (!hasNextPage) {
      break;
    }
    variables.cursor = endCursor;
  }
}

(async () => {
  try {
    await mongoConnect();
    await importProcedures();
  } catch (err) {
    error(err);
    throw err;
  } finally {
    mongoDisconnect();
  }
})();
