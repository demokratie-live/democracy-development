import { Schema } from 'mongoose';
import mongoosastic from 'mongoosastic';
import diffHistory from 'mongoose-diff-history/diffHistory';

import ProcessFlow from './Procedure/ProcessFlow';
import Document from './Procedure/Document';
import PartyVotes from './Procedure/PartyVotes';

import CONFIG from '../../config';

const ProcedureSchema = new Schema(
  {
    procedureId: {
      type: String,
      index: { unique: true },
      es_indexed: true,
      es_type: 'text',
    },
    type: {
      type: String,
      required: true,
      es_indexed: true,
      es_type: 'text',
    },
    period: {
      type: Number,
      required: true,
      es_indexed: true,
      es_type: 'integer',
    },
    title: {
      type: String,
      required: true,
      es_indexed: true,
      es_type: 'text',
      analyzer: 'german',
      es_fields: {
        completion: {
          type: 'completion',
        },
        autocomplete: {
          type: 'keyword',
          index: true,
        },
      },
    },
    currentStatus: String,
    signature: String,
    gestOrderNumber: String,
    approvalRequired: [String],
    euDocNr: String,
    abstract: {
      type: String,
      es_indexed: true,
      es_type: 'text',
      analyzer: 'german',
    },
    promulgation: [String],
    legalValidity: [String],
    tags: [
      {
        type: String,
        es_indexed: true,
        es_type: 'text',
        analyzer: 'german',
      },
    ],
    subjectGroups: [
      {
        type: String,
        es_indexed: true,
        es_type: 'text',
        analyzer: 'german',
      },
    ],
    importantDocuments: [Document],
    history: {
      type: [ProcessFlow],
      default: undefined,
      es_indexed: false,
      es_include_in_parent: true,
    },
    customData: {
      title: {
        type: String,
        es_indexed: false,
      },
      expectedVotingDate: Date,
      possibleVotingDate: Date,
      voteResults: {
        yes: Number,
        no: Number,
        abstination: Number,
        notVoted: Number,
        decisionText: { type: String, es_indexed: false },
        votingDocument: {
          type: String,
          enum: ['mainDocument', 'recommendedDecision'],
        },
        votingRecommendation: Boolean,
        partyVotes: {
          type: [PartyVotes],
          es_indexed: false,
          es_include_in_parent: true,
        },
      },
    },
  },
  { timestamps: true },
);

ProcedureSchema.plugin(diffHistory.plugin, { omit: ['updatedAt'] });
ProcedureSchema.plugin(mongoosastic, { host: CONFIG.ELASTICSEARCH_URL });

export default ProcedureSchema;
