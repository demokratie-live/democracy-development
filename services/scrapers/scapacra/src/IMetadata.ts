/**
 * Definement of global metadata information.
 * Can always be extended with other information.
 */
export interface IMetadata {
    /**
     * Provides a short description.
     */
    name?: string;
    
    /**
     * Provides information about the source of the data.  
     */
    url?: string;

    /**
     * Provides a description about the data.
     */
    description?: string;

    /**
     * Provides tags optimizing the data searches.
     */
    tags?: string[];
}