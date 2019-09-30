import { IParser, IBrowser, IScraper } from '@democracy-deutschland/scapacra';
import { DeputyProfile, DeputyProfileBrowser } from './DeputyProfileBrowser';
import { DeputyProfileParser } from './DeputyProfileParser';
export = Scraper;

namespace Scraper {
    export class DeputyProfileScraper implements IScraper<DeputyProfile> {

        public getBrowser(): IBrowser<DeputyProfile> {
            return new DeputyProfileBrowser();
        }

        public getParser(): IParser<DeputyProfile> {
            return new DeputyProfileParser();
        };
    }
}