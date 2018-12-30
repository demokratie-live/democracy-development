import { Xml } from '../importer/Scraper';
import { IBrowser } from '../importer/Browser';
import { URL } from 'url';
import { WebsiteHrefEvaluator } from '../parser/evaluator/WebsiteHrefEvaluator';

import axios = require('axios');

export = Documents_Browser;

namespace Documents_Browser {
    export interface IPlenarProtocolBrowserOptions {
        maxCount: number;
    }

    export class PlenarProtocolBrowser implements IBrowser<Xml>{
        public static readonly pageSize = 5;
        private static readonly ajaxRequestPath: string = "ajax/filterlist/de/service/opendata/-/543410";
        
        private readonly maxCount: number;
        private baseUrl?: URL;
        private page: number = 0;
        private count: number = 0;

        private protocolBlobUrls: URL[] = [];

        constructor(options: IPlenarProtocolBrowserOptions) {
            this.maxCount = options.maxCount;
        }

        public setUrl(baseUrl: URL): void {
            this.baseUrl = baseUrl;
        }

        public next(): IteratorResult<Promise<Xml>> {
            let hasNext = this.hasNext(this.count++);
            let nextFragment = this.nextFragment();

            return {
                done: !hasNext,
                value: nextFragment
            }
        }

        private hasNext(count: number): boolean {
            return count < this.maxCount;
        }

        private nextFragment(): Promise<Xml> {
            return new Promise((resolve, reject) => {
                if (this.protocolBlobUrls.length == 0) {
                    this.retrieveProtocolBlobUrls()
                        .then(() => resolve(this.loadNextProtocol()))
                        .catch(error => reject(error));
                } else {
                    resolve(this.loadNextProtocol());
                }
            });
        }

        private loadNextProtocol(): Promise<Xml> {
            return new Promise((resolve, reject) => {
                let blobUrl = this.protocolBlobUrls.pop();

                if (blobUrl == undefined) {
                    reject(new Error("The stack with blob URLs is empty."));
                } else {
                    axios.default.get(
                        blobUrl.toString(),
                        {
                            method: 'get',
                            responseType: 'stream'
                        })
                        .then(response => resolve(new Xml(response.data)))
                        .catch(error => reject(error))
                }
            });
        }

        private retrieveProtocolBlobUrls(): Promise<void> {
            return new Promise((resolve, reject) => {
                let requestUrl = this.getNextRequestUrl(<URL>this.baseUrl, this.page);

                axios.default.get(
                    requestUrl.toString(),
                    {
                        method: 'get',
                        responseType: 'stream'
                    })
                    .then(response => {
                        let evaluator = new WebsiteHrefEvaluator(response.data);

                        evaluator.getSources(resultsAsJson => {
                            resultsAsJson.forEach(blobUrlPath => {
                                let blobUrl = new URL(`${this.baseUrl}${(<string>blobUrlPath).substr(1)}`);
                                this.protocolBlobUrls.push(blobUrl);
                            });

                            resolve();
                        });
                    })
                    .catch(error => reject(error));
            });
        }

        private getNextRequestUrl(baseUrl: URL, page: number): URL {
            return new URL(`${baseUrl.toString()}${this.getNextRequestPath(page)}`);
        }

        private getNextRequestPath(page: number): string {
            return `${PlenarProtocolBrowser.ajaxRequestPath}?${this.getNextRequestQuery(page)}`;
        }

        private getNextRequestQuery(page: number): string {
            let offset = page * PlenarProtocolBrowser.pageSize;
            return `limit=5&noFilterSet=true&offset=${offset}`;
        }

        [Symbol.iterator](): IterableIterator<Promise<Xml>> {
            return this;
        }
    }
}