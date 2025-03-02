import { DataPackage, IBrowser } from '@democracy-deutschland/scapacra';
import axios from 'axios';

export type NamedPollDeputiesData = NodeJS.ReadableStream;
export type NamedPollDeputiesMeta = {
  url: string;
};

// Add new interfaces for JSON response
interface Votes {
  no: number;
  yes: number;
  abstain: number;
  absent: number;
}

interface Item {
  date: string;
  'teaser-size'?: string;
  'leading-title': string;
  'view-variant': string;
  votes: Votes;
  href: string;
  'teaser-title': string;
}

interface Meta {
  hits: number;
  offset: number;
  isLast: boolean;
  limit: number;
  'static-item-count': number;
  'is-no-data-loader': boolean;
  'has-static-items': boolean;
  noFilterSet: boolean;
}

interface NamedPollsListResponse {
  meta: Meta;
  items: Item[];
}

/**
 * Abstract browser which implements the base navigation of a Bundestag document list.
 */
export class NamedPollDeputyBrowser implements IBrowser<NamedPollDeputiesData, NamedPollDeputiesMeta> {
  private readonly findListURL: string =
    'https://www.bundestag.de/ajax/filterlist/de/parlament/plenum/abstimmung/484422-484422?&offset=null&noFilterSet=true&view=resultjson';
  private readonly nameListURL: string = 'https://www.bundestag.de/apps/na/namensliste.form?id=';

  private pollUrls: string[] = [];
  private offset = 0;
  private done = false;

  public async next(): Promise<IteratorResult<Promise<DataPackage<NamedPollDeputiesData, NamedPollDeputiesMeta>>>> {
    // First, try to get more URLs if we need them
    if (this.pollUrls.length === 0 && !this.done) {
      await this.retrieveMore();

      // If we still have no URLs and we're done fetching, we're finished
      if (this.pollUrls.length === 0 && this.done) {
        return {
          done: true,
          value: undefined,
        };
      }
    }

    // We should have URLs available now
    if (this.pollUrls.length === 0) {
      throw new Error('URL stack is empty but hasNext() indicated we should have more.');
    }

    return {
      done: false,
      value: this.loadNext(),
    };
  }

  private async loadNext(): Promise<DataPackage<NamedPollDeputiesData, NamedPollDeputiesMeta>> {
    console.log('🏃 loadNext');
    let blobUrl = this.pollUrls.shift();

    if (blobUrl === undefined) {
      throw new Error('URL stack is empty.');
    }

    let response = await axios.get(blobUrl.toString(), {
      method: 'get',
      responseType: 'stream',
    });

    if (response.status === 200) {
      return new DataPackage<NamedPollDeputiesData, NamedPollDeputiesMeta>(response.data, { url: blobUrl });
    } else {
      throw new Error(response.statusText);
    }
  }

  private async retrieveMore(): Promise<void> {
    if (this.done) {
      return;
    }

    try {
      console.log('🏃 retrieveMore->get', this.findListURL.replace('offset=null', `offset=${this.offset}`));
      const response = await axios.get<NamedPollsListResponse>(
        this.findListURL.replace('offset=null', `offset=${this.offset}`),
        {
          method: 'get',
        },
      );

      if (response.status === 200) {
        const data = response.data;

        // Process items and extract poll URLs
        data.items.forEach((item) => {
          if (item.href) {
            // The href format is like "/parlament/plenum/abstimmung/abstimmung?id=123"
            const match = item.href.match(/abstimmung\?id=(\d+)$/);
            if (match && match[1]) {
              const pollId = match[1];
              console.log('🏃 Found poll ID:', pollId);
              this.pollUrls.push(`${this.nameListURL}${pollId}`);
            } else {
              console.log('🏃 No match for href:', item.href);
            }
          }
        });

        const limit = data.meta.limit;
        // Increase offset by the page size (limit)
        this.offset += limit;

        // Check if we've reached the end by comparing offset with total hits
        console.log('🏃 retrieveMore->check', {
          offset: this.offset,
          hits: data.meta.hits,
          items: data.items.length,
          limit,
          isLast: data.meta.isLast,
          pollUrlsCount: this.pollUrls.length,
        });

        // Only mark as done if we've reached or exceeded the total number of hits
        if (this.offset >= data.meta.hits) {
          console.log('🏃 retrieveMore->done', 'Reached total hits');
          this.done = true;
        }
      }
    } catch (error) {
      console.error('Error fetching poll list:', error);
      this.done = true;
      throw error;
    }
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<Promise<DataPackage<NamedPollDeputiesData, NamedPollDeputiesMeta>>> {
    return this;
  }
}

export default NamedPollDeputyBrowser;
