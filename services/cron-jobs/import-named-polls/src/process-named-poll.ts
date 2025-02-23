import { LeanDocument, UpdateQuery } from 'mongoose';
import { IProcedure } from '@democracy-deutschland/bundestagio-common/dist/models/Procedure/schema';
import { INamedPoll } from '@democracy-deutschland/bundestagio-common/dist/models/NamedPoll/schema';
import { VoteDecision } from '@democracy-deutschland/bundestagio-common/dist/models/Procedure/Procedure/PartyVotes';
import { CRON_NAME } from './constants';
import {
  PROCEDURE as PROCEDURE_DEFINITIONS,
  NAMEDPOLL as NAMEDPOLL_DEFINITIONS,
} from '@democracy-deutschland/bundestag.io-definitions';
import { NamedPollModel, ProcedureModel } from '@democracy-deutschland/bundestagio-common';
import { PollUserData } from './crawler/types';

enum VotingDocument {
  MainDocument = 'mainDocument',
  RecommendedDecision = 'recommendedDecision',
}

export const processNamedPoll = async (data: PollUserData) => {
  process.stdout.write('.');
  let procedureId = null;
  const documentIdsRegexp = /(\d{2}\/\d{2,6})/g;
  const documentIds = [...new Set([...data.description.matchAll(documentIdsRegexp)].map((m) => m[1]))];

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

  // We need this for nested document votes.all -> to prevent update/history generation
  // This is retarded - but what u can do? ¯\_(ツ)_/¯
  // Find NamedPoll
  const existingNamedPoll = await NamedPollModel.findOne({
    webId: data.id,
  });

  let existingNamedPollObject: LeanDocument<INamedPoll> | null = null;

  if (existingNamedPoll) {
    existingNamedPollObject = existingNamedPoll.toObject();
  }

  const namedPoll = {
    ...existingNamedPollObject,
    procedureId,
    URL: data.url,
    webId: data.id,
    date: data.date,
    title: data.title,
    description: data.description,
    documents: data.documents,
    deputyVotesURL: data.deputyVotesURL,
  };

  if (existingNamedPoll?.votes?.all) {
    if (existingNamedPoll.votes.all.total !== data.votes.all.total) {
      namedPoll.votes = {
        ...(namedPoll.votes || {}),
        all: {
          ...(namedPoll.votes?.all || {}),
          total: data.votes.all.total,
          yes: data.votes.all.yes,
          no: data.votes.all.no,
          abstain: data.votes.all.abstain,
          na: data.votes.all.na,
        },
        parties: namedPoll.votes?.parties || [],
        deputies: namedPoll.votes?.deputies || [],
        inverseVoteDirection: namedPoll.votes?.inverseVoteDirection ?? false,
      };
    }
  } else {
    namedPoll.votes = {
      all: data.votes.all,
      parties: [],
      deputies: [],
      inverseVoteDirection: false,
    };
  }

  // Update Procedure Custom Data
  const { votes } = data;
  if (procedureId) {
    type CustomData = UpdateQuery<IProcedure>['customData'];
    const customData: CustomData = {
      voteResults: {
        partyVotes: votes.parties.map((partyVote) => {
          const decisions = [
            { decision: VoteDecision.Yes, value: partyVote.votes.yes },
            { decision: VoteDecision.No, value: partyVote.votes.no },
            { decision: VoteDecision.Abstination, value: partyVote.votes.abstain },
            { decision: VoteDecision.Notvoted, value: partyVote.votes.na },
          ];

          const main = decisions.reduce((prev, curr) => (prev.value < curr.value ? curr : prev), {
            decision: VoteDecision.Notvoted,
            value: 0,
          });

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
        decisionText: '',
        votingDocument: VotingDocument.MainDocument,
        votingRecommendation: false,
      },
    };

    // Determin Vote Direction
    const [{ history: histories }] = procedures as IProcedure[];

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

    // Handle voting recommendations
    if (
      namedHistoryEntry?.comment?.search(
        PROCEDURE_DEFINITIONS.HISTORY.DECISION.COMMENT.FIND_BESCHLUSSEMPFEHLUNG_ABLEHNUNG,
      ) !== -1
    ) {
      customData.voteResults.votingDocument = VotingDocument.RecommendedDecision;
    }

    votingRecommendationEntrys.forEach((entry) => {
      if (entry.abstract) {
        if (entry.abstract.search(PROCEDURE_DEFINITIONS.HISTORY.ABSTRACT.EMPFEHLUNG_VORLAGE_ANNAHME) !== -1) {
          customData.voteResults.votingRecommendation = true;
        } else if (entry.abstract.search(PROCEDURE_DEFINITIONS.HISTORY.ABSTRACT.EMPFEHLUNG_VORLAGE_ABLEHNUNG) !== -1) {
          customData.voteResults.votingRecommendation = false;
        }
      }
    });

    if (
      procedures?.[0]?.currentStatus === 'Abgelehnt' &&
      customData.voteResults.votingDocument === 'mainDocument' &&
      customData.voteResults.yes > customData.voteResults.no
    ) {
      customData.voteResults.votingDocument = VotingDocument.RecommendedDecision;
    }

    await ProcedureModel.findOneAndUpdate({ procedureId }, { customData });

    // Handle inverse vote direction
    const inverseVoteDirection =
      customData.voteResults.votingDocument === VotingDocument.RecommendedDecision &&
      customData.voteResults.votingRecommendation === false;

    if (!namedPoll.votes) {
      namedPoll.votes = {
        all: data.votes.all,
        parties: data.votes.parties,
        deputies: [],
        inverseVoteDirection,
      };
    } else {
      namedPoll.votes.parties = data.votes.parties;
      namedPoll.votes.inverseVoteDirection = inverseVoteDirection;
    }

    // Update parties if votes exists and changed
    if (
      namedPoll.votes &&
      (!existingNamedPoll?.votes?.parties ||
        JSON.stringify(existingNamedPoll.votes.parties) !== JSON.stringify(data.votes.parties))
    ) {
      namedPoll.votes.parties = data.votes.parties;
    }

    // votes.parties - remove this section since we handle it above
    /* if (
      !existingNamedPoll ||
      !existingNamedPoll.votes ||
      !(JSON.stringify(existingNamedPoll.votes.parties) === JSON.stringify(data.votes.parties))
    ) {
      namedPoll['votes.parties'] = data.votes.parties;
    } */
  }

  // Final update
  await NamedPollModel.findOneAndUpdate({ webId: namedPoll.webId }, { $set: namedPoll }, { upsert: true });

  console.log(`Named poll with webId: ${namedPoll.webId} processed successfully.`);
};
