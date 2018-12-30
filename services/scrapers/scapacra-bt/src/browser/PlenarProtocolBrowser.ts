import { DataType } from '../importer/Scraper';
import { BundestagListBrowser } from './BundestagListBrowser';

export = Documents_Browser;

namespace Documents_Browser {
    export class Xml extends DataType {
    }

    export class PlenarProtocolBrowser extends BundestagListBrowser<Xml>{
        public static readonly pageSize = 5;
        private static readonly ajaxRequestPath: string = "ajax/filterlist/de/service/opendata/-/543410";

        protected getPageSize(): number {
            return PlenarProtocolBrowser.pageSize;
        }

        protected getListAjaxRequestPath(): string {
            return PlenarProtocolBrowser.ajaxRequestPath;
        }

        protected createFromStream(readableStream: NodeJS.ReadableStream): Xml {
            return new Xml(readableStream);
        }
    }
}