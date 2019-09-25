import { DataType } from './DataType';
import { IDataPackage } from './IDataPackage';
import { IScraper } from './IScraper';
/**
 * A scraper executes multiple parser processes defined by scraper configurations and return their collected results over a central callback.
 */
export class Scraper {

    /**
     * The scraper shedules the execution of the browsers with their coresponding parsers.
     * It collects the browsed and parsed data and returns it by a simple callback function.  
     * 
     * @param scrapers  Bundle of scraper configurations with information about the IBrowser and IParser combination to be executed.  
     * @param callback  Callback lambda for retrieving the scraper results.
     */
    public static async scrape<T extends DataType>(scrapers: IScraper<T>[], callback: (data: IDataPackage<any>[]) => void) {
        for (const scraper of scrapers) {
            let browser = scraper.getBrowser();
            let parser = scraper.getParser();

            for await (const parserFragment of browser) {
                let fragment = await parserFragment;
                let json = await parser.parse(fragment);
                callback(json);
            }
        }
    }
}