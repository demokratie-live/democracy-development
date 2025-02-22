import url from 'url';

import {
  setCronStart,
  setCronSuccess,
  setCronError,
  DeputyModel,
  IDeputy,
  mongoConnect,
} from '@democracy-deutschland/bundestagio-common';
import scrapeIt from 'scrape-it';
import { IDeputyLink } from '@democracy-deutschland/bundestagio-common/dist/models/Deputy/Deputy/Link';

const CRON_NAME = 'DeputyProfiles';
const isDebug = process.env.DEBUG === 'true';

const debugCheck = (field: string, value: unknown, context: string = ''): void => {
  if (isDebug) {
    if (!value) {
      console.log(`[DEBUG] Missing ${field}${context ? ' in ' + context : ''}`);
    } else {
      console.log(`[DEBUG] Found ${field}:`, value, context);
    }
  }
};

export const getUsername = ({ URL, name }: IDeputyLink): string | undefined => {
  let username: string | undefined;
  switch (name) {
    case 'Instagram': {
      const parsed = url.parse(URL).pathname?.split('/');
      if (parsed && parsed[1]) {
        username = `${parsed[1]}`;
      }
      break;
    }
    case 'Twitter':
    case 'Facebook': {
      const parsed = url.parse(URL).pathname?.split('/');
      if (parsed && parsed[1]) {
        username = `${parsed[1]}`;
      }
      if (username) {
        username = `@${username}`;
      }
      break;
    }
    default:
      break;
  }
  return username;
};

// Define type for period
export type Period = 18 | 19 | 20;

// Common headers for browser mimic
const commonHeaders = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Sec-Fetch-Site': 'none',
  Cookie:
    'enodia=eyJleHAiOjE3NDAwMzA2OTIsImNvbnRlbnQiOnRydWUsImF1ZCI6ImF1dGgiLCJIb3N0Ijoid3d3LmJ1bmRlc3RhZy5kZSIsIlNvdXJjZUlQIjoiMTc4LjIwMi4xNDUuNDUiLCJDb25maWdJRCI6IjhkYWRjZTEyNWZkMmMzOTMyYjk0M2I1MmU5ZDJjZDY1MDU3NTRlMTYyMjEyYTJjZTFiYjVhZjE1YzBkNGJiZmUifQ==.JRuo6FZFiCz8Ww83ShK_5qfzC0D5XBaKI4r89I0AOZA=',
  'Accept-Encoding': 'gzip, deflate, br',
  'Sec-Fetch-Mode': 'navigate',
  Host: 'www.bundestag.de',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15',
  'Accept-Language': 'de-DE,de;q=0.9',
  'Sec-Fetch-Dest': 'document',
  Connection: 'keep-alive',
};

