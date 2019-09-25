import { DataType } from './DataType';
import { IBrowser } from './IBrowser';
import { IParser } from './IParser';
/**
 * The scraper configuration defines an modular bundle of the source, browser and parser.
 */
export interface IScraper<T extends DataType> {
    /**
     * Provides the browser for this scraper configuration.
     */
    getBrowser(): IBrowser<T>;

    /**
     * Provides the parser for this scraper configuration.
     */
    getParser(): IParser<T>;
}