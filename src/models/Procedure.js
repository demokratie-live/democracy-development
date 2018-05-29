import mongoose, { Schema } from "mongoose";
import mongoosastic from "mongoosastic";
import diffHistory from "mongoose-diff-history/diffHistory";

import ProcessFlow from "./Schemas/ProcessFlow";
import Document from "./Schemas/Document";

import constants from "../config/constants";

const ProcedureSchema = new Schema(
  {
    procedureId: {
      type: String,
      index: { unique: true },
      es_indexed: true,
      es_fields: {
        folded: {
          type: "text",
          analyzer: "german"
        }
      }
    },
    type: { type: String, required: true },
    period: { type: Number, required: true },
    title: {
      type: String,
      required: true,
      es_indexed: true,
      es_fields: {
        folded: {
          type: "text",
          analyzer: "german"
        }
      }
    },
    currentStatus: String,
    signature: String,
    gestOrderNumber: String,
    approvalRequired: [String],
    euDocNr: String,
    abstract: {
      type: String,
      es_indexed: true,
      es_fields: {
        folded: {
          type: "text",
          analyzer: "german"
        }
      }
    },
    promulgation: [String],
    legalValidity: [String],
    tags: [
      {
        type: String,
        es_indexed: true,
        es_fields: {
          folded: {
            type: "text",
            analyzer: "german"
          }
        }
      }
    ],
    subjectGroups: [
      {
        type: String,
        es_indexed: true,
        es_fields: {
          folded: {
            type: "text",
            analyzer: "german"
          }
        }
      }
    ],
    importantDocuments: [Document],
    history: { type: [ProcessFlow], default: undefined },
    customData: {
      title: String,
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
ProcedureSchema.plugin(mongoosastic, { host: constants.ELASTICSEARCH_URL });

export { ProcedureSchema };

export default mongoose.model("Procedure", ProcedureSchema);
