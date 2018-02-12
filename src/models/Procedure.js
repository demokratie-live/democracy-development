import mongoose, { Schema } from 'mongoose';
import diffHistory from 'mongoose-diff-history/diffHistory';

import ProcessFlow from './Schemas/ProcessFlow';

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
    history: { type: [ProcessFlow], default: undefined },
  },
  { timestamps: true },
);

ProcedureSchema.plugin(diffHistory.plugin, { omit: ['updatedAt'] });

export default mongoose.model('Procedure', ProcedureSchema);
