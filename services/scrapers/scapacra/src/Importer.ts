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
    export interface IBrowser<T extends DataType> extends IterableIterator<Promise<IDataPackage<T>>> {
    }

    /**
     * The parser extracts the data from a defined document.
     */
    export interface IParser<T extends DataType> {
        /**
         * Extracts the data as JSON from a given data format.
         */
        parse(data: IDataPackage<T>): Promise<IDataPackage<JSON>[]>;
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
     * Definement of global metadata information.
     * Can always be extended with other information.
     */
    export interface IMetadata {
        /**
         * Provides a short description.
         */
        name?: string;
        
        /**
         * Provides information about the source of the data.  
         */
        url?: string;

        /**
         * Provides a description about the data.
         */
        description?: string;

        /**
         * Provides tags optimizing the data searches.
         */
        tags?: string[];
    }

    /**
     * A data bundle decripes all forms of information it's their metadata.
     * <T>: Datatype of the wrapped data. 
     */
    export interface IDataPackage<T> {
        /**
         * See interface IMetadata.
         */
        metadata: IMetadata;

        /**
         * Raw data.
         */
        data: T;
    }    

    /**
     * A scraper executes multiple parser processes defined by scraper configurations and return their collected results over a central callback.
     */
    export class Scraper {

        /**
         * The scraper shedules the execution of the browsers with their coresponding parsers.
         * It collects the browsed and parsed data and returns it by a simple callback function.  
         * 
         * @param configs   Bundle of configurations with information about the IBrowser and IParser combination to be executed.  
         * @param callback  Callback lambda for retrieving the scraper results.
         */
        public static async scrape<T extends DataType>(configs: IScraperConfiguration<T>[], callback: (data: IDataPackage<any>[]) => void) {
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