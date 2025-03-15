import { PlaywrightCrawler, PlaywrightCrawlingContext } from 'crawlee';
import { BASE_URL, CRAWLER_LABELS, MAX_CONCURRENCY, MAX_REQUESTS_PER_MINUTE } from '../constants';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { getUrlParams } from '../utils/getUrlParams';
import { processNamedPoll } from '../process-named-poll';
import { createPlaywrightRouter } from 'crawlee';
import { getVoteNumber } from '../utils/getVoteNumber';
import { NamedPollModel } from '@democracy-deutschland/bundestagio-common';
import { ListUserData, NamedPollsListResponse } from './types';
import { ElementHandle } from 'playwright';

const router = createPlaywrightRouter();

const crawler = new PlaywrightCrawler({
  requestHandler: router,
  maxConcurrency: MAX_CONCURRENCY,
  maxRequestsPerMinute: MAX_REQUESTS_PER_MINUTE,
  requestHandlerTimeoutSecs: 60,
  requestQueue: undefined,
  headless: true,
});

dayjs.extend(customParseFormat);
dayjs.locale('de');

export const crawl = async () => {
  console.log({
    requestHandler: router,
    maxConcurrency: MAX_CONCURRENCY,
    maxRequestsPerMinute: MAX_REQUESTS_PER_MINUTE,
  });
  await crawler.run([
    {
      url: `https://bundestag.api.proxy.bund.dev/ajax/filterlist/de/parlament/plenum/abstimmung/484422-484422?&offset=0&noFilterSet=true&view=resultjson`,
      label: CRAWLER_LABELS.LIST,
      userData: {
        offset: 0,
      },
    },
  ]);
};

router.addDefaultHandler(({ log }) => {
  log.info('Route reached.');
});

router.addHandler(CRAWLER_LABELS.LIST, async ({ crawler, response }) => {
  if (!response) return;

  // The response body is now JSON.
  const bodyText = await response.text();
  const data = JSON.parse(bodyText) as NamedPollsListResponse;

  for (const poll of data.items) {
    const url = poll.href.startsWith('http') ? poll.href : `${BASE_URL}${poll.href}`;
    const date = dayjs(poll.date, 'YYYY-MM-DD')
      .set('hour', 1)
      .set('minute', 0)
      .set('second', 0)
      .set('millisecond', 0)
      .toDate();

    const votesYes = poll.votes.yes;
    const votesNo = poll.votes.no;
    const votesAbstain = poll.votes.abstain;
    const votesNA = poll.votes.absent; // mapped from 'absent' to 'na'.

    const { id } = getUrlParams(url);
    const userData = {
      id,
      url,
      date,
      votes: {
        all: {
          total: votesYes + votesNo + votesAbstain + votesNA,
          yes: votesYes,
          no: votesNo,
          abstain: votesAbstain,
          na: votesNA,
        },
      },
    };

    NamedPollModel.exists({ webId: id }).then(async (exists) => {
      console.log(`Poll ${id} exists: ${exists}`);
      await crawler.addRequests([
        {
          url,
          label: CRAWLER_LABELS.POLL,
          userData,
        },
      ]);
    });
  }

  if (data.items.length > 0) {
    const newOffset = data.meta.offset + data.meta.limit;
    await crawler.addRequests([
      {
        url: `https://bundestag.api.proxy.bund.dev/ajax/filterlist/de/parlament/plenum/abstimmung/484422-484422?&offset=${newOffset}&noFilterSet=true&view=resultjson`,
        label: CRAWLER_LABELS.LIST,
        userData: { offset: newOffset },
      },
    ]);
  }
});

router.addHandler(
  CRAWLER_LABELS.POLL,
  async ({ page, request }: PlaywrightCrawlingContext<ListUserData>): Promise<void> => {
    console.log('Poll url:', request.url);
    await page.waitForSelector('.bt-artikel.bt-standard-content p');
    const descriptionElement = await page.$('.bt-artikel.bt-standard-content p');
    const descriptionText = (await descriptionElement?.textContent()) || '';

    const id = request.userData.id;

    const partyVoteElements = await page.$$('#abstimmungsergebnis div.col-xs-12.col-sm-3');

    const partyVotes = await Promise.all(
      partyVoteElements.map(async (element: ElementHandle) => {
        const votesYes = await getVoteNumber('ja', { votesElement: element });
        const votesNo = await getVoteNumber('nein', { votesElement: element });
        const votesAbstain = await getVoteNumber('enthalten', { votesElement: element });
        const votesNA = await getVoteNumber('na', { votesElement: element });

        const nameAttr = await element.$eval('.bt-teaser-chart-solo', (el: HTMLElement) =>
          el.getAttribute('data-value'),
        );

        return {
          name: nameAttr || '',
          votes: {
            total: 244,
            yes: votesYes,
            no: votesNo,
            abstain: votesAbstain,
            na: votesNA,
          },
        };
      }),
    );

    const title = await page.$eval('.bt-artikel__title', (el: HTMLElement) => el.textContent?.trim() || '');
    const documents = await page.$$eval(
      '.bt-artikel.bt-standard-content p a.dipLink',
      (elements: HTMLAnchorElement[]) =>
        elements.map((el) => el.getAttribute('href')).filter((href) => href !== null) as string[],
    );

    const userData = {
      ...request.userData,
      title,
      description: descriptionText.trim(),
      documents,
      deputyVotesURL: `https://www.bundestag.de/apps/na/namensliste.form?id=${id}&ajax=true`,
      votes: {
        ...request.userData.votes,
        parties: partyVotes,
      },
    };

    await processNamedPoll(userData);
  },
);
