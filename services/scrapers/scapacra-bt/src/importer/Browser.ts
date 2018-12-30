import { IDataType } from './Scraper';

export = Documents_Browser;

namespace Documents_Browser {
    /**
     * The browser navigates through a document structure and retrieves the desired fragments for the parser.
     */
    export interface IBrowser<T extends IDataType> extends IterableIterator<Promise<T>> {
        /**
         * Extracts the data as JSON from a given data format.
         */
        setUrl(url: URL): void;
    }
}