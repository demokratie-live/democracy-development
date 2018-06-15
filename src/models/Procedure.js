import mongoose, { Schema } from "mongoose";
import mongoosastic from "mongoosastic";
import diffHistory from "mongoose-diff-history/diffHistory";

import ProcessFlow from "./Schemas/ProcessFlow";
import Document from "./Schemas/Document";
import PartyVotes from "./Schemas/PartyVotes";

import constants from "../config/constants";

const ProcedureSchema = new Schema(
  {
    procedureId: {
      type: String,
      index: { unique: true },
      es_indexed: true,
      es_type: "text"
    },
    type: {
      type: String,
      required: true,
      es_indexed: true,
      es_type: "text"
    },
    period: {
      type: Number,
      required: true,
      es_indexed: true,
      es_type: "integer"
    },
    title: {
      type: String,
      required: true,
      es_indexed: true,
      es_type: "text",
      analyzer: "german",
      es_fields: {
        completion: {
          type: "completion"
        },
        autocomplete: {
          type: "keyword",
          index: true
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
      es_type: "text",
      analyzer: "german"
    },
    promulgation: [String],
    legalValidity: [String],
    tags: [
      {
        type: String,
        es_indexed: true,
        es_type: "text",
        analyzer: "german"
      }
    ],
    subjectGroups: [
      {
        type: String,
        es_indexed: true,
        es_type: "text",
        analyzer: "german"
      }
    ],
    importantDocuments: [Document],
    history: {
      type: [ProcessFlow],
      default: undefined,
      es_indexed: false,
      es_include_in_parent: true
    },
    customData: {
      title: {
        type: String,
        es_indexed: false
      },
      expectedVotingDate: Date,
      voteResults: {
        yes: Number,
        no: Number,
        abstination: Number,
        decisionText: { type: String, es_indexed: false },
        partyVotes: {
          type: [PartyVotes],
          es_indexed: false,
          es_include_in_parent: true
        }
      }
    }
  },
  { timestamps: true }
);

ProcedureSchema.plugin(diffHistory.plugin, { omit: ["updatedAt"] });
ProcedureSchema.plugin(mongoosastic, { host: constants.ELASTICSEARCH_URL });

export { ProcedureSchema };

const Procedure = mongoose.model("Procedure", ProcedureSchema);

Procedure.createMapping({}, err => {
  if (err) {
    console.log(err);
  } else {
    let stream = Procedure.synchronize(),
      count = 0;
    stream.on("data", function() {
      count++;
    });

    new Promise((resolve, reject) => {
      stream.on("close", function() {
        console.log("indexed " + count + " documents!");
        resolve();
      });
      stream.on("error", function(err) {
        console.log("ERROR Elastic: ", err);
        reject();
      });
    });
  }
});

export default Procedure;
