import { IBrowser, IParser, IScraper } from '@democracy-deutschland/scapacra';
import { Xml, PlenarProtocolBrowser } from '../browser/PlenarProtocolBrowser';

export = Documents_Config;

namespace Documents_Config {
    export interface IProtocolScraperConfigurationOptions {
        maxCount: number;
    }

    export abstract class ProtocolScraperConfiguration implements IScraper<Xml> {
        private options: IProtocolScraperConfigurationOptions;

        constructor(options: IProtocolScraperConfigurationOptions) {
            this.options = options;
        }
        public getBrowser(): IBrowser<Xml> {
            return new PlenarProtocolBrowser({
                maxCount: this.options.maxCount
            });
        }

        public abstract getParser(): IParser<Xml>;
    }
}