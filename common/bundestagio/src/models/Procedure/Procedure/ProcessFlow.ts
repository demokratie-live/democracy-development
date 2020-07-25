import { Schema } from "mongoose";

import ProcessDecision, { IProcessDecision } from "./ProcessDecision";

export interface IProcessFlow {
  assignment?: string;
  initiator?: string;
  findSpot?: string;
  findSpotUrl?: string;
  decision: IProcessDecision[];
  abstract?: string;
  date?: Date;
}

const ProcessFlowSchema = new Schema<IProcessFlow>(
  {
    assignment: {
      type: String,
      es_type: "text",
    },
    initiator: {
      type: String,
      es_type: "text",
    },
    findSpot: {
      type: String,
      es_type: "text",
    },
    findSpotUrl: {
      type: String,
      es_type: "text",
    },
    decision: {
      type: [ProcessDecision],
      default: undefined,
      es_include_in_parent: true,
      es_indexed: false,
    },
    abstract: String,
    date: { type: Date },
  },
  { _id: false }
);

export default ProcessFlowSchema;
