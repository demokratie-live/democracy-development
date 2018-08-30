import { Schema } from 'mongoose';

import ProcessDecision from './ProcessDecision';

const ProcessFlowSchema = new Schema(
  {
    assignment: {
      type: String,
      es_type: 'text',
    },
    initiator: {
      type: String,
      es_type: 'text',
    },
    findSpot: {
      type: String,
      es_type: 'text',
    },
    findSpotUrl: {
      type: String,
      es_type: 'text',
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
  { _id: false },
);

export default ProcessFlowSchema;
