/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

import { PROCEDURE as PROCEDURE_DEFINITIONS } from '@democracy-deutschland/bundestag.io-definitions';
import { Vote, IDeputy } from '@democracy-deutschland/democracy-common';
import { Types } from 'mongoose';
import { MongooseFilterQuery } from 'mongoose';
import CONFIG from '../../config';
import PROCEDURE_STATES from '../../config/procedureStates';
import { Resolvers, VoteSelection } from '../../generated/graphql';
import { logger } from '../../services/logger';
import { GraphQlContext } from '../../types/graphqlContext';
import ActivityApi from './Activity';

const queryVotes = async (
  _parent: any,
  { procedure, constituencies }: { procedure: string; constituencies: string[] | null | undefined },
  {
    VoteModel,
    device,
    phone,
  }: {
    VoteModel: GraphQlContext['VoteModel'];
    device: GraphQlContext['device'];
    phone: GraphQlContext['phone'];
  },
) => {
  logger.graphql('Vote.query.votes');

  // Has user voted?
  const voted = await VoteModel.findOne({
    procedure,
    type: CONFIG.SMS_VERIFICATION ? 'Phone' : 'Device',
    voters: {
      voter: CONFIG.SMS_VERIFICATION ? phone : device,
    },
  });

  const procedureId = Types.ObjectId.isValid(procedure) ? Types.ObjectId(procedure) : null;

  // Find global result(cache), not including constituencies
  const votesGlobal = await VoteModel.aggregate([
    // Find Procedure, including type; results in up to two objects for state
    {
      $match: {
        procedure: procedureId,
        type: CONFIG.SMS_VERIFICATION ? 'Phone' : 'Device',
      },
    },
    // Sum both objects (state)
    {
      $group: {
        _id: '$procedure',
        yes: { $sum: '$votes.cache.yes' },
        no: { $sum: '$votes.cache.no' },
        abstain: { $sum: '$votes.cache.abstain' },
      },
    },
    // Add voted state from previous query
    { $addFields: { voted: !!voted } },
    // Build correct result
    {
      $project: {
        _id: true,
        voted: true,
        voteResults: {
          yes: '$yes',
          no: '$no',
          abstination: '$abstain',
          total: { $add: ['$yes', '$no', '$abstain'] },
        },
      },
    },
  ]);

  // Find constituency results if constituencies are given
  const votesConstituencies =
    (constituencies && constituencies.length > 0) ||
    constituencies === undefined ||
    constituencies === null
      ? await VoteModel.aggregate([
          // Find Procedure, including type; results in up to two objects for state
          {
            $match: {
              procedure,
              type: CONFIG.SMS_VERIFICATION ? 'Phone' : 'Device',
            },
          },
          // Filter correct constituency
          {
            $project: {
              votes: {
                constituencies: {
                  $filter: {
                    input: '$votes.constituencies',
                    as: 'constituency',
                    cond: !constituencies
                      ? true // Return all Constituencies if constituencies param is not given
                      : { $in: ['$$constituency.constituency', constituencies] }, // Filter Constituencies if an array is given
                  },
                },
              },
            },
          },
          // Unwind constituencies for sum, but preserve null
          {
            $unwind: {
              path: '$votes.constituencies',
              preserveNullAndEmptyArrays: true,
            },
          },
          // Sum both objects (state)
          {
            $group: {
              _id: '$votes.constituencies.constituency',
              yes: { $sum: '$votes.constituencies.yes' },
              no: { $sum: '$votes.constituencies.no' },
              abstain: { $sum: '$votes.constituencies.abstain' },
            },
          },
          // Build correct result
          {
            $project: {
              _id: false,
              constituency: '$_id',
              yes: '$yes',
              no: '$no',
              abstination: '$abstain',
              total: { $add: ['$yes', '$no', '$abstain'] },
            },
          },
        ])
          // TODO Change query to make the filter obsolet (preserveNullAndEmptyArrays)
          // Remove elements with property constituency: null (of no votes on it)
          .then((data) => data.filter(({ constituency }) => constituency))
      : [];

  if (votesGlobal.length > 0) {
    votesGlobal[0].voteResults.constituencies = votesConstituencies;
    return votesGlobal[0];
  }
  return {
    voted: false,
    voteResults: { yes: null, no: null, abstination: null, constituencies: [] },
  };
};

