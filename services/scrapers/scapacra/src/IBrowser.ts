import { DataType } from './DataType';
import { IDataPackage } from './IDataPackage';
/**
 * The browser navigates through a document structure and retrieves the desired fragments for the parser.
 */
export interface IBrowser<T extends DataType> extends AsyncIterableIterator<Promise<IDataPackage<T>>> {}
