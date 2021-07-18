import { FilterQuery, MongooseFilterQuery } from 'mongoose';
import { parseResolveInfo } from 'graphql-parse-resolve-info';
import { Resolvers, VoteSelection } from '../../generated/graphql';
import {
  IProcedure,
  DeputyModel,
  IDeputy,
  IDeputyVote,
} from '@democracy-deutschland/democracy-common';
import { reduce } from 'p-iteration';
import { logger } from '../../services/logger';

const DeputyApi: Resolvers = {
  Query: {
    deputiesOfConstituency: async (parent, { constituency, directCandidate = false }) => {
      const query: MongooseFilterQuery<IDeputy> = {
        constituency,
      };
      if (directCandidate) {
        // returns only directCandidate
        query.directCandidate = true;
      }
      return DeputyModel.find(query);
    },
    deputies: async (_parent, { limit = 10, offset = 0, filterTerm, filterIds, excludeIds }) => {
      if (limit > 100) {
        throw new Error('limit must not exceed 100');
      }
      const conditions: FilterQuery<IDeputy> = {};
      if (filterTerm) {
        conditions.name = { $regex: new RegExp(filterTerm, 'i') };
      }
      if (filterIds) {
        conditions.id = { $in: filterIds };
      }
      if (excludeIds) {
        conditions.id = { $nin: excludeIds };
      }
      return DeputyModel.find(conditions).sort({ name: 1 }).limit(limit).skip(offset);
    },
  },
  Deputy: {
    totalProcedures: ({ votes }) => votes.length,
    procedures: async (
      { votes },
      { procedureIds, offset = 0, pageSize = 9999999 },
      { ProcedureModel },
      info,
    ) => {
      logger.graphql('Deputy.field.procedures');
      const requestedFields = parseResolveInfo(info);
      let didRequestOnlyProcedureId = false;
      if (
        requestedFields &&
        requestedFields.name === 'procedures' &&
        'procedure' in requestedFields.fieldsByTypeName.DeputyProcedure &&
        'procedureId' in
          requestedFields.fieldsByTypeName.DeputyProcedure.procedure.fieldsByTypeName.Procedure &&
        Object.keys(
          requestedFields.fieldsByTypeName.DeputyProcedure.procedure.fieldsByTypeName.Procedure,
        ).length === 1
      ) {
        didRequestOnlyProcedureId = true;
      }

      // if procedureIds is given filter procedures to given procedureIds
      const filteredVotes = votes.filter(({ procedureId: pId }) =>
        procedureIds ? procedureIds.includes(pId) : true,
      );

      // flattern procedureId's
      const procedureIdsSelected = filteredVotes.map(({ procedureId }) => procedureId);

      // get needed procedure Data only from votes object
      if (didRequestOnlyProcedureId) {
        const returnValue = reduce<
          IDeputyVote,
          {
            procedure: Pick<IProcedure, 'procedureId'>;
            decision: VoteSelection;
          }[]
        >(
          filteredVotes,
          async (prev, { procedureId, decision }) => {
            const procedure = { procedureId };
            if (procedure) {
              const deputyProcedure = {
                procedure,
                decision,
              };

              return [...prev, deputyProcedure];
            }
            return prev;
          },
          [],
        ).then((r) => r.slice(offset as number, (offset as number) + (pageSize as number)));
        // .slice(offset, offset + pageSize);

        return returnValue;
      }

      if (!offset) {
        offset = 0;
      }

      // if need more procedure data get procedure object from database
      const procedures = await ProcedureModel.find({ procedureId: { $in: procedureIdsSelected } })
        .sort({
          voteDate: -1,
          title: 1,
        })
        .limit(pageSize || 9999999)
        .skip(offset);

      const result = await Promise.all(
        procedures.map(async (procedure) => {
          const p = await filteredVotes.find(
            ({ procedureId }) => procedure.procedureId === procedureId,
          );
          return {
            decision: p?.decision,
            procedure: { ...procedure.toObject(), activityIndex: undefined, voted: undefined },
          };
        }),
      );

      return result;
    },
  },
};

export default DeputyApi;
