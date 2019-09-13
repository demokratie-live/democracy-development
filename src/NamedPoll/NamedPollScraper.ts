import { IParser, IBrowser, IScraperConfiguration } from '@democracy-deutschland/scapacra';
import { NamedPoll, NamedPollBrowser } from './NamedPollBrowser';
import { NamedPollParser } from './NamedPollParser';
export = Scraper;

namespace Scraper {
    export class NamedPollScraper implements IScraperConfiguration<NamedPoll> {

        public getBrowser(): IBrowser<NamedPoll> {
            return new NamedPollBrowser();
        }

        public getParser(): IParser<NamedPoll> {
            return new NamedPollParser();
        };
    }
}