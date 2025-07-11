import { Resolvers, VoteResults } from './types';
import { FilterQuery } from 'mongoose';

import { PROCEDURE as PROCEDURE_DEFINITIONS } from '@democracy-deutschland/bundestag.io-definitions';
import { xml2js } from 'xml-js';
import axios from 'axios';
import PROCEDURE_STATES from '../../config/procedureStates';
import { IProcedure } from '@democracy-deutschland/bundestagio-common/dist/models/Procedure/schema';
import { ConferenceWeekDetailModel } from '@democracy-deutschland/bundestagio-common';

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
  20: {
    Linke: 39,
    SPD: 206,
    Grüne: 118,
    'B90/Grüne': 118,
    CDU: 197,
    Union: 197,
    'CDU/CSU': 197,
    FDP: 92,
    AFD: 82,
    AfD: 82,
    Andere: 2,
    Fraktionslos: 2,
  },
  21: {
    Linke: 64,
    SPD: 120,
    Grüne: 85,
    'B90/Grüne': 85,
    CDU: 208,
    Union: 208,
    'CDU/CSU': 208,
    AFD: 151,
    AfD: 151,
    Andere: 2,
    Fraktionslos: 2,
  },
};

const ProcedureResolvers: Resolvers = {
  Query: {
    procedures: async (
      parent,
      {
        IDs,
        period = [19],
        type = [PROCEDURE_DEFINITIONS.TYPE.GESETZGEBUNG, PROCEDURE_DEFINITIONS.TYPE.ANTRAG],
        status,
        voteDate,
        manageVoteDate = false,
        limit = 99999,
        offset = 0,
      },
      { ProcedureModel },
    ) => {
      let match: FilterQuery<IProcedure> = { period: { $in: period }, type: { $in: type } };
      if (voteDate) {
        match = {
          ...match,
          history: {
            $elemMatch: {
              decision: {
                $elemMatch: {
                  tenor: {
                    $in: [
                      PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR.VORLAGE_ABLEHNUNG,
                      PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR.VORLAGE_ANNAHME,
                    ],
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
          'customData.voteResults.yes': { $not: { $gte: 1 } },
          $or: [
            {
              history: {
                $elemMatch: {
                  decision: {
                    $elemMatch: {
                      tenor: {
                        $in: [
                          PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR.VORLAGE_ABLEHNUNG,
                          PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR.VORLAGE_ANNAHME,
                          PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR.VORLAGE_ERLEDIGT,
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
          currentStatus: {
            $nin: [
              PROCEDURE_DEFINITIONS.STATUS.ZURUECKGEZOGEN,
              PROCEDURE_DEFINITIONS.STATUS.ERLEDIGT,
            ],
          },
        };

        return ProcedureModel.find({ ...match }).sort({ updatedAt: 1 });
      }

      if (status) {
        match = { ...match, currentStatus: { $in: status } };
      }
      if (IDs) {
        match = { ...match, procedureId: { $in: IDs } };
      }
      return ProcedureModel.find(match).skip(offset).limit(limit);
    },

    proceduresData: async (
      parent,
      {
        IDs,
        period,
        type = [PROCEDURE_DEFINITIONS.TYPE.GESETZGEBUNG, PROCEDURE_DEFINITIONS.TYPE.ANTRAG],
        status,
        voteDate,
        manageVoteDate = false,
        limit = 99999,
        offset = 0,
      },
      { ProcedureModel },
    ) => {
      let match: FilterQuery<IProcedure> = { period: { $in: period }, type: { $in: type } };
      if (voteDate) {
        match = {
          ...match,
          history: {
            $elemMatch: {
              decision: {
                $elemMatch: {
                  tenor: {
                    $in: [
                      PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR.VORLAGE_ABLEHNUNG,
                      PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR.VORLAGE_ANNAHME,
                    ],
                  },
                },
              },
            },
          },
        };
        return {
          nodes: await ProcedureModel.find({ ...match })
            .sort({ createdAt: 1 })
            .skip(offset)
            .limit(limit),
          totalCount: await ProcedureModel.count({ ...match }),
        };
      }

      if (manageVoteDate) {
        match = {
          ...match,
          'customData.voteResults.yes': { $not: { $gte: 1 } },
          $or: [
            {
              history: {
                $elemMatch: {
                  decision: {
                    $elemMatch: {
                      tenor: {
                        $in: [
                          PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR.VORLAGE_ABLEHNUNG,
                          PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR.VORLAGE_ANNAHME,
                          PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR.VORLAGE_ERLEDIGT,
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
          currentStatus: {
            $nin: [
              PROCEDURE_DEFINITIONS.STATUS.ZURUECKGEZOGEN,
              PROCEDURE_DEFINITIONS.STATUS.ERLEDIGT,
            ],
          },
        };

        return {
          nodes: await ProcedureModel.find({ ...match })
            .sort({ updatedAt: 1 })
            .skip(offset)
            .limit(limit),
          totalCount: await ProcedureModel.count({ ...match }),
        };
      }

      if (status) {
        match = { ...match, currentStatus: { $in: status } };
      }
      if (IDs) {
        match = { ...match, procedureId: { $in: IDs } };
      }
      return {
        nodes: await ProcedureModel.find(match).skip(offset).limit(limit),
        totalCount: await ProcedureModel.count(match),
      };
    },

    allProcedures: async (
      parent,
      {
        period = [19],
        type = [PROCEDURE_DEFINITIONS.TYPE.GESETZGEBUNG, PROCEDURE_DEFINITIONS.TYPE.ANTRAG],
      },
      { ProcedureModel },
    ) =>
      ProcedureModel.find({
        period: { $in: period },
        type: { $in: type },
      }),

    procedureUpdates: async (
      parent,
      { limit = 99, offset = 0, periods, types },
      { ProcedureModel },
    ) => {
      const periodMatch = periods ? { period: { $in: periods } } : {};
      const typesMatch = types ? { type: { $in: types } } : {};
      const beforeCount = await ProcedureModel.count({
        ...periodMatch,
        ...typesMatch,
      });
      const afterCount = await ProcedureModel.count({
        ...periodMatch,
        ...typesMatch,
      });

      const proceduresFindQuery = {
        ...periodMatch,
        ...typesMatch,
      };

      const changed = await ProcedureModel.count(proceduresFindQuery);

      const procedures = await ProcedureModel.find(
        proceduresFindQuery,
        {},
        { skip: offset, limit },
      );
      return {
        beforeCount,
        afterCount,
        newCount: afterCount - beforeCount,
        changedCount: changed,
        procedures,
      };
    },

    procedure: async (parent, { procedureId }, { ProcedureModel }) =>
      ProcedureModel.findOne({ procedureId }),

    voteResultTextHelper: async (
      parent,
      { procedureId },
      { PlenaryMinuteModel, ProcedureModel },
    ) => {
      const procedure = await ProcedureModel.findOne({ procedureId });
      const docNumbers = procedure.importantDocuments.map(({ number }) => number);

      const flattenElements = (elements) => {
        return elements.reduce((prev, el) => {
          if (Array.isArray(el.elements)) {
            return [...prev, ...flattenElements(el.elements)];
          } else if (el.type === 'text') {
            return [...prev, el.text];
          }
          return prev;
        }, []);
      };

      if (procedure) {
        const axiosInstance = axios.create();
        const date = procedure.voteDate;

        if (!date) {
          throw new Error('No vote date found');
        }

        const conferenceWeekDetail = await ConferenceWeekDetailModel.findOne({
          'sessions.date': {
            $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            $lte: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
          },
        });

        const session = conferenceWeekDetail.sessions.find((s) => {
          if (s.date.getDate() === date.getDate()) {
            return true;
          }
          return false;
        });

        if (!session) {
          return null;
        }
        const plenaryMinute = await PlenaryMinuteModel.findOne({
          meeting: parseInt(session.session),
          period: procedure.period,
        });

        console.log('plenaryMinute', plenaryMinute);

        if (plenaryMinute) {
          const { data } = await axiosInstance.get(plenaryMinute.xml);
          const json = await xml2js(data, {
            compact: false,
          });
          const protocol = json.elements.find(({ name }) => name === 'dbtplenarprotokoll');
          const sessionHistory = protocol.elements.find(({ name }) => name === 'sitzungsverlauf');

          const output = flattenElements(sessionHistory.elements);
          const resultIndexes = output.reduce((prev, text, index) => {
            const matches = docNumbers.filter((number) => text.indexOf(number) !== -1);
            if (matches.length > 0) {
              return [...prev, index];
            }
            return prev;
          }, []);

          const outputLines = resultIndexes.reduce((prev, line) => {
            return [
              ...prev,
              {
                results: [
                  output[line - 1],
                  output[line],
                  output[line + 1] || '',
                  output[line + 2] || '',
                  output[line + 3] || '',
                  output[line + 4] || '',
                  output[line + 5] || '',
                ],
              },
            ];
          }, []);

          return outputLines;
        }
        return null;
      }
    },
  },

  Mutation: {
    saveProcedureCustomData: async (
      parent,
      { procedureId, partyVotes, decisionText, votingDocument, toggleDecision },
      { ProcedureModel },
    ) => {
      const procedure = await ProcedureModel.findOne({ procedureId });

      let voteResults: VoteResults = {
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

        voteResults = {
          ...voteResults,
          partyVotes: partyResults,
          ...sumResults,
        };

        voteResults.votingRecommendation = toggleDecision;
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
    saveProcedurenamedPollCustomData: async (
      _parent,
      { procedureId, toggleDecision },
      { ProcedureModel },
    ) => {
      const procedure = await ProcedureModel.findOne({ procedureId });
      const { voteResults } = procedure.customData;
      voteResults.votingRecommendation = toggleDecision;

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
    currentStatusHistory: async (_procedure) => {
      // TODO find replacement for current status history
      // previously it was resolved by a bad working mongodb history model
      return [];
    },
    namedVote: (procedure) => {
      const namedVote = procedure.history.some((h) => {
        if (h.decision) {
          return h.decision.some((decision) => {
            if (
              decision.type ===
                PROCEDURE_DEFINITIONS.HISTORY.DECISION.TYPE.NAMENTLICHE_ABSTIMMUNG &&
              decision.tenor.search(
                PROCEDURE_DEFINITIONS.HISTORY.DECISION.TENOR.FIND_AENDERUNGSANTRAG,
              ) === -1
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
    sessions: async (procedure, _, { ConferenceWeekDetailModel }) =>
      ConferenceWeekDetailModel.aggregate([
        {
          $match: {
            'sessions.tops.topic.procedureIds': procedure.procedureId,
          },
        },
        { $unwind: '$sessions' },
        { $addFields: { session: '$sessions' } },
        { $project: { sessions: 0 } },
        { $unwind: '$session.tops' },
        { $addFields: { 'session.top': '$session.tops' } },
        { $project: { 'session.tops': 0 } },
        { $unwind: '$session.top.topic' },
        { $unwind: '$session.top.topic.procedureIds' },
        { $addFields: { 'session.top.topic.procedureId': '$session.top.topic.procedureIds' } },
        { $project: { 'session.top.topic.procedureIds': 0 } },
        { $match: { 'session.top.topic.procedureId': procedure.procedureId } },
      ]),
  },
};

export default ProcedureResolvers;
