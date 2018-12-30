import { Xml } from '../importer/Scraper';
import { ProtocolScraperConfiguration } from '../config/ProtocolScraperConfiguration';
import { IParser } from '../importer/Parser';
import { ProtocolSpeechesParser } from '../parser/ProtocolSpeechesParser';

export = Documents_Config;

namespace Documents_Config {
    export class ProtocolSpeechScraperConfiguration extends ProtocolScraperConfiguration {
        public getParser(): IParser<Xml> {
            return new ProtocolSpeechesParser();
        }
    }
}