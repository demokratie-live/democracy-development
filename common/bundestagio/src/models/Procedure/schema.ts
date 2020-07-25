import {
  Schema,
  Document as MDocument,
  SchemaTimestampsConfig,
} from "mongoose";
import mongoosastic from "mongoosastic";
import diffHistory from "mongoose-diff-history/diffHistory";

import ProcessFlow, { IProcessFlow } from "./Procedure/ProcessFlow";
import Document, { IDocument } from "./Procedure/Document";
import PartyVotes, { IPartyVotes } from "./Procedure/PartyVotes";

enum VotingDocument {
  MainDocument = "mainDocument",
  RecommendedDecision = "recommendedDecision",
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
      es_indexed: true,
      es_type: "text",
    },
    type: {
      type: String,
      required: true,
      es_indexed: true,
      es_type: "text",
    },
    period: {
      type: Number,
      required: true,
      es_indexed: true,
      es_type: "integer",
    },
    title: {
      type: String,
      required: true,
      es_indexed: true,
      es_type: "text",
      analyzer: "german",
      es_fields: {
        completion: {
          type: "completion",
        },
        autocomplete: {
          type: "keyword",
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
      es_type: "text",
      analyzer: "german",
    },
    promulgation: [String],
    legalValidity: [String],
    tags: [
      {
        type: String,
        es_indexed: true,
        es_type: "text",
        analyzer: "german",
      },
    ],
    subjectGroups: [
      {
        type: String,
        es_indexed: true,
        es_type: "text",
        analyzer: "german",
      },
    ],
    importantDocuments: [Document],
    history: {
      type: [ProcessFlow],
      default: undefined,
      es_indexed: false,
      es_include_in_parent: true,
    },
    voteDate: Date,
    voteEnd: Date,
    customData: {
      title: {
        type: String,
        es_indexed: false,
      },
      voteResults: {
        yes: Number,
        no: Number,
        abstination: Number,
        notVoted: Number,
        decisionText: { type: String, es_indexed: false },
        votingDocument: {
          type: String,
          enum: ["mainDocument", "recommendedDecision"],
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
  { timestamps: true }
);

ProcedureSchema.index({
  "importantDocuments.url": 1,
  "importantDocuments.type": 1,
});

ProcedureSchema.plugin(diffHistory.plugin, { omit: ["updatedAt"] });
ProcedureSchema.plugin(mongoosastic, { host: process.env.ELASTICSEARCH_URL });

export default ProcedureSchema;
