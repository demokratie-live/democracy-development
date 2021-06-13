import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest'
import { Vorgang, Drucksache, Plenarprotokoll, Vorgangsposition } from './types'


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

  async getVorgaenge(): Promise<Array<Vorgang>> {
    const { documents } = await this.get(`/api/v1/vorgang`);
    return documents
  }

  private async getVorgangsVorgangspositionen (vorgangsId: string): Promise<Array<Vorgangsposition>>  {
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
