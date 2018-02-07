import { Schema } from 'mongoose';

const ProcessFlowSchema = new Schema(
  {
    procedureId: { type: String },
    assignment: { type: String },
    initiator: { type: String },
    findSpot: { type: String },
    findSpotUrl: { type: String },
    decisionTenor: { type: String },
    decision: { type: Object },
    date: { type: Date },
  },
  { timestamps: true },
);

export default ProcessFlowSchema;
