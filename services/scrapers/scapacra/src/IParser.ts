// import { DataType } from './DataType';
import { DataPackage } from './DataPackage';
/**
 * The parser extracts the data from a defined document.
 */
export interface IParser<D,M> {
    /**
     * Extracts the data as JSON from a given data format.
     */
    parse(data: DataPackage<D,M>): Promise<DataPackage<Object,Object>>;
}