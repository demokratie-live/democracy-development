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

export type ListUserData = {
  id: string;
  url: string;
  date: Date;
  votes: {
    all: {
      total: number;
      yes: number;
      no: number;
      abstain: number;
      na: number;
    };
  };
};

export type PollUserData = ListUserData & {
  title: string;
  description: string;
  documents: string[];
  deputyVotesURL: string;
  votes: {
    parties: {
      name: string;
      votes: {
        total: number;
        yes: number;
        no: number;
        abstain: number;
        na: number;
      };
    }[];
  };
  url: string;
};
