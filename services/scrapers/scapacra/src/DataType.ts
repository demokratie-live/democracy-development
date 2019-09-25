/**
 * Descripes a general data format.
 */
export abstract class DataType { 
    private xmlStream: NodeJS.ReadableStream;

    constructor(xmlStream: NodeJS.ReadableStream) {
        this.xmlStream = xmlStream;
    }

    public openStream(): NodeJS.ReadableStream {
        return this.xmlStream;
    }
}