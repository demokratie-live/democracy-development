import { CheerioCrawler } from 'crawlee';
import { BASE_URL, CRAWLER_LABELS, MAX_CONCURRENCY, MAX_REQUESTS_PER_MINUTE } from '../constants';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { getUrlParams } from '../utils/getUrlParams';
import { processNamedPoll } from '../process-named-poll';
import { router } from './router';
import { getVoteNumber } from '../utils/getVoteNumber';
import { NamedPollModel } from '@democracy-deutschland/bundestagio-common';

const crawler = new CheerioCrawler({
  requestHandler: router,
  maxConcurrency: MAX_CONCURRENCY,
  maxRequestsPerMinute: MAX_REQUESTS_PER_MINUTE,
  requestHandlerTimeoutSecs: 60,
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
      url: `https://www.bundestag.de/ajax/filterlist/de/parlament/plenum/abstimmung/484422-484422?limit=10&noFilterSet=true&offset=0`,
      label: CRAWLER_LABELS.LIST,
      userData: {
        offset: 0,
      },
    },
    // Test single poll
    // {
    //   url: `https://www.bundestag.de/parlament/plenum/abstimmung/abstimmung?id=720`,
    //   label: CRAWLER_LABELS.POLL,
    //   userData: {
    //     id: '720',
    //     url: 'https://www.bundestag.de/parlament/plenum/abstimmung/abstimmung?id=720',
    //     date: new Date('2021-03-27T00:00:00.000Z'),
    //     votes: { all: { total: 708, yes: 382, no: 118, abstain: 67, na: 141 } },
    //   },
    // },
  ]);
};

router.addDefaultHandler(({ log }) => {
  log.info('Route reached.');
});

router.addHandler(CRAWLER_LABELS.LIST, async ({ $, request, crawler }) => {
  console.log('List', request.url);
  const polls = $('.col-xs-12.bt-slide:not(.bt-slide-error)');
  polls.each(async (i, poll) => {
    const element = $(poll);

    const urlElement = $(element.find('a'));
    const url = `${BASE_URL}${urlElement.attr('href')}`;
    if (!urlElement.attr('href')) {
      return;
    }

    const date = dayjs($(element.find('.bt-date')).text().trim(), 'L')
      .add(1, 'day')
      .set('hours', 1)
      .set('minute', 0)
      .set('second', 0)
      .set('millisecond', 0)
      .toDate();

    const votesElement = $(element.find('.bt-chart-legend'));
    const votesYes = getVoteNumber('ja', { $, votesElement });
    const votesNo = getVoteNumber('nein', { $, votesElement });
    const votesAbstain = getVoteNumber('enthalten', { $, votesElement });
    const votesNA = getVoteNumber('na', { $, votesElement });

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

    const existingNamedPoll = await NamedPollModel.exists({ webId: id });
    if (!existingNamedPoll) {
      console.log('Poll Details', url);
      await crawler.addRequests([
        {
          url,
          label: CRAWLER_LABELS.POLL,
          userData,
        },
      ]);
    }
  });
  console.log(polls.length);
  if (polls.length > 0) {
    const newOffset = request.userData.offset + 10;
    await crawler.addRequests([
      {
        url: `https://www.bundestag.de/ajax/filterlist/de/parlament/plenum/abstimmung/484422-484422?limit=10&noFilterSet=true&offset=${newOffset}`,
        label: CRAWLER_LABELS.LIST,
        userData: {
          offset: newOffset,
        },
      },
    ]);
  }
});

router.addHandler(CRAWLER_LABELS.POLL, async ({ $, request }) => {
  console.log('Poll', request.url);
  const descriptionElement = $('.bt-artikel.bt-standard-content p').first();

  const id = request.userData.id;

  const partyVoteElements = $('#abstimmungsergebnis div.col-xs-12.col-sm-3');

  const partyVotes = partyVoteElements
    .map((i, el) => {
      const partyVoteElement = $(el);
      const votesYes = getVoteNumber('ja', { $, votesElement: partyVoteElement });
      const votesNo = getVoteNumber('nein', { $, votesElement: partyVoteElement });
      const votesAbstain = getVoteNumber('enthalten', { $, votesElement: partyVoteElement });
      const votesNA = getVoteNumber('na', { $, votesElement: partyVoteElement });

      return {
        name: $(partyVoteElement).find('.bt-teaser-chart-solo').attr('data-value'),
        votes: {
          total: 244,
          yes: votesYes,
          no: votesNo,
          abstain: votesAbstain,
          na: votesNA,
        },
      };
    })
    .get();

  const userData = {
    ...request.userData,
    title: $('.bt-artikel__title').first().text().trim(),
    description: descriptionElement.text().trim(),
    documents: $(descriptionElement)
      .find('a.dipLink')
      .map((i, el) => $(el).attr('href'))
      .get(),
    deputyVotesURL: `https://www.bundestag.de/apps/na/na/namensliste.form?id=${id}&ajax=true`,
    votes: {
      ...request.userData.votes,
      parties: partyVotes,
    },
  };

  await processNamedPoll(userData);

  return userData;
});
