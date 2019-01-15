import Scraper from '@democracy-deutschland/bt-named-polls';

// import moment from "moment";
import axios from 'axios';

import CONSTANTS from './../config/constants';

import Procedure from './../models/Procedure';
import NamedPolls from './../models/NamedPolls';

let procedureIds = [];

const checkDocuments = async data => {
  process.stdout.write('n');
  const { id, title, date, documents, voteResults } = data;

  const summarized = {
    yes: 0,
    no: 0,
    abstination: 0,
    notVoted: 0,
  };

  Object.keys(voteResults).forEach(key => {
    summarized.yes += parseInt(voteResults[key].Ja, 10);
    summarized.no += parseInt(voteResults[key].Nein, 10);
    summarized.abstination += parseInt(voteResults[key].Enthalten, 10);
    summarized.notVoted += parseInt(voteResults[key].Nicht, 10);
  });

  await NamedPolls.findOneAndUpdate(
    { pollId: id },
    {
      pollId: id,
      title,
      date,
      documents,
      ...summarized,
      voteResults: Object.keys(voteResults).map(key => ({
        party: key,
        yes: voteResults[key].Ja,
        no: voteResults[key].Nein,
        abstination: voteResults[key].Enthalten,
        notVoted: voteResults[key].Nicht,
      })),
    },
    {
      upsert: true,
    },
  );
};

const matchWithProcedure = async ({ documents, yes, abstination, no, notVoted, voteResults }) => {
  const procedures = await Procedure.find({
    period: 19,
    'importantDocuments.number': { $in: documents },
  });

  const matchedProcedures = procedures.filter(procedure =>
    procedure.history.find(
      ({ decision }) =>
        decision &&
        decision.find(({ type, comment }) => {
          try {
            if (type === 'Namentliche Abstimmung') {
              return (
                comment.match(/\d{1,3}:\d{1,3}:\d{1,3}/)[0] === `${yes}:${no}:${abstination}` ||
                comment.match(/\d{1,3}:\d{1,3}:\d{1,3}/)[0] === `${yes}:${abstination}:${no}`
              );
            }
          } catch (error) {
            return false;
          }
          return false;
        }),
    ),
  );

  // console.log(matchedProcedures.map(({ procedureId }) => procedureId));
  if (matchedProcedures.length > 0) {
    const customData = {
      voteResults: {
        partyVotes: voteResults.map(partyVote => {
          const main = [
            {
              decision: 'YES',
              value: partyVote.yes,
            },
            {
              decision: 'ABSTINATION',
              value: partyVote.abstination,
            },
            {
              decision: 'NO',
              value: partyVote.no,
            },
            {
              decision: 'NOTVOTED',
              value: partyVote.notVoted,
            },
          ].reduce(
            (prev, { decision, value }) => {
              if (prev.value < value) {
                return { decision, value };
              }
              return prev;
            },
            { value: 0 },
          );

          return {
            deviants: {
              yes: partyVote.yes,
              abstination: partyVote.abstination,
              no: partyVote.no,
              notVoted: partyVote.notVoted,
            },
            party: partyVote.party,
            main: main.decision,
          };
        }),
        yes,
        abstination,
        no,
        notVoted,
      },
    };

    // console.log(util.inspect(customData, false, null));

    await matchedProcedures.map(async ({ procedureId, history }) => {
      const namedHistoryEntry = history
        .find(
          ({ decision }) =>
            decision && decision.find(({ type }) => type === 'Namentliche Abstimmung'),
        )
        .decision.find(({ type }) => type === 'Namentliche Abstimmung');
      const votingRecommendationEntry = history.find(
        ({ initiator }) => initiator && initiator.indexOf('Beschlussempfehlung und Bericht') !== -1,
      );

      customData.voteResults.votingDocument =
        namedHistoryEntry.comment.indexOf('Annahme der Beschlussempfehlung auf Ablehnung') !== -1
          ? 'recommendedDecision'
          : 'mainDocument';

      if (votingRecommendationEntry) {
        switch (votingRecommendationEntry.abstract) {
          case 'Empfehlung: Annahme der Vorlage':
            customData.voteResults.votingRecommendation = true;
            break;
          case 'Empfehlung: Ablehnung der Vorlage':
            customData.voteResults.votingRecommendation = false;
            break;

          default:
            break;
        }
      }

      procedureIds.push(procedureId);
      await Procedure.findOneAndUpdate(
        { procedureId },
        {
          customData,
        },
        {
          // returnNewDocument: true
        },
      );
    });
  }
};

const syncWithDemocracy = async () => {
  console.log('NamedPolls: syncWithDemocracy');

  const polls = await NamedPolls.find();

  await Promise.all(polls.map(poll => matchWithProcedure(poll)));

  await axios
    .post(`${CONSTANTS.DEMOCRACY.WEBHOOKS.UPDATE_PROCEDURES}`, {
      data: { procedureIds: [...new Set(procedureIds)], name: 'NamedPolls' },
      timeout: 1000 * 60 * 5,
    })
    .then(async response => {
      console.log(response.data);
    })
    .catch(error => {
      console.log(`democracy server error: ${error}`);
    });
  console.log('FINISH NAMED POLL SCRAPER');
  procedureIds = [];
};

const scraper = new Scraper();
export default async () => {
  console.log('START NAMED POLL SCRAPER');
  let startId = 1;
  const lastNamedPoll = await NamedPolls.findOne({}, { pollId: 1 }).sort({
    pollId: -1,
  });

  // Scrape one time a day all named polls
  if (lastNamedPoll) {
    const lastFullScrapeObj = await NamedPolls.findOne({}, { updatedAt: 1 }).sort({
      updatedAt: 1,
    });

    const lastFullScrape = new Date(lastFullScrapeObj.updatedAt);
    // Do your operations
    const curDate = new Date();
    const hours = (curDate.getTime() - lastFullScrape.getTime()) / 1000 / 60 / 60;
    startId = hours < 24 ? lastNamedPoll.pollId : startId;
  }

  scraper
    .scrape({
      startId,
      onData: checkDocuments,
      onFinish: syncWithDemocracy,
    })
    .catch(error => {
      console.error('ERROR: Named Polls', error);
    });
};
