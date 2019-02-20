import { Schema } from 'mongoose';

const ProcessFlowSchema = new Schema(
  {
    page: String,
    tenor: String,
    document: String,
    type: String,
    comment: String,
    foundation: String,
    majority: String,
  },
  { _id: false },
);

export default ProcessFlowSchema;
