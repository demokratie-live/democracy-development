import { IParser, IBrowser, IScraper } from '@democracy-deutschland/scapacra';
import { NamedPollDeputies, NamedPollDeputyBrowser } from './NamedPollDeputyBrowser';
import { NamedPollDeputyParser } from './NamedPollDeputyParser';
export = Scraper;

namespace Scraper {
    export class NamedPollDeputyScraper implements IScraper<NamedPollDeputies> {

        public getBrowser(): IBrowser<NamedPollDeputies> {
            return new NamedPollDeputyBrowser();
        }

        public getParser(): IParser<NamedPollDeputies> {
            return new NamedPollDeputyParser();
        };
    }
}