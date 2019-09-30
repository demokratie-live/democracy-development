import { IParser, IBrowser, IScraper } from '@democracy-deutschland/scapacra';
import { ConferenceWeekDetails, ConferenceWeekDetailBrowser } from './ConferenceWeekDetailBrowser';
import { ConferenceWeekDetailParser } from './ConferenceWeekDetailParser';
export = Scraper;

namespace Scraper {
    export class ConferenceWeekDetailScraper implements IScraper<ConferenceWeekDetails> {

        public getBrowser(): IBrowser<ConferenceWeekDetails> {
            return new ConferenceWeekDetailBrowser();
        }

        public getParser(): IParser<ConferenceWeekDetails> {
            return new ConferenceWeekDetailParser();
        };
    }
}