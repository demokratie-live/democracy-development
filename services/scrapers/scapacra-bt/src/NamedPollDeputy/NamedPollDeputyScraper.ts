import { IParser, IBrowser, IScraper } from '@democracy-deutschland/scapacra';
import { NamedPollDeputiesData, NamedPollDeputiesMeta, NamedPollDeputyBrowser } from './NamedPollDeputyBrowser';
import { NamedPollDeputyParser } from './NamedPollDeputyParser';
export = Scraper;

namespace Scraper {
    export class NamedPollDeputyScraper implements IScraper<NamedPollDeputiesData,NamedPollDeputiesMeta> {

        public getBrowser(): IBrowser<NamedPollDeputiesData,NamedPollDeputiesMeta> {
            return new NamedPollDeputyBrowser();
        }

        public getParser(): IParser<NamedPollDeputiesData,NamedPollDeputiesMeta> {
            return new NamedPollDeputyParser();
        };
    }
}