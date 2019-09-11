import { IDataPackage, DataType, IBrowser } from '@democracy-deutschland/scapacra';

import { URL } from 'url';

import { NamedPollHrefEvaluator } from '../NamedPoll/NamedPollHrefEvaluator';

import axios = require('axios');
import { url } from 'inspector';

export = Browser;

namespace Browser {
    export class NamedPollDeputies extends DataType {
    }

    /**
     * Abstract browser which implements the base navigation of a Bundestag document list. 
     */
    export class NamedPollDeputyBrowser implements IBrowser<NamedPollDeputies>{
        /**
         * Provides the page size of the target list.  
         */
        //public abstract getPageSize(): number;

        /**
         * Creates the defined IDataType from the given stream.
         */
        //protected abstract createFromStream(readableStream: NodeJS.ReadableStream): DeputyProfile;

        private readonly findListURL: string = "https://www.bundestag.de/abstimmung";
        private listURL: string | null = null; // Will be determined on runtime
        private readonly listURLQuery: string = '?limit=10&noFilterSet=true&offset=';
        private readonly baseURL: string = "https://www.bundestag.de";
        private readonly nameListURL: string = "https://www.bundestag.de/apps/na/na/namensliste.form?id=";

        private pollUrls: string[] = [];
        private offset = 0;
        private done = false;

        public next(): IteratorResult<Promise<IDataPackage<NamedPollDeputies>>> {
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

        private async loadNext(): Promise<IDataPackage<NamedPollDeputies>> {
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
                        url: blobUrl
                    },
                    data: new NamedPollDeputies(response.data)
                }
            } else {
                throw new Error(response.statusText);
            }
        }

        private async retrieveMore(): Promise<void> {
            // We did not find the ListURL yet
            let moreURL: string = ''; // unused
            if (!this.listURL) {
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
                                this.listURL = this.baseURL + match;
                            }
                            if (group === 1) {
                                moreURL = match;
                            }
                        });
                    }
                }
                else {
                    throw new Error(response.statusText);
                }
            }

            // Did we already retrieved everything from the List?
            if (this.done) {
                return;
            }
            const reqURL = this.listURL + this.listURLQuery + this.offset;
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
                    // find id
                    let id: string | null = null;
                    const regex_id = /id=(.*)/gm;
                    let m;
                    while ((m = regex_id.exec(blobUrlPath)) !== null) {
                        // This is necessary to avoid infinite loops with zero-width matches
                        if (m.index === regex_id.lastIndex) {
                            regex_id.lastIndex++;
                        }
                        // The result can be accessed through the `m`-variable.
                        m.forEach((match, group) => {
                            if (group === 1) {
                                id = match
                            }
                        });
                    }
                    if (id) {
                        this.pollUrls.push(`${this.nameListURL}${id}`);
                    }
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

        [Symbol.iterator](): IterableIterator<Promise<IDataPackage<NamedPollDeputies>>> {
            return this;
        }
    }
}