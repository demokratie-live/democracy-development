import { DataType, IBrowser } from '@democracy-deutschland/scapacra';
import { BundestagListBrowser } from './BundestagListBrowser';

export = Documents_Browser;

namespace Documents_Browser {
    export class Pdf extends DataType {
    }

    export class ProposedDecisionBrowser extends BundestagListBrowser<Pdf>{
        public static readonly pageSize = 10;
        private static readonly ajaxRequestPath: string = "ajax/filterlist/de/ausschuesse/a03/berichte/-/549888";

        public getPageSize(): number {
            return ProposedDecisionBrowser.pageSize;
        }

        public getListAjaxRequestPath(): string {
            return ProposedDecisionBrowser.ajaxRequestPath;
        }

        protected createFromStream(readableStream: NodeJS.ReadableStream): Pdf {
            return new Pdf(readableStream);
        }
    }
}