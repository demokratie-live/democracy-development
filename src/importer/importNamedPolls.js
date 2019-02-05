import _ from 'lodash';
import { Scraper } from '@democracy-deutschland/scapacra';
import { NamedPollScraperConfiguration } from '@democracy-deutschland/scapacra-bt';

import Procedure from '../models/Procedure';

export default async () => {
  console.log('START NAMED POLLS SCRAPER');
  await Scraper.scrape([new NamedPollScraperConfiguration()], dataPackages => {
    dataPackages.map(async dataPackage => {
      let procedureId = null;
      // TODO unify
      // currently the dip21 scraper returns document urls like so:
      // "http://dipbt.bundestag.de:80/dip21/btd/19/010/1901038.pdf
      // The named poll scraper returns them like so:
      // http://dip21.bundestag.de/dip21/btd/19/010/1901038.pdf
      const findSpotUrls = dataPackage.data.documents.map(document =>
        document.replace('http://dip21.bundestag.de/', 'http://dipbt.bundestag.de:80/'),
      );

      // Find matching Procedures
      let procedures = await Procedure.find({
        'history.findSpotUrl': { $all: findSpotUrls },
        'history.decision.type': 'Namentliche Abstimmung',
      });

      // Do we have to many macthes? Try to narrow down to one
      if (procedures.length > 1) {
        Log.warn(`Named Polls Scraper need to use comment on: ${dataPackage.metadata.url}`);
        procedures = await Procedure.find({
          'history.findSpotUrl': { $all: findSpotUrls },
          'history.decision.type': 'Namentliche Abstimmung',
          'history.decision.comment': new RegExp(
            `.*?${dataPackage.data.votes.all.yes}:${dataPackage.data.votes.all.no}:${
              dataPackage.data.votes.all.abstain
            }.*?`,
          ),
        });
      }

      // We did not find anything, Exclude Entschließungsantrag
      if (
        procedures.length === 0 &&
        dataPackage.data.title.indexOf('Entschließungsantrag') === -1
      ) {
        Log.error(`Named Polls Scraper no match on: ${dataPackage.metadata.url}`);
      }

      // We have exactly one match and can assign the procedureId
      if (procedures.length === 1) {
        [{ procedureId }] = procedures;
      }

      // Construct Database object
      const namedPoll = {
        procedureId,
        URL: dataPackage.metadata.url,
        webId: dataPackage.data.id,
        date: dataPackage.data.date,
        title: dataPackage.data.title,
        description: dataPackage.data.description,
        detailedDescription: dataPackage.data.detailedDescription,
        documents: dataPackage.data.documents,
        deputyVotesURL: dataPackage.data.deputyVotesURL,
        membersVoted: dataPackage.data.membersVoted,
        votes: dataPackage.data.votes,
        plenarProtocolURL: dataPackage.data.plenarProtocolURL,
        media: dataPackage.data.media,
        speeches: dataPackage.data.speeches,
      };

      // Update/Insert
      await NamedPollModel.update(
        { webId: namedPoll.webId },
        { $set: _.pickBy(namedPoll) },
        { upsert: true },
      );

      return null;
    });
  });
  console.log('FINISH NAMED POLLS SCRAPER');
};

/* import Scraper from '@democracy-deutschland/bt-named-polls';

import NamedPolls from './../models/NamedPolls';

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
*/
