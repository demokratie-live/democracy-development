import { DataPackage, IBrowser } from '@democracy-deutschland/scapacra';

import { URL } from 'url';

import { DeputyHrefEvaluator } from './DeputyHrefEvaluator';

import axios = require('axios');

export = Browser;

namespace Browser {
    export type DeputyProfileData = NodeJS.ReadableStream;
    export type DeputyProfileMeta = {
        url: string
    };

    /**
     * Abstract browser which implements the base navigation of a Bundestag document list. 
     */
    export class DeputyProfileBrowser implements IBrowser<DeputyProfileData,DeputyProfileMeta>{
        /**
         * Provides the page size of the target list.  
         */
        //public abstract getPageSize(): number;

        /**
         * Creates the defined IDataType from the given stream.
         */
        //protected abstract createFromStream(readableStream: NodeJS.ReadableStream): DeputyProfile;

        private readonly findListURL: string = "https://www.bundestag.de/abgeordnete/biografien";
        private readonly listQueryURL: string = "?limit=9999&view=BTBiographyList";
        private readonly baseUrl: string = "https://www.bundestag.de";
        private loaded: boolean = false;

        private deputyUrls: string[] = [];

        public async next(): Promise<IteratorResult<Promise<DataPackage<DeputyProfileData,DeputyProfileMeta>>>> {
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

        private async loadNext(): Promise<DataPackage<DeputyProfileData,DeputyProfileMeta>> {
            if (!this.loaded) {
                await this.retrieveList();
                this.loaded = true;
            }

            let blobUrl = this.deputyUrls.shift();

            if (blobUrl === undefined) {
                throw new Error("URL stack is empty.");
            }
            // console.log(blobUrl.toString());

            let response = await axios.default.get(
                blobUrl,
                {
                    method: 'get',
                    responseType: 'stream'
                }
            );

            if (response.status === 200) {
                return new DataPackage<DeputyProfileData,DeputyProfileMeta>(response.data,{url: blobUrl});
            } else {
                throw new Error(response.statusText);
            }
        }

        private async retrieveList(): Promise<void> {
            // Get the ListURL
            let listURL = this.baseUrl;
            let moreURL = this.baseUrl; // unused
            let response = await axios.default.get(
                this.findListURL,
                {
                    method: 'get',
                    responseType: 'blob'
                }
            );
            if (response.status === 200) {
                const regex_dataLoader = /data-dataloader-url="(.*?)"[\s\S]*?data-dataloader-url="(.*?)"/gm;
                let m;
                while ((m = regex_dataLoader.exec(response.data)) !== null) {
                    // This is necessary to avoid infinite loops with zero-width matches
                    if (m.index === regex_dataLoader.lastIndex) {
                        regex_dataLoader.lastIndex++;
                    }
                    // The result can be accessed through the `m`-variable.
                    m.forEach((match, group) => {
                        if (group === 1) {
                            listURL += match + this.listQueryURL;
                        }
                        if (group === 1) {
                            moreURL += match;
                        }
                    });
                }
            }
            else {
                throw new Error(response.statusText);
            }

            // Get the list
            let responseList = await axios.default.get(
                listURL,
                {
                    method: 'get',
                    responseType: 'stream'
                }
            );

            if (responseList.status === 200) {
                let evaluator = new DeputyHrefEvaluator(responseList.data);

                let urls = await evaluator.getSources();

                urls.forEach((blobUrlPath: any) => {
                    let urlPath = <string>blobUrlPath;
                    let url: string;
                    // There can be full qualified urls or url paths
                    if (urlPath.startsWith("/")) {
                        url = `${this.baseUrl}${urlPath}`;
                    } else {
                        url = urlPath;
                    }
                    this.deputyUrls.push(url);
                });
            }
            else {
                throw new Error(responseList.statusText);
            }
        }

        [Symbol.asyncIterator](): AsyncIterableIterator<Promise<DataPackage<DeputyProfileData,DeputyProfileMeta>>> {
            return this;
        }
    }
}