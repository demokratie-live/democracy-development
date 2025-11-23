import { Schema } from 'mongoose';

import ProcessDecision, { IProcessDecision } from './ProcessDecision';

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
    },
    initiator: {
      type: String,
    },
    findSpot: {
      type: String,
    },
    findSpotUrl: {
      type: String,
    },
    decision: {
      type: [ProcessDecision],
      default: undefined,
    },
    abstract: String,
    date: { type: Date },
  },
  { _id: false },
);

export default ProcessFlowSchema;
