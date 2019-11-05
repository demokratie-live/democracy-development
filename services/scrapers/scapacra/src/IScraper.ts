import { IBrowser } from './IBrowser';
import { IParser } from './IParser';
/**
 * The scraper configuration defines an modular bundle of the source, browser and parser.
 */
export interface IScraper<D,M> {
    /**
     * Provides the browser for this scraper configuration.
     */
    getBrowser(): IBrowser<D,M>;

    /**
     * Provides the parser for this scraper configuration.
     */
    getParser(): IParser<D,M>;
}