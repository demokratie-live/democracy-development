import scrapeIt from 'scrape-it';
import { commonHeaders } from './config';
import { DeputyListItem, DeputyScrapedData } from './types';

const deputyDetailsScrapeConfig = {
  imgURL: {
    selector: '.e-image__wrapper.--rounded img',
    attr: 'data-img-md-normal',
    convert: (src: string) => (src.startsWith('http') ? src : `https://www.bundestag.de${src}`),
  },
  biography: {
    listItem: '.m-biography__biography p',
    convert: (text: unknown) => (typeof text === 'string' ? text.trim() : undefined),
  },
  party: {
    selector: '.m-biography__introInfo strong',
    convert: (text: string) => text?.trim(),
  },
  name: {
    selector: '.m-biography__introName',
    convert: (text: string) => text?.trim(),
  },
  job: {
    selector: '.m-biography__introInfo span',
    convert: (text: string) => text?.trim(),
  },
  office: {
    selector: '.m-marginal__itemContent p',
    how: 'html',
    convert: (text: string) => text?.split('<br>'),
  },
  links: {
    listItem: '.m-biography__marginal:not(.--mobile) .m-marginal__itemContent .e-linkList__item',
    data: {
      name: {
        selector: 'a span.a-link__label:not(.--hidden)',
        convert: (text: string) => text?.trim(),
      },
      URL: {
        selector: 'a',
        attr: 'href',
        convert: (href: string) => (href.startsWith('http') ? href : `https://www.bundestag.de${href}`),
      },
    },
  },
  constituency: {
    selector: '.m-biography__constituencyInfo a',
    convert: (text: string) => {
      const rx = /Wahlkreis (\d{3})/;
      const arr = rx.exec(text);
      return arr?.[1];
    },
  },
  constituencyName: {
    selector: '.m-biography__constituencyInfo a',
    convert: (text: string) => {
      const rx = /Wahlkreis \d{3}: (.*?)$/;
      const arr = rx.exec(text);
      return arr?.[1];
    },
  },
  directCandidate: {
    selector: '.m-biography__subHeading.--mandate',
    convert: (text: string) => text?.trim() === 'Direkt gewählt',
  },
};

export const fetchDeputyDetails = async (deputyUrl: string): Promise<DeputyScrapedData> => {
  return scrapeIt<DeputyScrapedData>(
    {
      url: encodeURI(deputyUrl),
      headers: commonHeaders,
    },
    deputyDetailsScrapeConfig,
  ).then(({ data }) => ({
    ...data,
    biography: Array.isArray(data.biography) ? data.biography.filter(Boolean) : [],
  }));
};

export const fetchDeputyList = async (url: string): Promise<{ deputies: DeputyListItem[] }> => {
  return scrapeIt<{ deputies: DeputyListItem[] }>(
    { url, headers: commonHeaders },
    {
      deputies: {
        listItem: '.bt-slide:not(.bt-slide-error)',
        data: {
          URL: {
            selector: 'div.bt-slide-content > a',
            attr: 'href',
            convert: (href: string) => (href.startsWith('http') ? href : `https://www.bundestag.de${href}`),
          },
          webId: {
            selector: 'div.bt-slide-content > a',
            attr: 'data-id',
          },
        },
      },
    },
  ).then(({ data }) => data);
};
