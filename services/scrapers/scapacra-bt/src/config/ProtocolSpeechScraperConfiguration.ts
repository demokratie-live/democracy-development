import { ProtocolScraperConfiguration } from '../config/ProtocolScraperConfiguration';
import { IParser } from '../importer/Importer';
import { ProtocolSpeechesParser } from '../parser/ProtocolSpeechesParser';
import { Xml } from '../browser/PlenarProtocolBrowser';

export = Documents_Config;

namespace Documents_Config {
    export class ProtocolSpeechScraperConfiguration extends ProtocolScraperConfiguration {
        public getParser(): IParser<Xml> {
            return new ProtocolSpeechesParser();
        }
    }
}