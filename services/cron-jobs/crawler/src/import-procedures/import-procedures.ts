import { ProcedureModel } from '@democracy-deutschland/bundestagio-common';
import debug from 'debug';
import { CONFIG } from '../config';
import { Configuration, DipApi, Vorgang } from '@democracy-deutschland/bt-dip-sdk';
const log = debug('bundestag-io:import-procedures:log');
log.log = console.log.bind(console);
import axios from '../axios';

const config = new Configuration({
  apiKey: `ApiKey ${CONFIG.DIP_API_KEY}`, // Replace #YOUR_API_KEY# with your api key
});
const dipAPI = new DipApi(config, undefined, axios);

export default async function importProcedures(config: typeof CONFIG): Promise<void> {
  const {
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

  if (variables.limit % 50 !== 0)
    throw new Error(
      'DIP has a fixed page size of 50. Make sure your limt is a multiple of 50 to avoid inconsistencies with cursor based pagination.',
    );

  for (const round of Array.from(Array(IMPORT_PROCEDURES_CHUNK_ROUNDS).keys())) {
    log(`Round ${round} - Cursor ${variables.cursor}`);

    const {
      edges,
      pageInfo: { endCursor, hasNextPage },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = await getVorgaenge({
      cursor: variables.cursor,
      limit: variables.limit,
      filter: { after: new Date(variables.filter.after) },
      offset: 0,
    });

    const procedures = edges.map(({ node }) => ({ ...node, procedureId: node.id }));

    await ProcedureModel.bulkWrite(
      procedures.map((node) => ({
        updateOne: {
          filter: { procedureId: node.procedureId },
          update: { $set: node },
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

export type ProcedureFilter = {
  before?: Date;
  after?: Date;
  types?: string[];
};

export type ProceduresArgs = {
  cursor: string;
  limit: number;
  offset: number;
  filter?: ProcedureFilter;
};

const getVorgaenge = async (args: ProceduresArgs) => {
  const { before, after, types: typesFilter } = args.filter || {};
  const filter: { 'f.datum.start'?: Date; 'f.datum.end'?: Date } = {};
  if (after) filter['f.datum.start'] = after;
  if (before) filter['f.datum.end'] = before;
  let hasNextPage = true;
  let totalCount = 0;
  let cursor = args.cursor;
  let documents: Vorgang[] = [];
  while (documents.length < args.limit + args.offset) {
    const { data } = await dipAPI.getVorgaenge({
      cursor,
      fDatumStart: args.filter?.before?.toISOString().slice(0, 10),
      fDatumEnd: args.filter?.after?.toISOString().slice(0, 10),
    });
    // const res = await this.get(`/api/v1/vorgang`, { ...filter, cursor });
    totalCount = Number(data.numFound);
    documents = documents.concat(data.documents!);
    hasNextPage = cursor !== data.cursor;
    cursor = data.cursor!;
    if (!hasNextPage) break;
  }
  if (typesFilter && typesFilter.length > 0) {
    documents = documents.filter((document) => typesFilter.includes(document.vorgangstyp));
  }
  return {
    totalCount,
    edges: documents.slice(args.offset, args.limit + args.offset).map((document) => ({ node: document })),
    pageInfo: {
      endCursor: cursor,
      hasNextPage,
    },
  };
};
