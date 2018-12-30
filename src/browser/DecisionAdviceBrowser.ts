import { DataType } from '../importer/Scraper';
import { BundestagListBrowser } from './BundestagListBrowser';

export = Documents_Browser;

namespace Documents_Browser {
    export class Pdf extends DataType {
    }

    export class DecisionAdviceBrowser extends BundestagListBrowser<Pdf>{
        public static readonly pageSize = 10;
        private static readonly ajaxRequestPath: string = "ajax/filterlist/de/ausschuesse/a03/berichte/-/549888";

        protected getPageSize(): number {
            return DecisionAdviceBrowser.pageSize;
        }

        protected getListAjaxRequestPath(): string {
            return DecisionAdviceBrowser.ajaxRequestPath;
        }

        protected createFromStream(readableStream: NodeJS.ReadableStream): Pdf {
            return new Pdf(readableStream);
        }
    }
}