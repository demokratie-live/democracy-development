import { IParser } from './Parser';
import { IBrowser } from './Browser';

export = Documents_Scraper;

namespace Documents_Scraper {
    /**
     * Descripes a general data format.
     */
    export abstract class DataType { 
        private xmlStream: NodeJS.ReadableStream;

        constructor(xmlStream: NodeJS.ReadableStream) {
            this.xmlStream = xmlStream;
        }

        public openStream(): NodeJS.ReadableStream {
            return this.xmlStream;
        }
    }

    /**
     * The scraper configuration defines an modular bundle of the source, browser and parser.
     */
    export interface IScraperConfiguration<T extends DataType> {
        /**
         * Retrieves the URL of the target data source.
         */
        getURL(): URL;

        /**
         * Provides the browser for this scraper configuration.
         */
        getBrowser(): IBrowser<T>;

        /**
         * Provides the parser for this scraper configuration.
         */
        getParser(): IParser<T>;
    }

    /**
     * A scraper executes multiple parser processes defined by scraper configurations and return their collected results over a central callback.
     */
    export class Scraper {
        public async scrape<T extends DataType>(configs: IScraperConfiguration<T>[], callback: (jsons: any[]) => void) {
            for (const config of configs) {
                let browser = config.getBrowser();
                let parser = config.getParser();
                let url = config.getURL();

                browser.setUrl(url);
                
                for (const parserFragment of browser) {
                    let fragment = await parserFragment;
                    let json = await parser.parse(fragment);
                    callback(json);
                }
            }
        }
    }
}