import diffHistory from 'mongoose-diff-history/diffHistory';

import PROCEDURE_STATES from '../../config/procedureStates';

import History from '../../models/History';
import ConferenceWeekDetail from '../../models/ConferenceWeekDetail';

const deputiesNumber = {
  19: {
    Linke: 69,
    SPD: 153,
    Grüne: 67,
    'B90/Grüne': 67,
    CDU: 246,
    Union: 246,
    'CDU/CSU': 246,
    FDP: 80,
    AFD: 92,
    AfD: 92,
    Andere: 2,
    Fraktionslos: 2,
  },
};

export default {
  Query: {
    procedures: async (
      parent,
      {
        IDs,
        period = [19],
        type = ['Gesetzgebung', 'Antrag'],
        status,
        voteDate,
        manageVoteDate = false,
        limit = 99999,
        offset = 0,
      },
      { ProcedureModel },
    ) => {
      let match = { period: { $in: period }, type: { $in: type } };
      if (voteDate) {
        match = {
          ...match,
          history: {
            $elemMatch: {
              decision: {
                $elemMatch: {
                  tenor: {
                    $in: ['Ablehnung der Vorlage', 'Annahme der Vorlage'],
                  },
                },
              },
            },
          },
        };
        return ProcedureModel.find({ ...match })
          .sort({ createdAt: 1 })
          .skip(offset)
          .limit(limit);
      }

      if (manageVoteDate) {
        match = {
          ...match,
          $or: [
            {
              history: {
                $elemMatch: {
                  decision: {
                    $elemMatch: {
                      tenor: {
                        $in: [
                          'Ablehnung der Vorlage',
                          'Annahme der Vorlage',
                          'Erklärung der Vorlage für erledigt',
                        ],
                      },
                    },
                  },
                },
              },
            },
            {
              currentStatus: { $in: PROCEDURE_STATES.COMPLETED },
            },
            {
              voteDate: { $lte: new Date() },
            },
          ],
          currentStatus: { $nin: ['Zurückgezogen', 'Für erledigt erklärt'] },
        };
        return ProcedureModel.find({ ...match }).sort({ updatedAt: 1 });
      }

      if (status) {
        match = { ...match, currentStatus: { $in: status } };
      }
      if (IDs) {
        match = { ...match, procedureId: { $in: IDs } };
      }
      return ProcedureModel.find(match)
        .skip(offset)
        .limit(limit);
    },

    allProcedures: async (
      parent,
      { period = [19], type = ['Gesetzgebung', 'Antrag'] },
      { ProcedureModel },
    ) => ProcedureModel.find({ period: { $in: period }, type: { $in: type } }),

    procedureUpdates: async (
      parent,
      { since, limit = 99, offset = 0 },
      { ProcedureModel, HistoryModel },
    ) => {
      const beforeCount = await ProcedureModel.count({ createdAt: { $lte: since } });
      const afterCount = await ProcedureModel.count({});
      const changed = await HistoryModel.aggregate([
        {
          $match: {
            collectionName: 'Procedure',
            createdAt: { $gt: since },
          },
        },
        { $group: { _id: '$collectionId' } },
      ]);

      // Build find query for namedPolls
      const proceduresFindQuery = {
        $or: [{ createdAt: { $gt: since } }, { _id: { $in: changed } }],
      };

      const procedures = await ProcedureModel.find(
        proceduresFindQuery,
        {},
        // Even tho the index for createdAt is set - the memory limit is reached - therefore no sort
        { /* sort: { createdAt: 1 }, */ skip: offset, limit },
      );
      return {
        beforeCount,
        afterCount,
        newCount: afterCount - beforeCount,
        changedCount: changed.length,
        procedures,
      };
    },

    procedure: async (parent, { procedureId }, { ProcedureModel }) =>
      ProcedureModel.findOne({ procedureId }),
  },

  Mutation: {
    saveProcedureCustomData: async (
      parent,
      { procedureId, partyVotes, decisionText, votingDocument },
      { ProcedureModel },
    ) => {
      const procedure = await ProcedureModel.findOne({ procedureId });

      let voteResults = {
        partyVotes,
        decisionText: decisionText.trim(),
        votingDocument,
      };

      if (deputiesNumber[procedure.period]) {
        const sumResults = {
          yes: 0,
          abstination: 0,
          no: 0,
        };
        const partyResults = partyVotes.map(({ party, main, deviants: partyDeviants }) => {
          const deviants = { ...partyDeviants };
          switch (main) {
            case 'YES':
              deviants.yes =
                deputiesNumber[procedure.period][party] - deviants.abstination - deviants.no;
              break;
            case 'ABSTINATION':
              deviants.abstination =
                deputiesNumber[procedure.period][party] - deviants.yes - deviants.no;
              break;
            case 'NO':
              deviants.no =
                deputiesNumber[procedure.period][party] - deviants.yes - deviants.abstination;
              break;

            default:
              break;
          }
          sumResults.yes += deviants.yes;
          sumResults.abstination += deviants.abstination;
          sumResults.no += deviants.no;
          return { party, main, deviants };
        });

        const votingRecommendationEntry = procedure.history.find(
          ({ initiator }) =>
            initiator && initiator.indexOf('Beschlussempfehlung und Bericht') !== -1,
        );

        voteResults = {
          ...voteResults,
          partyVotes: partyResults,
          ...sumResults,
        };

        if (votingRecommendationEntry) {
          switch (votingRecommendationEntry.abstract) {
            case 'Empfehlung: Annahme der Vorlage':
              voteResults.votingRecommendation = true;
              break;
            case 'Empfehlung: Ablehnung der Vorlage':
              voteResults.votingRecommendation = false;
              break;

            default:
              break;
          }
        }
      }

      await ProcedureModel.update(
        { procedureId },
        {
          $set: {
            'customData.voteResults': { ...voteResults },
          },
        },
      );
      return ProcedureModel.findOne({ procedureId });
    },
  },

  Procedure: {
    bioUpdateAt: async procedure => {
      const h = await History.findOne({ collectionId: procedure }, { createdAt: 1 }).sort({
        createdAt: -1,
      });
      if (h) {
        return h.createdAt;
      }
      return null;
    },

    currentStatusHistory: async procedure => {
      const { _id } = procedure;
      const history = await diffHistory.getDiffs('Procedure', _id).then(histories =>
        histories.reduce((prev, version) => {
          const cur = prev;
          if (version.diff.currentStatus) {
            if (cur.length === 0) {
              cur.push(version.diff.currentStatus[0]);
            }
            cur.push(version.diff.currentStatus[1]);
          }
          return cur;
        }, []),
      );
      return history;
    },
    namedVote: procedure => {
      const namedVote = procedure.history.some(h => {
        if (h.decision) {
          return h.decision.some(decision => {
            if (
              decision.type === 'Namentliche Abstimmung' &&
              decision.tenor.search(/.*?Änderungsantrag.*?/) === -1
            ) {
              return true;
            }
            return false;
          });
        }
        return false;
      });
      return namedVote;
    },
    sessions: async procedure => {
      return await ConferenceWeekDetail.aggregate([
          {$unwind:"$sessions"},
          {$addFields: {session: "$sessions"}},
          {$project: {sessions: 0}},
          {$unwind:"$session.tops"},
          {$addFields: {'session.top': "$session.tops"}},
          {$project: {'session.tops': 0}},
          {$unwind:"$session.top.topic"},
          {$match:{"session.top.topic.procedureIds": procedure.procedureId}},
      ]);
    }
  },
};
