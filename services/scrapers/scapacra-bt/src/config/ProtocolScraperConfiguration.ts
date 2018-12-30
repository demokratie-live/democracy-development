import { Xml, IScraperConfiguration } from '../importer/Scraper';
import { IParser } from '../importer/Parser';
import { IBrowser } from '../importer/Browser';

export = Documents_Config;

namespace Documents_Config {
    export abstract class ProtocolScraperConfiguration implements IScraperConfiguration<Xml>{
        public getURL(): URL {
            return new URL("https://www.bundestag.de");
        }
        public getBrowser(): IBrowser<Xml> {
            throw new Error("Method not implemented.");
        }

        public abstract getParser(): IParser<Xml>;
    }
}