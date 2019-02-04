import { IDataPackage, DataType, IBrowser } from '@democracy-deutschland/scapacra';

import { URL } from 'url';

import { NamedPollHrefEvaluator } from '../parser/evaluator/NamedPollHrefEvaluator';

import axios = require('axios');
import { url } from 'inspector';

export = NamedPollDeputy_Browser;

namespace NamedPollDeputy_Browser {
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

        private readonly listURL: URL = new URL("https://www.bundestag.de/ajax/filterlist/de/parlament/plenum/abstimmung/-/484422/h_49f0d94cb26682ff1e9428b6de471a5b?limit=10&noFilterSet=true")
        private readonly listURLOffset: string = '&offset=';
        private readonly baseUrl: URL = new URL("https://www.bundestag.de/apps/na/na/namensliste.form?id=");

        private pollUrls: URL[] = [];
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
                        url: blobUrl.toString()
                    },
                    data: new NamedPollDeputies(response.data)
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
                        this.pollUrls.push(new URL(`${this.baseUrl}${id}`));
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