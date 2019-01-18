import { Xml } from '../browser/PlenarProtocolBrowser';
import { ProtocolScraperConfiguration } from '../config/ProtocolScraperConfiguration';
import { IParser } from '@democracy-deutschland/scapacra';
import { ProtocolVotingParser } from '../parser/ProtocolVotingParser';

export = Documents_Config;

namespace Documents_Config {
    export class ProtocolVotingScraperConfiguration extends ProtocolScraperConfiguration {
        public getParser(): IParser<Xml> {
            return new ProtocolVotingParser();
        }
    }
}