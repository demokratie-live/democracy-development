import mongoose, { Schema } from "mongoose";
import diffHistory from "mongoose-diff-history/diffHistory";

import ProcessFlow from "./Schemas/ProcessFlow";
import Document from "./Schemas/Document";

const ProcedureSchema = new Schema(
  {
    procedureId: { type: String, index: { unique: true } },
    type: { type: String, required: true },
    period: { type: Number, required: true },
    title: { type: String, required: true },
    currentStatus: String,
    signature: String,
    gestOrderNumber: String,
    approvalRequired: [String],
    euDocNr: String,
    abstract: String,
    promulgation: [String],
    legalValidity: [String],
    tags: [String],
    subjectGroups: [String],
    importantDocuments: [Document],
    history: { type: [ProcessFlow], default: undefined },
    customData: {
      title: String,
      expectedVotingDate: Date,
      voteResults: {
        yes: Number,
        no: Number,
        abstination: Number,
        decisionText: String,
        partyVotes: [
          {
            party: String,
            main: { type: String, enum: ["YES", "NO", "ABSTINATION"] },
            deviants: {
              yes: Number,
              abstination: Number,
              no: Number
            }
          }
        ]
      }
    }
  },
  { timestamps: true }
);

ProcedureSchema.plugin(diffHistory.plugin, { omit: ["updatedAt"] });

export default mongoose.model("Procedure", ProcedureSchema);
