import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest'

export default class DipAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://search.dip.bundestag.de'
  }

  willSendRequest(request: RequestOptions) {
    request.headers.set('Authorization', `ApiKey ${this.context.DIP_API_KEY}`);
  }

  async getProcedures() {
    const { documents } = await this.get(`/api/v1/vorgang`);
    return documents
  }
}
