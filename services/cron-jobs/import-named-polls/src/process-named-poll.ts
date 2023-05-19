import { IProcedure } from '@democracy-deutschland/bundestagio-common/dist/models/Procedure/schema';
import {
  PROCEDURE as PROCEDURE_DEFINITIONS,
  NAMEDPOLL as NAMEDPOLL_DEFINITIONS,
} from '@democracy-deutschland/bundestag.io-definitions';
import { CRON_NAME } from './constants';
import { NamedPollModel, ProcedureModel } from '@democracy-deutschland/bundestagio-common';

export const processNamedPoll = async (data: any) => {
  process.stdout.write('.');
  let procedureId = null;
  const documentIdsRegexp = /(\d{2}\/\d{2,6})/g;
  const documentIds = [...new Set([...data.description.matchAll(documentIdsRegexp)].map((m: any) => m[1]))];

  if (documentIds.length === 0) {
    console.warn(`\n[Cronjob][${CRON_NAME}] no documents on poll ${data.url}`);
    return;
  }

  let procedures;
  // Only match those which are not an Änderungsantrag
  if (
    data.title.search(NAMEDPOLL_DEFINITIONS.TITLE.FIND_AENDERUNGSANTRAG_OR_ENTSCHLIESSUNGSANTRAG_OR_EINSPRUCH) === -1 &&
    data.description.search(
      NAMEDPOLL_DEFINITIONS.DESCRIPTION.FIND_AENDERUNGSANTRAG_OR_ENTSCHLIESSUNGSANTRAG_OR_EINSPRUCH,
    ) === -1
  ) {
    const documentRegex = new RegExp(`${documentIds.map((d) => d.replace('/', '/')).join('|')}`, 'g');

    // Find matching Procedures
    procedures = await ProcedureModel.find({
      importantDocuments: {
        $elemMatch: { type: { $in: ['Antrag', 'Gesetzentwurf'] }, number: { $in: documentIds } },
      },
      'history.decision.document': { $regex: documentRegex },
      'history.decision': {
        $elemMatch: {
          type: PROCEDURE_DEFINITIONS.HISTORY.DECISION.TYPE.NAMENTLICHE_ABSTIMMUNG,
          tenor: {
            $not: PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR.FIND_AENDERUNGSANTRAG,
          },
        },
      },
    });

    // We have exactly one match and can assign the procedureId
    if (procedures.length === 1) {
      [{ procedureId }] = procedures;
    }

    // We did find too many
    else if (procedures.length > 1) {
      console.error(`\n[Cronjob][${CRON_NAME}] duplicate Procedure match on: ${data.url}`);
    }

    // We did not find anything
    else if (procedures.length === 0) {
      console.warn(`\n[Cronjob][${CRON_NAME}] no Procedure match on: ${data.url}`);
    }
  }
  // Construct Database object
  const namedPoll: any = {
    procedureId,
    URL: data.url,
    webId: data.id,
    date: data.date,
    title: data.title,
    description: data.description,
    detailedDescription: data.detailedDescription,
    documents: data.documents,
    deputyVotesURL: data.deputyVotesURL,
    membersVoted: data.membersVoted,
    plenarProtocolURL: data.plenarProtocolURL,
    media: data.media,
    speeches: data.speeches,
  };

  // We need this for nested document votes.all -> to prevent update/history generation
  // This is retarded - but what u can do? ¯\_(ツ)_/¯
  // Find NamedPoll
  const existingNamedPoll = await NamedPollModel.findOne({
    webId: namedPoll.webId,
  });
  if (existingNamedPoll && existingNamedPoll.votes && existingNamedPoll.votes.all) {
    if (existingNamedPoll.votes.all.total !== data.votes.all.total) {
      namedPoll['votes.all.total'] = data.votes.all.total;
    }
    if (existingNamedPoll.votes.all.yes !== data.votes.all.yes) {
      namedPoll['votes.all.yes'] = data.votes.all.yes;
    }
    if (existingNamedPoll.votes.all.no !== data.votes.all.no) {
      namedPoll['votes.all.no'] = data.votes.all.no;
    }
    if (existingNamedPoll.votes.all.abstain !== data.votes.all.abstain) {
      namedPoll['votes.all.abstain'] = data.votes.all.abstain;
    }
    if (existingNamedPoll.votes.all.na !== data.votes.all.na) {
      namedPoll['votes.all.na'] = data.votes.all.na;
    }
  } else {
    namedPoll['votes.all'] = data.votes.all;
  }

  // Update Procedure Custom Data
  // TODO This should not be the way we handle this
  const { votes } = data;
  if (procedureId) {
    const customData = {
      voteResults: {
        partyVotes: votes.parties.map((partyVote: any) => {
          const main: any = [
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
      } as any,
    };

    // Determin Vote Direction
    let [{ history: histories }] = procedures as IProcedure[];

    const namedHistoryEntry = histories
      .find(
        (history) =>
          history.decision &&
          history.decision.find(
            (decision) =>
              decision.type && decision.type === PROCEDURE_DEFINITIONS.HISTORY.DECISION.TYPE.NAMENTLICHE_ABSTIMMUNG,
          ),
      )
      ?.decision.find(({ type }) => type === PROCEDURE_DEFINITIONS.HISTORY.DECISION.TYPE.NAMENTLICHE_ABSTIMMUNG);

    const votingRecommendationEntrys = histories.filter(
      ({ initiator }) =>
        initiator && initiator.search(PROCEDURE_DEFINITIONS.HISTORY.INITIATOR.FIND_BESCHLUSSEMPFEHLUNG_BERICHT) !== -1,
    );

    customData.voteResults.votingDocument =
      namedHistoryEntry?.comment?.search(
        PROCEDURE_DEFINITIONS.HISTORY.DECISION.COMMENT.FIND_BESCHLUSSEMPFEHLUNG_ABLEHNUNG,
      ) !== -1
        ? 'recommendedDecision'
        : 'mainDocument';

    votingRecommendationEntrys.forEach((votingRecommendationEntry) => {
      if (votingRecommendationEntry.abstract) {
        if (
          votingRecommendationEntry.abstract.search(
            PROCEDURE_DEFINITIONS.HISTORY.ABSTRACT.EMPFEHLUNG_VORLAGE_ANNAHME,
          ) !== -1
        ) {
          customData.voteResults.votingRecommendation = true;
        } else if (
          votingRecommendationEntry.abstract.search(
            PROCEDURE_DEFINITIONS.HISTORY.ABSTRACT.EMPFEHLUNG_VORLAGE_ABLEHNUNG,
          ) !== -1
        ) {
          customData.voteResults.votingRecommendation = false;
        }
      }
    });

    if (
      procedures &&
      procedures[0] &&
      procedures[0].currentStatus === 'Abgelehnt' &&
      customData.voteResults.votingDocument === 'mainDocument' &&
      customData.voteResults.yes > customData.voteResults.no
    ) {
      // Toggle Voting Document
      customData.voteResults.votingDocument = 'recommendedDecision';
    }

    await ProcedureModel.findOneAndUpdate({ procedureId }, { customData });

    // Define inverseVoteDirection on NamedPoll
    const inverseVoteDirection =
      customData.voteResults.votingDocument === 'recommendedDecision' &&
      customData.voteResults.votingRecommendation === false;
    if (
      !existingNamedPoll ||
      !existingNamedPoll.votes ||
      !(existingNamedPoll.votes.inverseVoteDirection === inverseVoteDirection)
    ) {
      namedPoll['votes.inverseVoteDirection'] = inverseVoteDirection;
    }
  }

  // votes.parties
  if (
    !existingNamedPoll ||
    !existingNamedPoll.votes ||
    !(JSON.stringify(existingNamedPoll.votes.parties) === JSON.stringify(data.votes.parties))
  ) {
    namedPoll['votes.parties'] = data.votes.parties;
  }

  // Update/Insert
  await NamedPollModel.findOneAndUpdate({ webId: namedPoll.webId }, { $set: namedPoll }, { upsert: true });
};
