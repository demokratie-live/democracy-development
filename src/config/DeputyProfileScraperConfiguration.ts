import { IParser, IBrowser, IScraperConfiguration } from 'scapacra';
import { DeputyProfile, DeputyProfileBrowser } from '../browser/DeputyProfileBrowser';
import { DeputyProfileParser } from '../parser/DeputyProfileParser';
export = Deputy_Config;

namespace Deputy_Config {
    export class DeputyProfileScraperConfiguration implements IScraperConfiguration<DeputyProfile> {

        public getBrowser(): IBrowser<DeputyProfile> {
            return new DeputyProfileBrowser();
        }

        public getParser(): IParser<DeputyProfile> {
            return new DeputyProfileParser();
        };
    }
}