// Scrape configurations for deputy details
const deputyDetailsScrapeConfig = {
  imgURL: {
    selector: '.e-image__wrapper.--rounded img',
    attr: 'data-img-md-normal',
    convert: (src: string) => (src.startsWith('http') ? src : `https://www.bundestag.de${src}`),
  },
  biography: {
    selector: '.m-biography__biography p',
    convert: (text: string) => (typeof text === 'string' ? text.trim() : undefined),
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

// Fetch deputy details for a given URL
export const fetchDeputyDetails = async (deputyUrl: string) => {
  return scrapeIt<Omit<IDeputy, 'URL' | 'webId' | 'period'>>(
    {
      url: encodeURI(deputyUrl),
      headers: commonHeaders,
    },
    deputyDetailsScrapeConfig,
  ).then(({ data }) => data);
};

// Process a single deputy given list data
const processDeputy = async (deputyListItem: { URL: string; webId: string }, period: Period) => {
  if (isDebug) {
    debugCheck('URL', deputyListItem.URL, 'Deputy List Item');
    debugCheck('webId', deputyListItem.webId, 'Deputy List Item');
  }
  const lastUpdate = await DeputyModel.findOne({ webId: deputyListItem.webId }).then(
    (deputy) => deputy?.updatedAt as string,
  );

  // Skip if last update is less than 7 days old
  if (lastUpdate && new Date(lastUpdate).getTime() > Date.now() - 1000 * 60 * 60 * 24 * 7) {
    console.log('skip', deputyListItem.URL);
    return;
  }
  if (isDebug) {
    console.log('[DEBUG] lastUpdate', lastUpdate);
  }

  const deputyData = await fetchDeputyDetails(deputyListItem.URL);

  if (isDebug) {
    debugCheck('imgURL', deputyData.imgURL, deputyListItem.URL);
    debugCheck('biography', deputyData.biography, deputyListItem.URL);
    debugCheck('party', deputyData.party, deputyListItem.URL);
    debugCheck('name', deputyData.name, deputyListItem.URL);
    debugCheck('job', deputyData.job, deputyListItem.URL);
    debugCheck('office', deputyData.office, deputyListItem.URL);
    if (deputyData.links && Array.isArray(deputyData.links)) {
      deputyData.links.forEach((link, index) => {
        debugCheck(`links[${index}].name`, link.name, deputyListItem.URL);
        debugCheck(`links[${index}].URL`, link.URL, deputyListItem.URL);
      });
    } else {
      console.log(`[DEBUG] links is not an array in ${deputyListItem.URL}`);
    }
    debugCheck('constituency', deputyData.constituency, deputyListItem.URL);
    debugCheck('constituencyName', deputyData.constituencyName, deputyListItem.URL);
    debugCheck('directCandidate', deputyData.directCandidate, deputyListItem.URL);
  }

  const deputy = {
    period,
    URL: deputyListItem.URL,
    webId: deputyListItem.webId,
    ...deputyData,
    biography: Array.isArray(deputyData.biography) ? deputyData.biography.filter((d: string) => !!d) : [],
    links: Array.isArray(deputyData.links)
      ? deputyData.links.map((link: IDeputyLink) => ({
          ...link,
          username: getUsername(link),
        }))
      : [],
  };

  if (isDebug) {
    console.log(`[DEBUG] Deputy data constructed for ${deputyListItem.URL}:`, deputy);
  } else {
    console.log(deputy.name);
  }

  await DeputyModel.updateOne({ webId: deputy.webId }, { $set: deputy }, { upsert: true });
};

// Build URL for deputy list based on period and offset
const getDeputyListUrl = ({ period, offset }: { period: Period; offset: number }) => {
  switch (period) {
    case 18:
      return `https://www.bundestag.de/ajax/filterlist/webarchiv/abgeordnete/biografien18/440460-440460?limit=12&noFilterSet=true&offset=${offset}`;
    case 19:
      return `https://www.bundestag.de/ajax/filterlist/webarchiv/abgeordnete/biografien19/525246-525246?limit=12&noFilterSet=true&offset=${offset}`;
    case 20:
    default:
      return `https://www.bundestag.de/ajax/filterlist/de/abgeordnete/biografien/862712-862712?limit=20&noFilterSet=true&offset=${offset}`;
  }
};

// Fetch deputy list from URL
const fetchDeputyList = async (url: string) => {
  return scrapeIt<{ deputies: Array<{ URL: string; webId: string }> }>(
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

// Main process for deputy list scraping
const processDeputyList = async (period: Period) => {
  let offset = 0;
  let hasMore = true;
  while (hasMore) {
    const url = getDeputyListUrl({ period, offset });
    const deputyList = await fetchDeputyList(url);
    for (const deputyListItem of deputyList.deputies) {
      await processDeputy(deputyListItem, period);
    }
    if (deputyList.deputies.length) {
      offset += deputyList.deputies.length;
    } else {
      hasMore = false;
    }
    console.log(`offset: ${offset} 🚀`);
  }
};

// Start function orchestrating the flow
const start = async () => {
  const startDate = new Date();
  await setCronStart({ name: CRON_NAME, startDate });

  const period = parseInt(process.env.PERIOD ?? '20') as Period;

  // Allow testing a single deputy URL if provided via env variable
  const testDeputyUrl = process.env.TEST_DEPUTY_URL;
  if (testDeputyUrl) {
    console.log(`Testing single deputy URL: ${testDeputyUrl}`);
    const deputyData = await fetchDeputyDetails(testDeputyUrl);
    console.log('Deputy details:', deputyData);
  } else {
    await processDeputyList(period);
  }

  console.log('done 🥳');
  await setCronSuccess({ name: CRON_NAME, successStartDate: startDate });
};

// Main process function
const main = async () => {
  console.info('START');

  // Filter out dotenv config path from arguments
  const args = process.argv.filter((arg) => !arg.startsWith('dotenv_config_path='));
  const deputyUrl = args[2]; // Index 2 will be the first actual argument after node and script path

  if (deputyUrl && deputyUrl.includes('bundestag.de')) {
    console.log(`Fetching single deputy from URL: ${deputyUrl}`);
    const deputyData = await fetchDeputyDetails(deputyUrl);
    console.log('Deputy details:', JSON.stringify(deputyData, null, 2));
    process.exit(0);
    return;
  }

  console.info('process.env', process.env.DB_URL);
  if (!process.env.DB_URL) {
    throw new Error('you have to set environment variable: DB_URL');
  }
  await mongoConnect(process.env.DB_URL);
  console.log('deputies', await DeputyModel.countDocuments({}));
  try {
    await start();
  } catch (error) {
    await setCronError({ name: CRON_NAME, error: JSON.stringify(error) });
  }
  process.exit(0);
};

// Only run if this file is being run directly
if (require.main === module) {
  main();
}
