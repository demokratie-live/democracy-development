import { IParser, IBrowser, IScraper } from '@democracy-deutschland/scapacra';
import {
  NamedPollDeputiesData,
  NamedPollDeputiesMeta,
  NamedPollDeputyBrowser,
  NamedPollDeputyBrowserOptions,
} from './NamedPollDeputyBrowser';
import NamedPollDeputyParser from './NamedPollDeputyParser';

export class NamedPollDeputyScraper implements IScraper<NamedPollDeputiesData, NamedPollDeputiesMeta> {
  constructor(private readonly options: NamedPollDeputyBrowserOptions = {}) {}

  public getBrowser(): IBrowser<NamedPollDeputiesData, NamedPollDeputiesMeta> {
    return new NamedPollDeputyBrowser(this.options);
  }

  public getParser(): IParser<NamedPollDeputiesData, NamedPollDeputiesMeta> {
    return new NamedPollDeputyParser();
  }
}

export default NamedPollDeputyScraper;
