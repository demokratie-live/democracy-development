import { IParser, IBrowser, IScraperConfiguration } from '@democracy-deutschland/scapacra';
import { DeputyProfile, DeputyProfileBrowser } from './DeputyProfileBrowser';
import { DeputyProfileParser } from './DeputyProfileParser';
export = Scraper;

namespace Scraper {
    export class DeputyProfileScraper implements IScraperConfiguration<DeputyProfile> {

        public getBrowser(): IBrowser<DeputyProfile> {
            return new DeputyProfileBrowser();
        }

        public getParser(): IParser<DeputyProfile> {
            return new DeputyProfileParser();
        };
    }
}