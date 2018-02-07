import mongoose, { Schema } from 'mongoose';
import version from 'mongoose-version';

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
    history: [ProcessFlow],
  },
  { timestamps: true },
);

ProcedureSchema.plugin(version, { collection: 'Procedure__versions' });

export default mongoose.model('Procedure', ProcedureSchema);
