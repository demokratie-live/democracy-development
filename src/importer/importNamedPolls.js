import { Scraper } from '@democracy-deutschland/scapacra';
import { NamedPollScraperConfiguration } from '@democracy-deutschland/scapacra-bt';

import Procedure from '../models/Procedure';
import NamedPoll from '../models/NamedPoll';

export default async () => {
  Log.info('START NAMED POLLS SCRAPER');
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

      // Find matching Procedures - using harsh criteria
      // To validate:
      /*
        // Multimatches/Unmatched
        db.getCollection('namedpolls').aggregate([
            {
                $group: {
                    _id: '$procedureId',
                    count: {$sum: 1}
                }
            },
            {
                $match: {
                    count: {$ne: 1.0}
                }
            }
        ])

        // Exact matches
        db.getCollection('namedpolls').aggregate([
            {
                $group: {
                    _id: '$procedureId',
                    count: {$sum: 1}
                }
            },
            {
                $match: {
                    count: {$eq: 1.0}
                }
            },
            {
                $group: {
                    _id: 'count',
                    count: {$sum: 1}
                }
            }
        ])
      */
      const procedures = await Procedure.find({
        'history.findSpotUrl': { $all: findSpotUrls },
        'history.decision': {
          $elemMatch: {
            type: 'Namentliche Abstimmung',
            tenor: { $not: /.*?Änderungsantrag.*?/ },
            comment: new RegExp(
              `.*?${dataPackage.data.votes.all.yes}:${dataPackage.data.votes.all.no}:${
                dataPackage.data.votes.all.abstain
              }.*?`,
            ),
          },
        },
      });

      // We did find too many
      if (procedures.length > 1) {
        Log.error(`Named Polls Scraper duplicate match on: ${dataPackage.metadata.url}`);
      }

      // We did not find anything
      if (procedures.length === 0) {
        Log.warn(`Named Polls Scraper no match on: ${dataPackage.metadata.url}`);
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
        plenarProtocolURL: dataPackage.data.plenarProtocolURL,
        media: dataPackage.data.media,
        speeches: dataPackage.data.speeches,
      };

      // We need this for nested document votes.all -> to prevent update/history generation
      // This is retarded - but what u can do? ¯\_(ツ)_/¯
      // Find NamedPoll
      const existingNamedPoll = await NamedPoll.findOne({ webId: namedPoll.webId });
      if (existingNamedPoll && existingNamedPoll.votes && existingNamedPoll.votes.all) {
        if (existingNamedPoll.votes.all.total !== dataPackage.data.votes.all.total) {
          namedPoll['votes.all.total'] = dataPackage.data.votes.all.total;
        }
        if (existingNamedPoll.votes.all.yes !== dataPackage.data.votes.all.yes) {
          namedPoll['votes.all.yes'] = dataPackage.data.votes.all.yes;
        }
        if (existingNamedPoll.votes.all.no !== dataPackage.data.votes.all.no) {
          namedPoll['votes.all.no'] = dataPackage.data.votes.all.no;
        }
        if (existingNamedPoll.votes.all.abstain !== dataPackage.data.votes.all.abstain) {
          namedPoll['votes.all.abstain'] = dataPackage.data.votes.all.abstain;
        }
        if (existingNamedPoll.votes.all.na !== dataPackage.data.votes.all.na) {
          namedPoll['votes.all.na'] = dataPackage.data.votes.all.na;
        }
      } else {
        namedPoll['votes.all'] = dataPackage.data.votes.all;
      }

      // Update/Insert
      await NamedPoll.update(
        { webId: namedPoll.webId },
        {
          $set: namedPoll,
          $addToSet: {
            'votes.parties': dataPackage.data.votes.parties,
          },
        },
        { upsert: true },
      );

      // Update Procedure Custom Data
      // TODO This should not be the way we handle this
      const { votes } = dataPackage.data;
      if (procedureId) {
        const customData = {
          voteResults: {
            partyVotes: votes.parties.map(partyVote => {
              const main = [
                {
                  decision: 'YES',
                  value: partyVote.votes.yes,
                },
                {
                  decision: 'NO',
                  value: partyVote.votes.no,
                },
                {
                  decision: 'ABSTINATION',
                  value: partyVote.votes.abstain,
                },
                {
                  decision: 'NOTVOTED',
                  value: partyVote.votes.na,
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
                  yes: partyVote.votes.yes || 0,
                  abstination: partyVote.votes.abstain || 0,
                  no: partyVote.votes.no || 0,
                  notVoted: partyVote.votes.na || 0,
                },
                party: partyVote.name,
                main: main.decision,
              };
            }),
            yes: votes.all.yes || 0,
            abstination: votes.all.abstain || 0,
            no: votes.all.no || 0,
            notVoted: votes.all.na || 0,
          },
        };

        // TODO WTF?
        const [{ history }] = procedures;
        const namedHistoryEntry = history
          .find(
            ({ decision }) =>
              decision && decision.find(({ type }) => type === 'Namentliche Abstimmung'),
          )
          .decision.find(({ type }) => type === 'Namentliche Abstimmung');

        const votingRecommendationEntry = history.find(
          ({ initiator }) =>
            initiator && initiator.indexOf('Beschlussempfehlung und Bericht') !== -1,
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

        await Procedure.findOneAndUpdate({ procedureId }, { customData });
      }

      return null;
    });
  });

  // Validate Data - find duplicate matches which is an error!
  const duplicateMatches = await NamedPoll.aggregate([
    {
      $group: {
        _id: '$procedureId',
        count: { $sum: 1 },
      },
    },
    {
      $match: {
        count: { $ne: 1.0 },
        _id: { $ne: null },
      },
    },
  ]);
  if (duplicateMatches.length !== 0) {
    Log.error(`Duplicate Matches on: ${JSON.stringify(duplicateMatches)}`);
  }

  Log.info('FINISH NAMED POLLS SCRAPER');
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
