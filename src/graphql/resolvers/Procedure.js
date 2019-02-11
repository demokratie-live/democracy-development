import axios from 'axios';
import diffHistory from 'mongoose-diff-history/diffHistory';
import { inspect } from 'util';

import CONFIG from '../../config';
import PROCEDURE_STATES from '../../config/procedureStates';

import History from '../../models/History';

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
              'customData.possibleVotingDate': { $exists: true },
            },
          ],
          currentStatus: { $nin: ['Zurückgezogen', 'Für erledigt erklärt'] },
        };
        const procedures = await ProcedureModel.find({ ...match }).sort({ updatedAt: 1 });

        return procedures.filter(procedure => {
          const pVoteDate = new Date(procedure.customData.possibleVotingDate);
          const hidePVoteDate = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
          // Hide possibleVotingDate Procedures older than 7 days or desicion newer
          if (
            !procedure.customData.expectedVotingDate &&
            (procedure.history.some(
              ({ initiator, date }) =>
                initiator.indexOf('Beschlussempfehlung und Bericht') === 0 &&
                pVoteDate < new Date(date),
            ) ||
              pVoteDate < hidePVoteDate)
          ) {
            return false;
          }

          return true;
        });
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

    procedureUpdates: async (parent, { period, type }, { ProcedureModel }) =>
      ProcedureModel.find({ period: { $in: period }, type: { $in: type } }),

    procedure: async (parent, { procedureId }, { ProcedureModel }) =>
      ProcedureModel.findOne({ procedureId }),
  },

  Mutation: {
    setExpectedVotingDate: async (
      parent,
      { procedureId, expectedVotingDate },
      { ProcedureModel },
    ) => {
      const procedure = await ProcedureModel.findOne({ procedureId });
      await ProcedureModel.update(
        { procedureId },
        {
          $set: {
            'customData.expectedVotingDate': new Date(expectedVotingDate),
          },
        },
        { new: true },
      );
      axios
        .post(`${CONFIG.DEMOCRACY_SERVER_WEBHOOK_URL}Procedures`, {
          data: {
            procedureIds: [procedure.procedureId],
            name: 'ChangeVoteData',
          },

          timeout: 1000 * 60 * 5,
        })
        .then(async response => {
          Log.debug(inspect(response.data));
        })
        .catch(error => {
          Log.error(`[DEMOCRACY Server] ${error}`);
        });

      return ProcedureModel.findOne({ procedureId });
    },
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

      axios
        .post(`${CONFIG.DEMOCRACY_SERVER_WEBHOOK_URL}Procedures`, {
          data: {
            procedureIds: [procedure.procedureId],
            name: 'ChangeVoteData',
          },

          timeout: 1000 * 60 * 5,
        })
        .then(async response => {
          Log.debug(inspect(response.data));
        })
        .catch(error => {
          Log.error(`democracy server error: ${inspect(error)}`);
        });

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
            if (decision.type === 'Namentliche Abstimmung') {
              return true;
            }
            return false;
          });
        }
        return false;
      });
      return namedVote;
    },
  },
};