const VoteApi: Resolvers = {
  Query: {
    // Used by App
    votes: async (_parent: any, { procedure, constituencies }, { VoteModel, device, phone }) => {
      return queryVotes(_parent, { procedure, constituencies }, { VoteModel, device, phone });
    },
    // Used by Browserverion -> TODO Remove
    communityVotes: async (
      parent,
      { procedure: procedureId, constituencies },
      { VoteModel, ProcedureModel },
    ) => {
      logger.graphql('Vote.query.communityVotes');
      const procedure = await ProcedureModel.findOne({ procedureId }, { _id: 1 });
      if (!procedure) {
        throw new Error(`Procedure could not be found. ID: ${procedureId}`);
      }

      // Find global result(cache), not including constituencies
      const votesGlobal = await VoteModel.aggregate([
        // Find Procedure
        {
          $match: {
            procedure: procedure._id,
            type: CONFIG.SMS_VERIFICATION ? 'Phone' : 'Device',
          },
        },
        // Sum both objects (state)
        {
          $group: {
            _id: '$procedure',
            yes: { $sum: '$votes.cache.yes' },
            no: { $sum: '$votes.cache.no' },
            abstination: { $sum: '$votes.cache.abstain' },
          },
        },
        // Remove _id from result
        {
          $project: {
            _id: false,
          },
        },
      ]);

      // Find constituency results if constituencies are given
      const votesConstituencies =
        (constituencies && constituencies.length > 0) || constituencies === undefined
          ? await VoteModel.aggregate([
              // Find Procedure, including type; results in up to two objects for state
              {
                $match: {
                  procedure: procedure._id,
                  type: CONFIG.SMS_VERIFICATION ? 'Phone' : 'Device',
                },
              },
              // Filter correct constituency
              {
                $project: {
                  votes: {
                    constituencies: {
                      $filter: {
                        input: '$votes.constituencies',
                        as: 'constituency',
                        cond: !constituencies
                          ? true // Return all Constituencies if constituencies param is not given
                          : { $in: ['$$constituency.constituency', constituencies] }, // Filter Constituencies if an array is given
                      },
                    },
                  },
                },
              },
              // Unwind constituencies for sum, but preserve null
              {
                $unwind: {
                  path: '$votes.constituencies',
                  preserveNullAndEmptyArrays: true,
                },
              },
              // Sum both objects (state)
              {
                $group: {
                  _id: '$votes.constituencies.constituency',
                  yes: { $sum: '$votes.constituencies.yes' },
                  no: { $sum: '$votes.constituencies.no' },
                  abstain: { $sum: '$votes.constituencies.abstain' },
                },
              },
              {
                $addFields: {
                  total: { $add: ['$yes', '$no', '$abstain'] },
                },
              },
              // Build correct result
              {
                $project: {
                  _id: false,
                  constituency: '$_id',
                  yes: '$yes',
                  no: '$no',
                  abstination: '$abstain',
                },
              },
            ])
              // TODO Change query to make the filter obsolet (preserveNullAndEmptyArrays)
              // Remove elements with property constituency: null (of no votes on it)
              .then((data) => data.filter(({ constituency }) => constituency))
          : [];

      if (votesGlobal.length > 0) {
        votesGlobal[0].constituencies = votesConstituencies;
        return votesGlobal[0];
      }
      return null;
    },
    voteStatistic: async (parent, args, { user, ProcedureModel, VoteModel, phone, device }) => {
      logger.graphql('Vote.query.voteStatistic', user.isVerified());
      if (!user.isVerified()) {
        return null;
      }

      const period = { $gte: CONFIG.MIN_PERIOD };

      // This query should reference the ProcedureModel Method isCompleted
      // TODO is that possible?
      const proceduresCount = await ProcedureModel.find({
        period,
        $or: [
          { voteDate: { $type: 'date' } },
          { currentStatus: { $in: PROCEDURE_STATES.COMPLETED } },
          {
            currentStatus: { $in: [PROCEDURE_DEFINITIONS.STATUS.BESCHLUSSEMPFEHLUNG] },
            voteDate: { $not: { $type: 'date' } },
          },
          {
            currentStatus: {
              $in: [
                PROCEDURE_DEFINITIONS.STATUS.BESCHLUSSEMPFEHLUNG,
                PROCEDURE_DEFINITIONS.STATUS.UEBERWIESEN,
              ],
            },
            voteDate: { $gte: new Date() },
          },
        ],
      }).count();

      const votedProcedures = await VoteModel.find(
        {
          type: CONFIG.SMS_VERIFICATION ? 'Phone' : 'Device',
          voters: {
            $elemMatch: {
              voter: CONFIG.SMS_VERIFICATION ? phone._id : device._id,
            },
          },
        },
        { procedure: 1 },
      ).count();

      return {
        proceduresCount,
        votedProcedures,
      };
    },
  },

  Mutation: {
    vote: async (
      parent,
      { procedure: procedureId, selection, constituency },
      { VoteModel, ProcedureModel, ActivityModel, DeviceModel, device, phone, ...restContext },
      info,
    ) => {
      logger.graphql('Vote.mutation.vote');
      // Find procedure
      const procedure = Types.ObjectId.isValid(procedureId)
        ? await ProcedureModel.findById(procedureId)
        : await ProcedureModel.findOne({ procedureId });
      // Fail if not existant or not votable
      if (!procedure) {
        throw new Error('Not votable');
      }
      // User Has Voted?
      const hasVoted = await VoteModel.findOne({
        procedure,
        type: CONFIG.SMS_VERIFICATION ? 'Phone' : 'Device',
        voters: {
          $elemMatch: {
            voter: CONFIG.SMS_VERIFICATION ? phone._id : device._id,
          },
        },
      });
      // Fail if user has already voted
      if (hasVoted) {
        logger.warn('User tried to vote twice - vote was not counted!');
        throw new Error('You have already voted');
      }
      // Decide Bucket to put user-vote in
      const state = procedure.isCompleted() ? 'COMPLETED' : 'VOTING';
      // Find & Create Vote Model if needed
      let vote = await VoteModel.findOne({
        procedure,
        type: CONFIG.SMS_VERIFICATION ? 'Phone' : 'Device',
        state,
      });
      if (!vote) {
        vote = await VoteModel.create({
          procedure,
          type: CONFIG.SMS_VERIFICATION ? 'Phone' : 'Device',
          state,
        });
      }
      // Add constituency bucket object if needed
      if (constituency) {
        await VoteModel.findByIdAndUpdate(vote._id, {
          $addToSet: {
            'votes.constituencies': {
              constituency,
            },
          },
        });
      }

      // Cast Vote
      const voteUpdate: MongooseFilterQuery<Vote> = {
        $push: {
          voters: {
            voter: CONFIG.SMS_VERIFICATION ? phone._id : device._id,
          },
        },
      };
      // Cache needs to be controlled manually
      switch (selection) {
        case 'YES':
          if (constituency) {
            voteUpdate.$inc = { 'votes.constituencies.$.yes': 1, 'votes.cache.yes': 1 };
          } else {
            voteUpdate.$inc = { 'votes.general.yes': 1, 'votes.cache.yes': 1 };
          }
          break;
        case 'NO':
          if (constituency) {
            voteUpdate.$inc = { 'votes.constituencies.$.no': 1, 'votes.cache.no': 1 };
          } else {
            voteUpdate.$inc = { 'votes.general.no': 1, 'votes.cache.no': 1 };
          }
          break;
        case 'ABSTINATION':
          if (constituency) {
            voteUpdate.$inc = { 'votes.constituencies.$.abstain': 1, 'votes.cache.abstain': 1 };
          } else {
            voteUpdate.$inc = { 'votes.general.abstain': 1, 'votes.cache.abstain': 1 };
          }
          break;

        default:
          throw new Error(`Invlaid Vote Selection: ${selection}`);
      }

      // Write Vote
      await VoteModel.updateOne(
        {
          _id: vote._id,
          // Add the constituency bucket selector conditionally
          ...(constituency && { 'votes.constituencies.constituency': constituency }),
        },
        { ...voteUpdate },
      );

      // Recalculate Votes Cache
      // TODO for performance we could also increase the counter by one instead
      const votes = await VoteModel.aggregate([
        // Find Procedure
        {
          $match: {
            procedure: procedure._id,
            type: CONFIG.SMS_VERIFICATION ? 'Phone' : 'Device',
          },
        },
        // Sum both objects (state)
        {
          $group: {
            _id: '$procedure',
            yes: { $sum: '$votes.cache.yes' },
            no: { $sum: '$votes.cache.no' },
            abstination: { $sum: '$votes.cache.abstain' },
          },
        },
        {
          $addFields: {
            total: { $add: ['$yes', '$no', '$abstination'] },
          },
        },
      ]);
      if (votes.length) {
        await ProcedureModel.findByIdAndUpdate(procedure._id, {
          votes: votes[0].total,
          'voteResults.communityVotes': {
            yes: votes[0].yes,
            no: votes[0].no,
            abstination: votes[0].abstination,
          },
        });
      }

      // Increate Activity
      if (
        ActivityApi.Mutation &&
        ActivityApi.Mutation.increaseActivity &&
        typeof ActivityApi.Mutation.increaseActivity === 'function'
      ) {
        await ActivityApi.Mutation.increaseActivity(
          parent,
          { procedureId },
          {
            ProcedureModel,
            ActivityModel,
            VoteModel,
            DeviceModel,
            phone,
            device,
            ...restContext,
          },
          info,
        );
      }

      // Autosubscribe to Pushs for this Procedure & User if the user has the outcomePushs-Setting enabled
      if (device.notificationSettings.outcomePushs) {
        await DeviceModel.updateOne(
          { _id: device._id },
          { $addToSet: { 'notificationSettings.procedures': procedure._id } },
        );
      }

      // Return new User Vote Results
      return queryVotes(
        parent,
        { procedure: procedure._id, constituencies: constituency ? [constituency] : null },
        {
          VoteModel,
          device,
          phone,
          ...restContext,
        },
      );
    },
  },
  VoteResult: {
    governmentDecision: (parent) => {
      const { yes, no } = parent;
      if (typeof yes === 'number' && typeof no === 'number') {
        return yes > no ? VoteSelection.Yes : VoteSelection.No;
      }
    },

    deputyVotes: async (
      voteResult,
      { constituencies, directCandidate, webIds },
      { DeputyModel },
    ) => {
      logger.graphql('VoteResult.deputyVotes');
      // Do we have a procedureId and not an empty array for constituencies?
      if (
        voteResult.procedureId &&
        ((constituencies && constituencies.length > 0) || constituencies === undefined)
      ) {
        // Match procedureId
        const match: MongooseFilterQuery<IDeputy> = {
          $match: {
            'votes.procedureId': voteResult.procedureId,
          },
        };
        // Match constituencies if present - else use all
        if (constituencies) {
          match.$match = { ...match.$match, constituency: { $in: constituencies } };
        }
        // Match for directCandidate
        if (directCandidate) {
          match.$match = { ...match.$match, directCandidate };
        }

        if (webIds) {
          match.$match = { ...match.$match, webId: { $in: webIds } };
        }

        // Query
        const deputies = await DeputyModel.aggregate<IDeputy>([
          match,
          { $addFields: { statusValue: { $indexOfArray: [webIds, '$webId'] } } },
          { $sort: { statusValue: 1 } },
        ]);

        // Construct result
        return deputies
          .reduce<
            {
              decision: VoteSelection;
              deputy: IDeputy;
            }[]
          >((pre, deputy) => {
            const pDeputyVote = deputy.votes.find(
              ({ procedureId }) => procedureId === voteResult.procedureId,
            );
            if (pDeputyVote) {
              const deputyVote = {
                decision: pDeputyVote.decision,
                deputy: deputy,
              };
              return [...pre, deputyVote];
            }
            return pre;
          }, [])
          .sort((a, b) => webIds.indexOf(a.deputy.webId) - webIds.indexOf(b.deputy.webId));
      }
      return [];
    },
  },
};
export default VoteApi;
