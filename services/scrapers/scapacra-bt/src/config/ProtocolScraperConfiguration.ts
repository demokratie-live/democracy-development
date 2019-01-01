import { IScraperConfiguration } from '../importer/Scraper';
import { IParser } from '../importer/Parser';
import { IBrowser } from '../importer/Browser';
import { URL } from 'url';
import { Xml, PlenarProtocolBrowser } from '../browser/PlenarProtocolBrowser';

export = Documents_Config;

namespace Documents_Config {
    export interface IProtocolScraperConfigurationOptions {
        maxCount: number;
    }

    export abstract class ProtocolScraperConfiguration implements IScraperConfiguration<Xml> {
        private options: IProtocolScraperConfigurationOptions;

        constructor(options: IProtocolScraperConfigurationOptions) {
            this.options = options;
        }

        public getURL(): URL {
            return new URL("https://www.bundestag.de");
        }
        public getBrowser(): IBrowser<Xml> {
            return new PlenarProtocolBrowser({
                maxCount: this.options.maxCount
            });
        }

        public abstract getParser(): IParser<Xml>;
    }
}