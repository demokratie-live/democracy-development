import { gql, request } from 'graphql-request';
import { ProcedureModel } from '@democracy-deutschland/bundestagio-common';
import debug from 'debug';
const log = debug('bundestag-io:import-procedures:log');
log.log = console.log.bind(console);

export type ImportProceduresInput = {
  DIP_GRAPHQL_ENDPOINT: string;
  IMPORT_PROCEDURES_START_CURSOR: string;
  IMPORT_PROCEDURES_CHUNK_SIZE: number;
  IMPORT_PROCEDURES_CHUNK_ROUNDS: number;
  IMPORT_PROCEDURES_FILTER_BEFORE: string;
  IMPORT_PROCEDURES_FILTER_AFTER: string;
  IMPORT_PROCEDURES_FILTER_TYPES: string[] | undefined;
};

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
            date
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

export default async function importProcedures(config: ImportProceduresInput): Promise<void> {
  const {
    DIP_GRAPHQL_ENDPOINT,
    IMPORT_PROCEDURES_START_CURSOR,
    IMPORT_PROCEDURES_CHUNK_SIZE,
    IMPORT_PROCEDURES_CHUNK_ROUNDS,
    IMPORT_PROCEDURES_FILTER_BEFORE,
    IMPORT_PROCEDURES_FILTER_AFTER,
    IMPORT_PROCEDURES_FILTER_TYPES,
  } = config;

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = await request<{ procedures: { edges: any; pageInfo: { endCursor: string; hasNextPage: boolean } } }>(
      DIP_GRAPHQL_ENDPOINT,
      procedureQuery,
      variables,
    );

    await ProcedureModel.bulkWrite(
      edges.map((edge: { node: { procedureId: string } }) => ({
        updateOne: {
          filter: { procedureId: edge.node.procedureId },
          update: { $set: edge.node },
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
