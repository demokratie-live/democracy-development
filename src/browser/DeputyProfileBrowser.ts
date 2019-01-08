import { IDataPackage, DataType, IBrowser } from 'scapacra';

import { URL } from 'url';

import { DeputyHrefEvaluator } from '../parser/evaluator/DeputyHrefEvaluator';

import axios = require('axios');

export = Deputy_Browser;

namespace Deputy_Browser {
    export class DeputyProfile extends DataType {
    }

    /**
     * Abstract browser which implements the base navigation of a Bundestag document list. 
     */
    export class DeputyProfileBrowser implements IBrowser<DeputyProfile>{
        /**
         * Provides the page size of the target list.  
         */
        //public abstract getPageSize(): number;

        /**
         * Creates the defined IDataType from the given stream.
         */
        //protected abstract createFromStream(readableStream: NodeJS.ReadableStream): DeputyProfile;

        private readonly listURL: URL = new URL("https://www.bundestag.de/ajax/filterlist/de/abgeordnete/biografien/-/525246/h_e3c112579919ef960d06dbb9d0d44b67?limit=9999&view=BTBiographyList")
        private readonly baseUrl: URL = new URL("https://www.bundestag.de");
        private loaded: boolean = false;

        private deputyUrls: URL[] = [];

        public next(): IteratorResult<Promise<IDataPackage<DeputyProfile>>> {
            let hasNext = this.hasNext();
            let value = this.loadNext();

            return {
                done: !hasNext,
                value
            }
        }

        private hasNext(): boolean {
            return !this.loaded || this.deputyUrls.length > 1;
        }

        private async loadNext(): Promise<IDataPackage<DeputyProfile>> {
            if (!this.loaded) {
                await this.retrieveList();
                this.loaded = true;
            }

            let blobUrl = this.deputyUrls.shift();

            if (blobUrl == undefined) {
                throw new Error("URL stack is empty.");
            }
            console.log(blobUrl.toString());

            let response = await axios.default.get(
                blobUrl.toString(),
                {
                    method: 'get',
                    responseType: 'stream'
                }
            );

            if (response.status === 200) {
                return {
                    metadata: {
                        url: blobUrl.toString()
                    },
                    data: new DeputyProfile(response.data)
                }
            } else {
                throw new Error(response.statusText);
            }
        }

        private async retrieveList(): Promise<void> {
            let response = await axios.default.get(
                this.listURL.toString(),
                {
                    method: 'get',
                    responseType: 'stream'
                }
            );

            if (response.status === 200) {
                let evaluator = new DeputyHrefEvaluator(response.data);

                let urls = await evaluator.getSources();

                urls.forEach((blobUrlPath: any) => {
                    let urlPath = <string>blobUrlPath;
                    let url: URL;
                    // There can be full qualified urls or url paths
                    if (urlPath.startsWith("/")) {
                        url = new URL(`${this.baseUrl}${(urlPath).substr(1)}`);
                    } else {
                        url = new URL(urlPath);
                    }
                    this.deputyUrls.push(url);
                });
            }
            else {
                throw new Error(response.statusText);
            }
        }

        [Symbol.iterator](): IterableIterator<Promise<IDataPackage<DeputyProfile>>> {
            return this;
        }
    }
}