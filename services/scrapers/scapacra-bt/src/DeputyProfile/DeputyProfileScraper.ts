import { IParser, IBrowser, IScraper } from '@democracy-deutschland/scapacra';
import { DeputyProfileData, DeputyProfileMeta, DeputyProfileBrowser } from './DeputyProfileBrowser';
import { DeputyProfileParser } from './DeputyProfileParser';
export = Scraper;

namespace Scraper {
    export class DeputyProfileScraper implements IScraper<DeputyProfileData,DeputyProfileMeta> {

        public getBrowser(): IBrowser<DeputyProfileData,DeputyProfileMeta> {
            return new DeputyProfileBrowser();
        }

        public getParser(): IParser<DeputyProfileData,DeputyProfileMeta> {
            return new DeputyProfileParser();
        };
    }
}