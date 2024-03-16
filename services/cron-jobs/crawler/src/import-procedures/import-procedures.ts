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
import { germanDateFormat } from './utils';

const config = new Configuration({
  apiKey: `ApiKey ${CONFIG.DIP_API_KEY}`, // Replace #YOUR_API_KEY# with your api key
});
const vorgangApi = new VorgngeApi(config, undefined, axios);
const vorgangspositionenApi = new VorgangspositionenApi(config, undefined, axios);

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
    } = await getVorgaenge({
      cursor: variables.cursor,
      limit: variables.limit,
      filter: { start: new Date(variables.filter.after) },
      offset: 0,
    });

    let procedures: Partial<IProcedure>[] = [];

    for (const edge of edges) {
      log(`${edge.node.aktualisiert} ${edge.node.id} - ${edge.node.titel}`);
      const { node } = edge;
      const vorgangspositionen = await vorgangspositionenApi
        .getVorgangspositionList({
          fVorgang: Number(node.id),
        })
        .then((res) => res.data.documents);

      const importantDocuments = vorgangspositionen
        .filter((v) => v.fundstelle?.dokumentart === 'Drucksache')
        .map<IDocument>((d) => ({
          editor: d.fundstelle.herausgeber,
          number: d.fundstelle.dokumentnummer,
          type: d.fundstelle.drucksachetyp!,
          url: d.fundstelle.pdf_url!,
        }));

      const legalValidity =
        node.inkrafttreten?.map((i) => `${i.datum}${i.erlaeuterung ? ` (${i.erlaeuterung})` : ''}`) || [];

      const history = vorgangspositionen.map<IProcessFlow>((d) => {
        const getFindSpot = (d: Vorgangsposition) => {
          const { fundstelle } = d;
          if (!fundstelle) return;
          const { herausgeber, dokumentart, dokumentnummer } = fundstelle;
          const datum = germanDateFormat.format(new Date(fundstelle.datum));
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

      const procedure: Partial<IProcedure> = {
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
    if (!hasNextPage) {
      break;
    }
    variables.cursor = endCursor;
  }
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
