import { HTTPCache, RESTDataSource, RequestOptions } from 'apollo-datasource-rest';
import { DataSourceConfig } from 'apollo-datasource';
import { Vorgang, Vorgangsposition, Fundstelle } from '@democracy-deutschland/bt-dip-sdk';
import { ProceduresArgs } from './types';
import { RateLimit } from 'async-sema';
import { RequestInfo, RequestInit, fetch } from 'apollo-server-env';

type PageInfo = {
  hasNextPage: boolean;
  endCursor: string;
};

type VorgangEdge = {
  node: Vorgang;
};

type VorgangConnection = {
  pageInfo: PageInfo;
  totalCount: number;
  edges: VorgangEdge[];
};

export default class DipAPI extends RESTDataSource {
  private ratelimit: () => Promise<void>;
  constructor({ baseURL, limit }: { baseURL: string; limit: number }) {
    super();
    this.baseURL = baseURL;
    this.ratelimit = RateLimit(limit);
  }

  initialize(config: DataSourceConfig<{ DIP_API_KEY: string }>): void {
    this.context = config.context;
    const throttledFetch = async (input: RequestInfo, init?: RequestInit) => {
      await this.ratelimit();
      return fetch(input, init);
    };
    this.httpCache = new HTTPCache(config.cache, throttledFetch);
  }

  willSendRequest(request: RequestOptions) {
    request.headers.set('Authorization', `ApiKey ${this.context.DIP_API_KEY}`);
  }

  getVorgang(vorgangsId: string): Promise<Vorgang> {
    return this.get(`/api/v1/vorgang/${vorgangsId}`);
  }

  async getVorgaenge(args: ProceduresArgs): Promise<VorgangConnection> {
    const { before, after, types: typesFilter } = args.filter || {};
    const filter: { 'f.datum.start'?: Date; 'f.datum.end'?: Date } = {};
    if (after) filter['f.datum.start'] = after;
    if (before) filter['f.datum.end'] = before;
    let hasNextPage = true;
    let totalCount = 0;
    let cursor = args.cursor;
    let documents: Vorgang[] = [];
    while (documents.length < args.limit + args.offset) {
      const res = await this.get(`/api/v1/vorgang`, { ...filter, cursor });
      totalCount = res.numFound;
      documents = documents.concat(res.documents);
      hasNextPage = cursor !== res.cursor;
      cursor = res.cursor;
      if (!hasNextPage) break;
    }
    if (typesFilter && typesFilter.length > 0) {
      documents = documents.filter((document) => typesFilter.includes(document.vorgangstyp));
    }
    return {
      totalCount,
      edges: documents
        .slice(args.offset, args.limit + args.offset)
        .map((document) => ({ node: document })),
      pageInfo: {
        endCursor: cursor,
        hasNextPage,
      },
    };
  }

  async getVorgangsVorgangspositionen(vorgangsId: string): Promise<Array<Vorgangsposition>> {
    const { documents: vorgangspositionen } = await this.get(`/api/v1/vorgangsposition`, {
      'f.vorgang': vorgangsId,
    });
    return vorgangspositionen;
  }

  async getVorgangsDrucksachen(vorgangsId: string): Promise<Array<Fundstelle>> {
    const vorgangspositionen = await this.getVorgangsVorgangspositionen(vorgangsId);
    return vorgangspositionen
      .filter((vp: Vorgangsposition) => vp.dokumentart === 'Drucksache')
      .map((vp: Vorgangsposition) => vp.fundstelle as Fundstelle)
      .filter(Boolean);
  }

  async getVorgangsPlenarProtokolle(vorgangsId: string): Promise<Array<Fundstelle>> {
    const vorgangspositionen = await this.getVorgangsVorgangspositionen(vorgangsId);
    return vorgangspositionen
      .filter((vp: Vorgangsposition) => vp.dokumentart === 'Plenarprotokoll')
      .map((vp: Vorgangsposition) => vp.fundstelle as Fundstelle)
      .filter(Boolean);
  }
}
