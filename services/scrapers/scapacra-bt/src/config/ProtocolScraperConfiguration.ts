import { IScraperConfiguration, IParser, IBrowser } from '../importer/Importer';
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