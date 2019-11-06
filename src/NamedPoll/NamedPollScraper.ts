import { IParser, IBrowser, IScraper } from '@democracy-deutschland/scapacra';
import { NamedPollData, NamedPollMeta, NamedPollBrowser } from './NamedPollBrowser';
import { NamedPollParser } from './NamedPollParser';
export = Scraper;

namespace Scraper {
    export class NamedPollScraper implements IScraper<NamedPollData,NamedPollMeta> {

        public getBrowser(): IBrowser<NamedPollData,NamedPollMeta> {
            return new NamedPollBrowser();
        }

        public getParser(): IParser<NamedPollData,NamedPollMeta> {
            return new NamedPollParser();
        };
    }
}