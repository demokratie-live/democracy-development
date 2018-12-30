import { IParser } from './Parser';
import { IBrowser } from './Browser';
import fs = require('fs');

export = Documents_Scraper;

namespace Documents_Scraper {
    /**
     * Descripes a general data format.
     */
    export interface IDataType { 
        openStream(): NodeJS.ReadableStream;
    }

    /**
     * Desctipes a general Xml data format.
     */
    export class Xml implements IDataType {
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
    export interface IScraperConfiguration<T extends IDataType> {
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
        public scrape<T extends IDataType>(configs: IScraperConfiguration<T>[], callback: (json: JSON[]) => void): void{
            for (const config of configs) {
                let browser = config.getBrowser();
                let parser = config.getParser();
                let url = config.getURL();

                browser.setUrl(url);
                
                for (const parserFragment of browser) {
                    parserFragment.then(fragment => {
                        parser.parse(fragment, json => callback(json));
                    }).catch(error => {
                        
                    });
                }
            }
        }
    }
}