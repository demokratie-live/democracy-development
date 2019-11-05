import { IParser, IBrowser, IScraper } from '@democracy-deutschland/scapacra';
import { ConferenceWeekDetailsData, ConferenceWeekDetailsMeta, ConferenceWeekDetailBrowser } from './ConferenceWeekDetailBrowser';
import { ConferenceWeekDetailParser } from './ConferenceWeekDetailParser';
export = Scraper;

namespace Scraper {
    export class ConferenceWeekDetailScraper implements IScraper<ConferenceWeekDetailsData,ConferenceWeekDetailsMeta> {

        public getBrowser(): IBrowser<ConferenceWeekDetailsData,ConferenceWeekDetailsMeta> {
            return new ConferenceWeekDetailBrowser();
        }

        public getParser(): IParser<ConferenceWeekDetailsData,ConferenceWeekDetailsMeta> {
            return new ConferenceWeekDetailParser();
        };
    }
}