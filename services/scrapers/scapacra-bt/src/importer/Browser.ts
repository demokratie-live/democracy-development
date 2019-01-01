import { DataType } from './Scraper';

export = Documents_Browser;

namespace Documents_Browser {
    /**
     * The browser navigates through a document structure and retrieves the desired fragments for the parser.
     */
    export interface IBrowser<T extends DataType> extends IterableIterator<Promise<T>> {
        /**
         * Sets the base URL.
         */
        setUrl(url: URL): void;
    }
}