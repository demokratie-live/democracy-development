import { DataType } from '../importer/Scraper';
import { IBrowser } from '../importer/Browser';
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

        private nextFragment(): Promise<T> {
            return new Promise((resolve, reject) => {
                if (this.protocolBlobUrls.length == 0) {
                    this.retrieveProtocolBlobUrls()
                        .then(() => {
                            this.loadNextProtocol()
                                .then(result => resolve(result))
                                .catch(error => reject(error));
                        })
                        .catch(error => reject(error));
                } else {
                    this.loadNextProtocol()
                        .then(result => resolve(result))
                        .catch(error => reject(error));
                }
            });
        }

        private loadNextProtocol(): Promise<T> {
            return new Promise((resolve, reject) => {
                let blobUrl = this.protocolBlobUrls.shift();

                if (blobUrl != undefined) {
                    axios.default.get(
                        blobUrl.toString(),
                        {
                            method: 'get',
                            responseType: 'stream'
                        })
                        .then(response => {
                            if (response.status === 200) {
                                resolve(this.createFromStream(response.data))
                            } else {
                                reject(response.statusText);
                            }
                        })
                        .catch(error => reject(error))
                }
            });
        }

        private retrieveProtocolBlobUrls(): Promise<void> {
            return new Promise((resolve, reject) => {
                let requestUrl = this.getNextRequestUrl(<URL>this.baseUrl, this.page++);

                axios.default.get(
                    requestUrl.toString(),
                    {
                        method: 'get',
                        responseType: 'stream'
                    })
                    .then(response => {
                        if (response.status === 200) {
                            let evaluator = new WebsiteHrefEvaluator(response.data);

                            evaluator.getSources(resultsAsJson => {
                                if (resultsAsJson.length != this.getPageSize()) {
                                    this.endOfListReached = true;
                                }

                                resultsAsJson.forEach(blobUrlPath => {
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

                                resolve();
                            });
                        }
                        else {
                            reject(response.statusText);
                        }
                    })
                    .catch(error => reject(error));
            });
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