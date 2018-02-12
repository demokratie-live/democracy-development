import { Schema } from 'mongoose';

import ProcessDecision from './ProcessDecision';

const ProcessFlowSchema = new Schema(
  {
    procedureId: { type: String },
    assignment: { type: String },
    initiator: { type: String },
    findSpot: { type: String },
    findSpotUrl: { type: String },
    decision: { type: [ProcessDecision], default: undefined },
    date: { type: Date },
  },
  { _id: false },
);

export default ProcessFlowSchema;
