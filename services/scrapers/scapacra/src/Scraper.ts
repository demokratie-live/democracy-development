import { DataPackage } from './DataPackage';
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
    public static async scrape<D,M>(scraper: IScraper<D,M>, callback: (data: DataPackage<Object,Object> | null) => Promise<void>) {
        let browser = scraper.getBrowser();
        let parser = scraper.getParser();

        for await (const parserFragment of browser) {
            const fragment = await parserFragment;
            const json = await parser.parse(fragment);
            await callback(json);
            json.free();
            fragment.free();
        }
    }
}