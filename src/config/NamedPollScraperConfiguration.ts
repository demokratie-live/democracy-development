import { IParser, IBrowser, IScraperConfiguration } from '@democracy-deutschland/scapacra';
import { NamedPoll, NamedPollBrowser } from '../browser/NamedPollBrowser';
import { NamedPollParser } from '../parser/NamedPollParser';
export = Deputy_Config;

namespace Deputy_Config {
    export class NamedPollScraperConfiguration implements IScraperConfiguration<NamedPoll> {

        public getBrowser(): IBrowser<NamedPoll> {
            return new NamedPollBrowser();
        }

        public getParser(): IParser<NamedPoll> {
            return new NamedPollParser();
        };
    }
}