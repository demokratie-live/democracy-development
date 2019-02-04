import { IDataPackage, DataType, IBrowser } from '@democracy-deutschland/scapacra';

import { URL } from 'url';

import { NamedPollHrefEvaluator } from '../parser/evaluator/NamedPollHrefEvaluator';

import axios = require('axios');
import { url } from 'inspector';

export = NamedPoll_Browser;

namespace NamedPoll_Browser {
    export class NamedPoll extends DataType {
    }

    /**
     * Abstract browser which implements the base navigation of a Bundestag document list. 
     */
    export class NamedPollBrowser implements IBrowser<NamedPoll>{
        /**
         * Provides the page size of the target list.  
         */
        //public abstract getPageSize(): number;

        /**
         * Creates the defined IDataType from the given stream.
         */
        //protected abstract createFromStream(readableStream: NodeJS.ReadableStream): DeputyProfile;

        private readonly listURL: URL = new URL("https://www.bundestag.de/ajax/filterlist/de/parlament/plenum/abstimmung/-/484422/h_49f0d94cb26682ff1e9428b6de471a5b?limit=10&noFilterSet=true")
        private readonly listURLOffset: string = '&offset=';
        private readonly baseUrl: URL = new URL("https://www.bundestag.de");

        private pollUrls: URL[] = [];
        private offset = 0;
        private done = false;

        public next(): IteratorResult<Promise<IDataPackage<NamedPoll>>> {
            let hasNext = this.hasNext();
            let value = this.loadNext();

            return {
                done: !hasNext,
                value
            }
        }

        private hasNext(): boolean {
            return this.pollUrls.length > 1 || !this.done;
        }

        private async loadNext(): Promise<IDataPackage<NamedPoll>> {
            await this.retrieveMore(); // May fetch more results

            let blobUrl = this.pollUrls.shift();

            if (blobUrl === undefined) {
                throw new Error("URL stack is empty.");
            }

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
                    data: new NamedPoll(response.data)
                }
            } else {
                throw new Error(response.statusText);
            }
        }

        private async retrieveMore(): Promise<void> {
            if (this.done) {
                return; // We already retrieved everything
            }
            const reqURL = this.listURL.toString() + this.listURLOffset + this.offset;
            let response = await axios.default.get(
                reqURL,
                {
                    method: 'get',
                    responseType: 'stream'
                }
            );

            if (response.status === 200) {
                let evaluator = new NamedPollHrefEvaluator(response.data);

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
                    this.pollUrls.push(url);
                });
                this.offset += 10;
                if (urls.length === 0) {
                    this.done = true;
                }
            }
            else {
                throw new Error(response.statusText);
            }
        }

        [Symbol.iterator](): IterableIterator<Promise<IDataPackage<NamedPoll>>> {
            return this;
        }
    }
}