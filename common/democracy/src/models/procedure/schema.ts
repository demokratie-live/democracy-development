import { Schema, Document } from "mongoose";

import { PROCEDURE_STATES } from "../../utils/index";
import DocumentSchema, { ProcedureDocument } from "../document/schema";
import { Timestamps } from "../timestamp";
import { VoteSelection } from "../vote/types";

export interface PartyVotes {
  _id: false;
  party: string;
  main: VoteSelection;
  deviants: {
    yes: number;
    no: number;
    abstination: number;
    notVoted?: number | null;
  };
}

export interface IProcedure extends Document, Timestamps {
  procedureId: string;
  type: string;
  period: number;
  title: string;
  currentStatus?: string;
  currentStatusHistory: string[];
  abstract?: string;
  tags: string[];
  voteDate?: Date;
  voteEnd?: Date;
  voteWeek?: number;
  voteYear?: number;
  sessionTOPHeading?: string;
  submissionDate?: Date; // Date of the first dip21 history element
  lastUpdateDate?: Date; // Date of last dip21 history element for sorting in App
  subjectGroups: string[];
  importantDocuments: ProcedureDocument[];
  activities: number; // cache from activity collection
  votes: number; // cache from votes collection
  voteResults: {
    yes: number;
    no: number;
    abstination: number;
    notVoted?: number;
    decisionText?: string;
    namedVote?: boolean;
    partyVotes: PartyVotes[];
    communityVotes?: {
      yes?: number;
      no?: number;
      abstination?: number;
    };
  };
  // Resolver added
  active?: boolean;
  voted?: boolean;
  // methods
  isCompleted: () => boolean;
}

const ProcedureSchema = new Schema<IProcedure>(
  {
    procedureId: { type: String, index: { unique: true } },
    type: { type: String, required: true },
    period: { type: Number, required: true },
    title: { type: String, required: true },
    currentStatus: String,
    currentStatusHistory: [String],
    abstract: String,
    tags: [String],
    voteDate: Date,
    voteEnd: Date,
    voteWeek: Number,
    voteYear: Number,
    sessionTOPHeading: String,
    submissionDate: Date, // Date of the first dip21 history element
    lastUpdateDate: Date, // Date of last dip21 history element for sorting in App
    subjectGroups: [String],
    importantDocuments: [DocumentSchema],
    activities: { type: Number, default: 0 }, // cache from activity collection
    votes: { type: Number, default: 0 }, // cache from votes collection
    voteResults: {
      yes: { type: Number, required: true },
      no: { type: Number, required: true },
      abstination: { type: Number, required: true },
      notVoted: { type: Number },
      decisionText: String,
      namedVote: Boolean,
      partyVotes: [
        {
          _id: false,
          party: { type: String, required: true },
          main: {
            type: String,
            enum: ["YES", "NO", "ABSTINATION", "NOTVOTED"],
            required: true,
          },

          deviants: {
            yes: { type: Number, required: true },
            no: { type: Number, required: true },
            abstination: { type: Number, required: true },
            notVoted: { type: Number },
          },
        },
      ],
      communityVotes: {
        yes: Number,
        no: Number,
        abstination: Number,
      },
    },
  },
  { timestamps: true }
);

ProcedureSchema.methods.isCompleted = function () {
  return !!(
    this.voteDate ||
    PROCEDURE_STATES.COMPLETED.some((s) => s === this.currentStatus)
  );
};

ProcedureSchema.index(
  {
    procedureId: "text",
    title: "text",
    abstract: "text",
    tags: "text",
    subjectGroups: "text",
  },
  {
    name: "searchIndex",
    default_language: "german",
    weights: {
      title: 10,
      abstract: 5,
    },
  }
);

ProcedureSchema.index({ voteDate: -1 }, { background: true });
ProcedureSchema.index({ period: -1 }, { background: true });
ProcedureSchema.index({ votes: -1 }, { background: true });

export default ProcedureSchema;
