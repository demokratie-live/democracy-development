import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest'
import { Vorgang, Drucksache, Plenarprotokoll, Vorgangsposition } from './dip-types'
import { ProceduresArgs } from './types'

type PageInfo = {
  hasNextPage: boolean
  endCursor: string
}

type VorgangEdge = {
  node: Vorgang
}

type VorgangConnection = {
  pageInfo: PageInfo
  totalCount: number
  edges: VorgangEdge[]
}

export default class DipAPI extends RESTDataSource {
  constructor({ baseURL }: { baseURL: string}) {
    super();
    this.baseURL = baseURL
  }

  willSendRequest(request: RequestOptions) {
    request.headers.set('Authorization', `ApiKey ${this.context.DIP_API_KEY}`);
  }

  getVorgang(vorgangsId: string): Promise<Vorgang> {
    return this.get(`/api/v1/vorgang/${vorgangsId}`);
  }

  async getVorgaenge(args: ProceduresArgs): Promise<VorgangConnection> {
    const { before, after } = args.filter || {}
    const filter: { 'f.datum.start'?: Date, 'f.datum.end'?: Date } = {}
    if(after) filter['f.datum.start'] = after
    if(before) filter['f.datum.end'] = before
    let hasNextPage = true
    let totalCount = 0
    let cursor = args.cursor
    let documents: Vorgang[] = []
    while (documents.length < args.limit + args.offset) {
      const res = await this.get(`/api/v1/vorgang`, { ...filter, cursor });
      cursor = res.cursor
      totalCount = res.numFound
      if(res.documents.length === 0) {
        hasNextPage = false
        break
      }
      documents = documents.concat(res.documents)
    }
    return {
      totalCount,
      edges: documents.slice(args.offset, args.limit + args.offset).map((document: Vorgang) => ({ node: document })),
      pageInfo: {
        endCursor: cursor,
        hasNextPage,
      }
    }
  }

  async getVorgangsVorgangspositionen (vorgangsId: string): Promise<Array<Vorgangsposition>>  {
    const { documents: vorgangspositionen } = await this.get(`/api/v1/vorgangsposition`, {
      'f.vorgang': vorgangsId
    });
    return vorgangspositionen
  }

  async getVorgangsDrucksachen(vorgangsId: string): Promise<Array<Drucksache>> {
    const vorgangspositionen = await this.getVorgangsVorgangspositionen(vorgangsId)
    return vorgangspositionen
    .filter((vp: Vorgangsposition) => vp.dokumentart === 'Drucksache')
    .map((vp: Vorgangsposition) => vp.fundstelle as Drucksache)
  }

  async getVorgangsPlenarProtokolle(vorgangsId: string): Promise<Array<Plenarprotokoll>> {
    const vorgangspositionen = await this.getVorgangsVorgangspositionen(vorgangsId)
    return vorgangspositionen
    .filter((vp: Vorgangsposition) => vp.dokumentart === 'Plenarprotokoll')
    .map((vp: Vorgangsposition) => vp.fundstelle as Plenarprotokoll)
  }
}
