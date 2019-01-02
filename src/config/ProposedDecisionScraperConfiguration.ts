import { IScraperConfiguration, IParser, IBrowser } from '../importer/Importer';
import { URL } from 'url';
import { Pdf, ProposedDecisionBrowser } from '../browser/ProposedDecisionBrowser';

export = Documents_Config;

namespace Documents_Config {
    export class ProposedDecisionScraperConfiguration implements IScraperConfiguration<Pdf> {
        public getURL(): URL {
            return new URL("https://www.bundestag.de");
        }
        public getBrowser(): IBrowser<Pdf> {
            return new ProposedDecisionBrowser({
                maxCount: 5
            });
        }
        public getParser(): IParser<Pdf> {
            throw new Error("Method not implemented.");
        }
    }
}