import { DataPackage } from './DataPackage';
/**
 * The browser navigates through a document structure and retrieves the desired fragments for the parser.
 */
export interface IBrowser<D,M> extends AsyncIterableIterator<Promise<DataPackage<D,M>>> {}
