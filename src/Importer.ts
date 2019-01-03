export = Documents_Importer;

namespace Documents_Importer {
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
     * The browser navigates through a document structure and retrieves the desired fragments for the parser.
     */
    export interface IBrowser<T extends DataType> extends IterableIterator<Promise<T>> {
    }

    /**
     * The parser extracts the data from a defined document.
     */
    export interface IParser<T extends DataType> {
        /**
         * Extracts the data as JSON from a given data format.
         */
        parse(content: T): Promise<JSON[]>;
    }

    /**
     * The scraper configuration defines an modular bundle of the source, browser and parser.
     */
    export interface IScraperConfiguration<T extends DataType> {
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
        public static async scrape<T extends DataType>(configs: IScraperConfiguration<T>[], callback: (jsons: any[]) => void) {
            for (const config of configs) {
                let browser = config.getBrowser();
                let parser = config.getParser();

                for (const parserFragment of browser) {
                    let fragment = await parserFragment;
                    let json = await parser.parse(fragment);
                    callback(json);
                }
            }
        }
    }
}