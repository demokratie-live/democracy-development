import { IParser, IBrowser, IScraperConfiguration } from '@democracy-deutschland/scapacra';
import { NamedPollDeputies, NamedPollDeputyBrowser } from '../browser/NamedPollDeputyBrowser';
import { NamedPollDeputyParser } from '../parser/NamedPollDeputyParser';
export = Deputy_Config;

namespace Deputy_Config {
    export class NamedPollDeputyScraperConfiguration implements IScraperConfiguration<NamedPollDeputies> {

        public getBrowser(): IBrowser<NamedPollDeputies> {
            return new NamedPollDeputyBrowser();
        }

        public getParser(): IParser<NamedPollDeputies> {
            return new NamedPollDeputyParser();
        };
    }
}