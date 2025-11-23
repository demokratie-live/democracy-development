import { Schema, Document as MDocument, SchemaTimestampsConfig } from 'mongoose';

import ProcessFlow, { IProcessFlow } from './Procedure/ProcessFlow';
import Document, { IDocument } from './Procedure/Document';
import PartyVotes, { IPartyVotes } from './Procedure/PartyVotes';
import PlenumSchema from './Procedure/Plenum';

enum VotingDocument {
  MainDocument = 'mainDocument',
  RecommendedDecision = 'recommendedDecision',
}

export interface IProcedure extends MDocument, SchemaTimestampsConfig {
  procedureId: string;
  type: string;
  period: number;
  title: string;
  currentStatus?: string;
  signature?: string;
  gestOrderNumber?: string;
  approvalRequired?: string[];
  euDocNr?: string;
  abstract?: string;
  promulgation?: string[];
  legalValidity?: string[];
  tags?: string[];
  subjectGroups?: string[];
  importantDocuments: IDocument[];
  history: IProcessFlow[];
  voteDate: Date;
  voteEnd: Date;
  customData?: {
    title?: string;
    voteResults: {
      yes: number;
      no: number;
      abstination: number;
      notVoted: number;
      decisionText: string;
      votingDocument: VotingDocument;
      votingRecommendation: boolean;
      partyVotes: IPartyVotes[];
    };
  };
}

const ProcedureSchema = new Schema(
  {
    procedureId: {
      type: String,
      index: { unique: true },
    },
    type: {
      type: String,
      required: true,
    },
    period: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    initiative: [String],
    currentStatus: String,
    signature: String,
    gestOrderNumber: String,
    approvalRequired: [String],
    euDocNr: String,
    abstract: {
      type: String,
    },
    promulgation: [String],
    legalValidity: [String],
    tags: [String],
    subjectGroups: [String],
    importantDocuments: [Document],
    plenums: [PlenumSchema],
    history: {
      type: [ProcessFlow],
      default: undefined,
    },
    voteDate: Date,
    voteEnd: Date,
    customData: {
      title: {
        type: String,
      },
      voteResults: {
        yes: Number,
        no: Number,
        abstination: Number,
        notVoted: Number,
        decisionText: { type: String },
        votingDocument: {
          type: String,
          enum: ['mainDocument', 'recommendedDecision'],
        },
        votingRecommendation: Boolean,
        partyVotes: {
          type: [PartyVotes],
        },
      },
    },
  },
  { timestamps: true },
);

ProcedureSchema.index({
  'importantDocuments.url': 1,
  'importantDocuments.type': 1,
});

// https://github.com/demokratie-live/democracy-client/issues/1340
// ProcedureSchema.plugin(diffHistory.plugin, { omit: ["updatedAt"] });

export default ProcedureSchema;
