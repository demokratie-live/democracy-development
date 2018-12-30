import { IScraperConfiguration } from '../importer/Scraper';
import { IParser } from '../importer/Parser';
import { IBrowser } from '../importer/Browser';
import { Xml, PlenarProtocolBrowser } from '../browser/PlenarProtocolBrowser';

export = Documents_Config;

namespace Documents_Config {
    export abstract class ProtocolScraperConfiguration implements IScraperConfiguration<Xml>{
        public getURL(): URL {
            return new URL("https://www.bundestag.de");
        }
        public getBrowser(): IBrowser<Xml> {
            return new PlenarProtocolBrowser({
                maxCount: 5
            });
        }

        public abstract getParser(): IParser<Xml>;
    }
}