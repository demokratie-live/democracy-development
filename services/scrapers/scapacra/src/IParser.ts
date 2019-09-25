import { DataType } from './DataType';
import { IDataPackage } from './IDataPackage';
/**
 * The parser extracts the data from a defined document.
 */
export interface IParser<T extends DataType> {
    /**
     * Extracts the data as JSON from a given data format.
     */
    parse(data: IDataPackage<T>): Promise<IDataPackage<JSON>[]>;
}