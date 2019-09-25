import { IMetadata } from './IMetadata';
/**
 * A data bundle decripes all forms of information it's their metadata.
 * <T>: Datatype of the wrapped data. 
 */
export interface IDataPackage<T> {
    /**
     * See interface IMetadata.
     */
    metadata: IMetadata;

    /**
     * Raw data.
     */
    data: T;
}