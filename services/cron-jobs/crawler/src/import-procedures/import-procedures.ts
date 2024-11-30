import { ProcedureModel } from '@democracy-deutschland/bundestagio-common';
import debug from 'debug';
import { CONFIG } from '../config';
import {
  Configuration,
  Vorgang,
  VorgngeApi,
  VorgangspositionenApi,
  Vorgangsposition,
} from '@democracy-deutschland/bt-dip-sdk';
const log = debug('bundestag-io:import-procedures:log');
log.log = console.log.bind(console);
import axios from '../axios';
import { IProcedure } from '@democracy-deutschland/bundestagio-common/dist/models/Procedure/schema';
import { IDocument } from '@democracy-deutschland/bundestagio-common/dist/models/Procedure/Procedure/Document';
import { IProcessFlow } from '@democracy-deutschland/bundestagio-common/dist/models/Procedure/Procedure/ProcessFlow';
import { formatGermanDate } from './utils';

const createConfiguration = (apiKey: string) => {
  return new Configuration({
    apiKey: `ApiKey ${apiKey}`,
  });
};

const config = createConfiguration(CONFIG.DIP_API_KEY);

const createApiInstances = (config: Configuration) => {
  const vorgangApi = new VorgngeApi(config, undefined, axios);
  const vorgangspositionenApi = new VorgangspositionenApi(config, undefined, axios);
  return { vorgangApi, vorgangspositionenApi };
};

const { vorgangApi, vorgangspositionenApi } = createApiInstances(config);

const logImportDetails = (
  rounds: number,
  size: number,
  filter: { after: string; before: string; types?: string[] },
) => {
  log(`
      --------------------------------------
      Importing ${rounds}*${size} procedures.
      Between ${filter.after} and ${filter.before}.
      Filter: ${filter.types && filter.types.length > 0 ? `[types: ${filter.types.join(', ')}]` : 'none'}
      --------------------------------------
  `);
};

const createHistory = (vorgangspositionen: Vorgangsposition[]): IProcessFlow[] => {
  return vorgangspositionen.map<IProcessFlow>((d) => {
    const getFindSpot = (d: Vorgangsposition) => {
      const { fundstelle } = d;
      if (!fundstelle) return;
      const { herausgeber, dokumentart, dokumentnummer } = fundstelle;
      const datum = formatGermanDate(new Date(fundstelle.datum));
      const result = `${datum} - ${herausgeber}-${dokumentart} ${dokumentnummer}`;
      const { anfangsseite, endseite, anfangsquadrant, endquadrant } = fundstelle;
      if (![anfangsseite, endseite, anfangsquadrant, endquadrant].every(Boolean)) return result;
      return `${result}, S. ${anfangsseite}${anfangsquadrant} - ${endseite}${endquadrant}`;
    };

    const getDecision = (d: Vorgangsposition) => {
      const { beschlussfassung } = d;
      if (!beschlussfassung) return [];
      return beschlussfassung.map((b) => ({
        page: b.seite,
        tenor: b.beschlusstenor,
        document: b.dokumentnummer,
        type: b.abstimmungsart,
        comment: b.abstimm_ergebnis_bemerkung,
        foundation: b.grundlage,
        majority: b.mehrheit,
      }));
    };

    return {
      assignment: d.fundstelle.herausgeber,
      initiator:
        d.fundstelle.urheber.length > 0
          ? `${d.vorgangsposition}, Urheber : ${d.fundstelle.urheber.join(', ')}`
          : d.vorgangsposition,
      findSpot: getFindSpot(d),
      findSpotUrl: d.fundstelle.pdf_url,
      decision: getDecision(d),
      abstract: d.abstract,
      date: new Date(d.fundstelle.datum),
    };
  });
};

const createImportantDocuments = (vorgangspositionen: Vorgangsposition[]): IDocument[] => {
  return vorgangspositionen
    .filter((v) => v.fundstelle?.dokumentart === 'Drucksache')
    .map<IDocument>((d) => ({
      editor: d.fundstelle.herausgeber,
      number: d.fundstelle.dokumentnummer,
      type: d.fundstelle.drucksachetyp!,
      url: d.fundstelle.pdf_url!,
    }));
};

const createLegalValidity = (inkrafttreten: { datum: string; erlaeuterung?: string }[]): string[] => {
  return inkrafttreten.map((i) => `${i.datum}${i.erlaeuterung ? ` (${i.erlaeuterung})` : ''}`);
};

const createProcedure = (node: Vorgang, vorgangspositionen: Vorgangsposition[]): Partial<IProcedure> => {
  const importantDocuments = createImportantDocuments(vorgangspositionen);

  const legalValidity = createLegalValidity(node.inkrafttreten || []);

  const history = createHistory(vorgangspositionen);

  return {
    ...node,
    procedureId: node.id,
    type: node.vorgangstyp,
    tags: node.deskriptor?.map((d) => d.name) || [],
    title: node.titel,
    currentStatus: node.beratungsstand,
    period: node.wahlperiode,
    subjectGroups: node.sachgebiet,
    importantDocuments,
    gestOrderNumber: node.gesta,
    legalValidity,
    history,
  };
};

