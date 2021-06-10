import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest'
import { Vorgang, Dokument } from './types'

export default class DipAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://search.dip.bundestag.de'
  }

  willSendRequest(request: RequestOptions) {
    request.headers.set('Authorization', `ApiKey ${this.context.DIP_API_KEY}`);
  }

  async getVorgaenge(): Promise<Array<Vorgang>> {
    const { documents } = await this.get(`/api/v1/vorgang`);
    return documents
  }

  async getVorgangsDokumente(vorgangsId: string): Promise<Array<Dokument>> {
    const { documents } = await this.get(`/api/v1/vorgangsposition`, {
      'f.vorgang': vorgangsId
    });
    return documents
  }
}
