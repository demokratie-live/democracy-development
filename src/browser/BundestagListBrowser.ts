import { DataType, IBrowser } from '../importer/Importer';
import { URL } from 'url';
import { WebsiteHrefEvaluator } from '../parser/evaluator/WebsiteHrefEvaluator';

import axios = require('axios');

export = Documents_Browser;

namespace Documents_Browser {
    export interface IBundestagListBrowserOptions {
        maxCount: number;
    }

    /**
     * Abstract browser which implements the base navigation of a Bundestag document list. 
     */
    export abstract class BundestagListBrowser<T extends DataType> implements IBrowser<T>{
        /**
         * Provides the page size of the target list.  
         */
        public abstract getPageSize(): number;

        /**
         * Provides the AJAX URL path of the target list.
         */
        public abstract getListAjaxRequestPath(): string;

        /**
         * Creates the defined IDataType from the given stream.
         */
        protected abstract createFromStream(readableStream: NodeJS.ReadableStream): T; 

        private readonly maxCount: number;
        private baseUrl?: URL;
        private page: number = 0;
        private count: number = 0;
        private endOfListReached: boolean = false;

        private protocolBlobUrls: URL[] = [];

        constructor(options: IBundestagListBrowserOptions) {
            this.maxCount = options.maxCount;
        }

        public getMaxCount(): number {
            return this.maxCount;
        }

        public setUrl(baseUrl: URL): void {
            this.baseUrl = baseUrl;
        }

        public next(): IteratorResult<Promise<T>> {
            let hasNext = this.hasNext(this.count++);
            let nextFragment = this.nextFragment();

            return {
                done: !hasNext,
                value: nextFragment
            }
        }

        private hasNext(count: number): boolean {
            return count < this.maxCount && !(this.endOfListReached && this.protocolBlobUrls.length == 0);
        }

        private async nextFragment(): Promise<T> {
            if (this.protocolBlobUrls.length == 0) {
                await this.retrieveProtocolBlobUrls();
            }

            return this.loadNextProtocol();
        }

        private async loadNextProtocol(): Promise<T> {
            let blobUrl = this.protocolBlobUrls.shift();

            if (blobUrl == undefined) {
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
                return this.createFromStream(response.data)
            } else {
                throw new Error(response.statusText);
            }
        }

        private async retrieveProtocolBlobUrls(): Promise<void> {
            let requestUrl = this.getNextRequestUrl(<URL>this.baseUrl, this.page++);

            let response = await axios.default.get(
                requestUrl.toString(),
                {
                    method: 'get',
                    responseType: 'stream'
                }
            );

            if (response.status === 200) {
                let evaluator = new WebsiteHrefEvaluator(response.data);

                let urls = await evaluator.getSources();

                if (urls.length != this.getPageSize()) {
                    this.endOfListReached = true;
                }

                urls.forEach(blobUrlPath => {
                    let urlPath = <string>blobUrlPath;
                    let url: URL;
                    // There can be full qualified urls or url paths
                    if (urlPath.startsWith("/blob/")) {
                        url = new URL(`${this.baseUrl}${(urlPath).substr(1)}`);
                    } else {
                        url = new URL(urlPath);
                    }
                    this.protocolBlobUrls.push(url);
                });
            }
            else {
                throw new Error(response.statusText);
            }
        }

        private getNextRequestUrl(baseUrl: URL, page: number): URL {
            return new URL(`${baseUrl.toString()}${this.getNextRequestPath(page)}`);
        }

        private getNextRequestPath(page: number): string {
            return `${this.getListAjaxRequestPath()}?${this.getNextRequestQuery(page)}`;
        }

        private getNextRequestQuery(page: number): string {
            let offset = page * this.getPageSize();
            return `limit=5&noFilterSet=true&offset=${offset}`;
        }

        [Symbol.iterator](): IterableIterator<Promise<T>> {
            return this;
        }
    }
}