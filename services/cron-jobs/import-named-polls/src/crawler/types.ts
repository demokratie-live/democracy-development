export interface NamedPollsListResponse {
  meta: Meta;
  items: Item[];
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

interface Item {
  date: string;
  'teaser-size'?: string;
  'leading-title': string;
  'view-variant': string;
  votes: Votes;
  href: string;
  'teaser-title': string;
}

interface Votes {
  no: number;
  yes: number;
  abstain: number;
  absent: number;
}