const fetchVorgangspositionen = async (vorgangspositionenApi: VorgangspositionenApi, nodeId: number) => {
  return vorgangspositionenApi
    .getVorgangspositionList({
      fVorgang: nodeId,
    })
    .then((res) => res.data.documents);
};

const processProcedures = async (edges: { node: Vorgang }[], vorgangspositionenApi: VorgangspositionenApi) => {
  let procedures: Partial<IProcedure>[] = [];

  for (const edge of edges) {
    log(`${edge.node.aktualisiert} ${edge.node.id} - ${edge.node.titel}`);
    const { node } = edge;
    const vorgangspositionen = await fetchVorgangspositionen(vorgangspositionenApi, Number(node.id));
    const procedure = createProcedure(node, vorgangspositionen);
    procedures = [...procedures, procedure];
  }

  await ProcedureModel.bulkWrite(
    procedures.map((node) => ({
      updateOne: {
        filter: { procedureId: node.procedureId },
        update: { $set: node },
        upsert: true,
      },
    })),
  );
};

const validateVariables = (variables: { limit: number }) => {
  if (variables.limit % 50 !== 0) {
    throw new Error(
      'DIP has a fixed page size of 50. Make sure your limit is a multiple of 50 to avoid inconsistencies with cursor based pagination.',
    );
  }
};

const logRoundDetails = (round: number, cursor: string) => {
  log(`Round ${round} - Cursor ${cursor}`);
};

const handleImportRounds = async (
  rounds: number,
  variables: { cursor: string; limit: number; filter: ReturnType<typeof createProcedureFilter> },
  vorgangspositionenApi: VorgangspositionenApi,
) => {
  for (const round of Array.from(Array(rounds).keys())) {
    logRoundDetails(round, variables.cursor);

    const {
      edges,
      pageInfo: { endCursor, hasNextPage },
    } = await getVorgaenge({
      cursor: variables.cursor,
      limit: variables.limit,
      filter: {
        start: new Date(variables.filter.after),
        types: ['Antrag', 'Gesetzgebung'],
      },
      offset: 0,
    });

    await processProcedures(edges, vorgangspositionenApi);

    if (!hasNextPage) {
      break;
    }
    variables.cursor = endCursor;
  }
};

const createProcedureFilter = (after: string, before: string, types?: string[]) => ({
  after,
  before,
  types,
});

const createVariables = (
  startCursor: string,
  chunkSize: number,
  filterAfter: string,
  filterBefore: string,
  filterTypes?: string[],
) => ({
  cursor: startCursor,
  filter: createProcedureFilter(filterAfter, filterBefore, filterTypes),
  limit: chunkSize,
});

export default async function importProcedures(config: typeof CONFIG): Promise<void> {
  const {
    IMPORT_PROCEDURES_START_CURSOR,
    IMPORT_PROCEDURES_CHUNK_SIZE,
    IMPORT_PROCEDURES_CHUNK_ROUNDS,
    IMPORT_PROCEDURES_FILTER_BEFORE,
    IMPORT_PROCEDURES_FILTER_AFTER,
    IMPORT_PROCEDURES_FILTER_TYPES,
  } = config;

  const variables = createVariables(
    IMPORT_PROCEDURES_START_CURSOR,
    IMPORT_PROCEDURES_CHUNK_SIZE,
    IMPORT_PROCEDURES_FILTER_AFTER,
    IMPORT_PROCEDURES_FILTER_BEFORE,
    IMPORT_PROCEDURES_FILTER_TYPES,
  );

  logImportDetails(IMPORT_PROCEDURES_CHUNK_ROUNDS, IMPORT_PROCEDURES_CHUNK_SIZE, variables.filter);

  validateVariables(variables);

  await handleImportRounds(IMPORT_PROCEDURES_CHUNK_ROUNDS, variables, vorgangspositionenApi);
}

export type ProcedureFilter = {
  start?: Date;
  end?: Date;
  types?: string[];
};

export type ProceduresArgs = {
  cursor: string;
  limit: number;
  offset: number;
  filter?: ProcedureFilter;
};

const getVorgaenge = async (args: ProceduresArgs) => {
  const { start, end, types: typesFilter } = args.filter || {};
  const filter: { 'f.datum.start'?: Date; 'f.datum.end'?: Date } = {};
  if (start) filter['f.datum.start'] = start;
  if (end) filter['f.datum.end'] = end;
  let hasNextPage = true;
  let totalCount = 0;
  let cursor = args.cursor;
  let documents: Vorgang[] = [];
  while (documents.length < args.limit + args.offset) {
    console.log({
      cursor,
      fAktualisiertStart: args.filter?.start?.toISOString(),
      fAktualisiertEnd: args.filter?.end?.toISOString(),
    });
    const { data } = await vorgangApi.getVorgangList({
      cursor,
      fAktualisiertStart: args.filter?.start?.toISOString(),
      fAktualisiertEnd: args.filter?.end?.toISOString(),
      fVorgangstyp: args.filter?.types,
    });
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
